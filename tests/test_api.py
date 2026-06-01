import sys
import os
import sqlite3
import pytest
import dataclasses

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.app import create_app
from data.models import create_tables, Student, Session, insert_student, insert_session, get_db

@pytest.fixture
def client(monkeypatch):
    """Pytest fixture setting up a fresh in-memory database and yielding a mock Flask test client."""
    # Create the in-memory SQLite connection
    db_conn = sqlite3.connect(":memory:")
    db_conn.row_factory = sqlite3.Row
    
    # Initialize basic settings
    db_conn.execute("PRAGMA journal_mode=WAL")
    db_conn.execute("PRAGMA foreign_keys=ON")
    
    # Create tables
    create_tables(db_conn)
    
    # Seed one test student
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
        created_at="2025-01-01T00:00:00"
    )
    insert_student(db_conn, fixture_student)
    
    # Seed 5 historic sessions for the student
    for i in range(1, 6):
        session = Session(
            session_id=f"session_{i}",
            student_id="fixture_id",
            quiz_score=float(60 + i * 5),  # 65.0, 70.0, 75.0, 80.0, 85.0
            time_taken=60 - i * 5,
            mistakes=5 - i,
            topic="mathematics",
            difficulty=3,
            timestamp=f"2025-01-01T00:0{i}:00"
        )
        insert_session(db_conn, session)
        
    db_conn.commit()
    
    # Mock function to return our in-memory connection
    def mock_get_db():
        return db_conn
        
    # Monkeypatch the get_db provider in both modules
    monkeypatch.setattr("data.models.get_db", mock_get_db)
    monkeypatch.setattr("api.routes.get_db", mock_get_db)
    
    app = create_app()
    app.config["TESTING"] = True
    
    with app.test_client() as test_client:
        yield test_client
        
    # Clean up
    db_conn.close()

# ── GET /api/student/<student_id> ──────────────────────────────────────────────

def test_get_student_found(client):
    response = client.get("/api/student/fixture_id")
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert res_data["data"]["name"] == "Fixture Student"

def test_get_student_not_found(client):
    response = client.get("/api/student/nonexistent_id")
    assert response.status_code == 404
    res_data = response.get_json()
    assert res_data["data"] is None
    assert res_data["error"] == "Student not found"

# ── POST /api/student/log-activity ─────────────────────────────────────────────

def test_log_activity_study(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "study",
        "value": 30.0
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert res_data["data"]["delta"]["INT"] > 0
    assert res_data["data"]["updated_attributes"]["INT"] > 50

def test_log_activity_bad_type(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "bad_activity",
        "value": 30.0
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 400
    res_data = response.get_json()
    assert res_data["data"] is None
    assert res_data["error"] is not None

def test_log_activity_missing_field(client):
    payload = {
        "student_id": "fixture_id",
        "activity": "study"
    }
    response = client.post("/api/student/log-activity", json=payload)
    assert response.status_code == 400
    res_data = response.get_json()
    assert res_data["data"] is None
    assert res_data["error"] == "Missing required fields"

# ── GET /api/quiz/<difficulty> ─────────────────────────────────────────────────

def test_get_quiz_valid_difficulty(client):
    response = client.get("/api/quiz/5")
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert len(res_data["data"]["questions"]) == 5

def test_get_quiz_invalid_difficulty(client):
    response = client.get("/api/quiz/11")
    assert response.status_code == 400
    res_data = response.get_json()
    assert res_data["data"] is None
    assert res_data["error"] is not None

# ── POST /api/quiz/submit ───────────────────────────────────────────────────────

def test_submit_quiz_valid(client):
    payload = {
        "student_id": "fixture_id",
        "answers": [
            {"question_id": "q6", "chosen_index": 0, "correct_index": 0, "topic": "geography"},
            {"question_id": "q7", "chosen_index": 1, "correct_index": 1, "topic": "geography"},
            {"question_id": "q8", "chosen_index": 2, "correct_index": 2, "topic": "mathematics"},
            {"question_id": "q9", "chosen_index": 2, "correct_index": 2, "topic": "literature"},
            {"question_id": "q10", "chosen_index": 1, "correct_index": 1, "topic": "chemistry"}
        ],
        "difficulty": 5,
        "time_taken": 45
    }
    response = client.post("/api/quiz/submit", json=payload)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert isinstance(res_data["data"]["score"], (int, float))
    assert res_data["data"]["xp_earned"] >= 50

def test_submit_quiz_missing_answers(client):
    payload = {
        "student_id": "fixture_id",
        "difficulty": 5,
        "time_taken": 45
    }
    response = client.post("/api/quiz/submit", json=payload)
    assert response.status_code == 400
    res_data = response.get_json()
    assert res_data["data"] is None
    assert res_data["error"] is not None

# ── GET /api/leaderboard ────────────────────────────────────────────────────────

def test_leaderboard_returns_list(client):
    response = client.get("/api/leaderboard?sort_by=xp")
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert isinstance(res_data["data"]["leaderboard"], list)
    assert len(res_data["data"]["leaderboard"]) > 0

# ── GET /api/analytics/<student_id> ─────────────────────────────────────────────

def test_analytics_empty_student(client):
    # Insert a new clean student with no session history
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
        created_at="2025-01-01T00:00:00"
    )
    insert_student(conn, empty_student)
    conn.commit()
    
    response = client.get("/api/analytics/empty_id")
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["error"] is None
    assert res_data["data"]["score_trend"] == []
    assert res_data["data"]["consistency_score"] == 0.0

# ── GET /api/admin/metrics ───────────────────────────────────────────────────────

def test_admin_metrics_no_csv(client):
    # Returns 200 if reports/model_comparison.csv exists, or 503 if not. Ensure it never throws 500.
    response = client.get("/api/admin/metrics")
    assert response.status_code in [200, 503]
