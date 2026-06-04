import sys
import os
import sqlite3
import pytest
import dataclasses

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from api.app import create_app
from data.models import create_tables, Student, Session, insert_student, insert_session, get_db


@pytest.fixture
def client(monkeypatch):
    """Pytest fixture with in-memory DB and FastAPI test client."""
    db_conn = sqlite3.connect(":memory:", check_same_thread=False)
    db_conn.row_factory = sqlite3.Row
    db_conn.execute("PRAGMA journal_mode=WAL")
    db_conn.execute("PRAGMA foreign_keys=ON")
    create_tables(db_conn)

    fixture_student = Student(
        student_id="fixture_id",
        name="Fixture Student",
        INT=50,
        WIS=50,
        energy=50,
        xp=0,
        level=1,
        learning_style="unknown",
        streak=0,
        created_at="2025-01-01T00:00:00",
    )
    insert_student(db_conn, fixture_student)

    for i in range(1, 6):
        session = Session(
            session_id=f"session_{i}",
            student_id="fixture_id",
            quiz_score=float(60 + i * 5),
            time_taken=60 - i * 5,
            mistakes=5 - i,
            topic="mathematics",
            difficulty=3,
            timestamp=f"2025-01-01T00:0{i}:00",
        )
        insert_session(db_conn, session)

    db_conn.commit()

    def mock_get_db():
        return db_conn

    monkeypatch.setattr("data.models.get_db", mock_get_db)
    monkeypatch.setattr("api.deps._get_db", mock_get_db)

    app = create_app()
    with TestClient(app) as test_client:
        yield test_client

    db_conn.close()


def test_get_student_found(client):
    response = client.get("/api/student/fixture_id")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert res_data["data"]["name"] == "Fixture Student"


def test_get_student_not_found(client):
    response = client.get("/api/student/nonexistent_id")
    assert response.status_code == 404
    res_data = response.json()
    assert res_data["data"] is None
    assert res_data["error"] == "Student not found"


def test_log_activity_study(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "study",
        "value": 30.0,
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert res_data["data"]["delta"]["INT"] > 0
    assert res_data["data"]["delta"]["energy"] < 0
    assert res_data["data"]["updated_attributes"]["INT"] > 50


def test_log_activity_bad_type(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "bad_activity",
        "value": 30.0,
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 400
    res_data = response.json()
    assert res_data["data"] is None
    assert res_data["error"] is not None


def test_log_activity_missing_field(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "study",
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 400
    res_data = response.json()
    assert res_data["data"] is None
    assert res_data["error"] == "Missing required fields"


def test_get_quiz_valid_difficulty(client):
    response = client.get("/api/quiz/5")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert len(res_data["data"]["questions"]) == 5


def test_get_quiz_invalid_difficulty(client):
    response = client.get("/api/quiz/11")
    assert response.status_code == 400
    res_data = response.json()
    assert res_data["data"] is None
    assert res_data["error"] is not None


def test_submit_quiz_valid(client):
    payload = {
        "student_id": "fixture_id",
        "answers": [
            {"question_id": "q6", "chosen_index": 0, "correct_index": 0, "topic": "geography"},
            {"question_id": "q7", "chosen_index": 1, "correct_index": 1, "topic": "geography"},
            {"question_id": "q8", "chosen_index": 2, "correct_index": 2, "topic": "mathematics"},
            {"question_id": "q9", "chosen_index": 2, "correct_index": 2, "topic": "literature"},
            {"question_id": "q10", "chosen_index": 1, "correct_index": 1, "topic": "chemistry"},
        ],
        "difficulty": 5,
        "time_taken": 45,
    }
    response = client.post("/api/quiz/submit", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert isinstance(res_data["data"]["score"], (int, float))
    assert res_data["data"]["xp_earned"] >= 50


def test_submit_quiz_missing_answers(client):
    payload = {
        "student_id": "fixture_id",
        "difficulty": 5,
        "time_taken": 45,
    }
    response = client.post("/api/quiz/submit", json=payload)
    assert response.status_code == 400
    res_data = response.json()
    assert res_data["data"] is None
    assert res_data["error"] is not None


def test_leaderboard_returns_list(client):
    response = client.get("/api/leaderboard?sort_by=xp")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert isinstance(res_data["data"]["leaderboard"], list)
    assert len(res_data["data"]["leaderboard"]) > 0


def test_analytics_empty_student(client):
    import data.models

    conn = data.models.get_db()
    empty_student = Student(
        student_id="empty_id",
        name="Empty Student",
        INT=50,
        WIS=50,
        energy=50,
        xp=0,
        level=1,
        learning_style="unknown",
        streak=0,
        created_at="2025-01-01T00:00:00",
    )
    insert_student(conn, empty_student)
    conn.commit()

    response = client.get("/api/analytics/empty_id")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert res_data["data"]["score_trend"] == []
    assert res_data["data"]["consistency_score"] == 0.0


def test_daily_todos_crud(client):
    task_date = "2026-06-04"
    create = client.post(
        "/api/todos",
        json={
            "student_id": "fixture_id",
            "task_date": task_date,
            "label": "Read chapter 3",
        },
    )
    assert create.status_code == 200
    todo_id = create.json()["data"]["todo_id"]

    listing = client.get(f"/api/todos/fixture_id?date={task_date}")
    assert listing.status_code == 200
    assert listing.json()["data"]["total"] >= 1

    patch = client.patch(
        f"/api/todos/{todo_id}",
        json={"completed": True},
    )
    assert patch.status_code == 200
    assert patch.json()["data"]["completed"] is True


def test_cognitive_profile(client):
    response = client.get("/api/cognitive/fixture_id")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    data = res_data["data"]
    assert "learning_style" in data
    assert "behavioral" in data
    assert "learning_path" in data
    assert "confidence" in data
    assert "game_master" in data
    assert data["game_master"]["title"] == "GAME MASTER"


def test_analytics_behavioral_and_game_master(client):
    response = client.get("/api/analytics/fixture_id")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "game_master" in data
    assert "focus" in data["game_master"]
    metrics = data["behavioral_metrics"]
    assert isinstance(metrics["table"], list)
    assert len(metrics["table"]) >= 1
    assert isinstance(metrics["chart"], list)
    assert "summary" in metrics


def test_ml_comparison_unavailable_without_csv(client):
    response = client.get("/api/ml/comparison")
    if response.status_code == 200:
        data = response.json()["data"]
        assert "models" in data
        assert isinstance(data["models"], list)
    else:
        assert response.status_code == 503


def test_username_suggestions(client):
    response = client.post(
        "/api/auth/username/suggestions",
        json={"first_name": "John"},
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert len(res_data["data"]["suggestions"]) > 0


def test_get_quiz_with_topic(client):
    # Test valid topic filtering
    response = client.get("/api/quiz/5?topic=physics")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    questions = res_data["data"]["questions"]
    assert len(questions) == 5
    # Verify that it filtered and prioritized physics questions
    # Note: Physics questions exist, so at least some should be physics (our backend pulls and shuffles)
    physics_questions = [q for q in questions if q["topic"] == "physics"]
    assert len(physics_questions) > 0

    # Test fallback behavior with a nonexistent topic
    response = client.get("/api/quiz/5?topic=nonexistent")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["error"] is None
    assert len(res_data["data"]["questions"]) == 5
