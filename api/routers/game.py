import dataclasses
import random
import uuid
from datetime import datetime, timezone

import numpy as np
from fastapi import APIRouter, Query
from pydantic import BaseModel

from api.deps import DbConn
from api.responses import error, success
from data.models import (
    ActivityLog,
    Session,
    get_activity_totals_for_date,
    get_sessions_by_student,
    get_student_by_id,
    insert_activity_log,
    insert_session,
    update_student,
)
from engine.adaptive import adjust_difficulty
from engine.attributes import compute_task_effects, update_attributes
from engine.behavioral_metrics import build_behavioral_metrics
from engine.cognitive import build_cognitive_profile
from engine.game_master import build_game_master
from engine.rewards import award_xp, update_streak

from engine.quiz_shuffle import shuffle_question_pool

from api.data.questions import QUESTIONS_BY_LEVEL, QUIZ_QUESTIONS_PER_SESSION

router = APIRouter(prefix="/api", tags=["game"])


def _difficulty_to_level(difficulty: int) -> int:
    if difficulty <= 3:
        return 1
    if difficulty <= 7:
        return 5
    return 10


def prepare_shuffled_questions(level, topic: str | None = None):
    if topic:
        topic_lower = topic.lower().strip()
        topic_pool = []
        # First, collect questions of the exact topic and requested level
        level_questions = [q for q in QUESTIONS_BY_LEVEL.get(level, []) if q.get("topic") == topic_lower]
        topic_pool.extend(level_questions)
        
        # If we need more questions, collect from other levels
        if len(topic_pool) < QUIZ_QUESTIONS_PER_SESSION:
            other_levels = [l for l in QUESTIONS_BY_LEVEL.keys() if l != level]
            # Sort other levels by absolute difference from requested level to get closest difficulty first
            other_levels.sort(key=lambda l: abs(l - level))
            for ol in other_levels:
                ol_questions = [q for q in QUESTIONS_BY_LEVEL.get(ol, []) if q.get("topic") == topic_lower]
                topic_pool.extend(ol_questions)
                if len(topic_pool) >= QUIZ_QUESTIONS_PER_SESSION:
                    break
        
        # If we found questions of this topic, use them
        if topic_pool:
            # Ensure unique questions by id
            seen = set()
            unique_pool = []
            for q in topic_pool:
                if q["id"] not in seen:
                    unique_pool.append(q)
                    seen.add(q["id"])
            
            count = min(QUIZ_QUESTIONS_PER_SESSION, len(unique_pool))
            original_qs = random.sample(unique_pool, count)
            return shuffle_question_pool(original_qs)

    pool = list(QUESTIONS_BY_LEVEL[level])
    count = min(QUIZ_QUESTIONS_PER_SESSION, len(pool))
    original_qs = random.sample(pool, count)
    return shuffle_question_pool(original_qs)


class LogActivityBody(BaseModel):
    student_id: str | None = None
    activity: str | None = None
    value: float | None = None
    activity_date: str | None = None  # YYYY-MM-DD, defaults to UTC today


class QuizSubmitBody(BaseModel):
    student_id: str | None = None
    answers: list | None = None
    difficulty: int | None = None
    time_taken: int | None = None


def _student_attributes(student) -> dict:
    return {
        "logic": student.INT,
        "memory": min(100, round(student.INT * 0.55 + student.WIS * 0.25)),
        "attention": student.energy,
        "comprehension": student.WIS,
        "problem_solving": min(100, round((student.INT + student.WIS) / 2)),
        "wisdom": student.WIS,
    }


@router.get("/student/{student_id}/activity-totals")
def get_activity_totals(
    student_id: str,
    conn: DbConn,
    activity_date: str | None = Query(default=None),
):
    student = get_student_by_id(conn, student_id)
    if student is None:
        return error("Student not found", 404)

    date_str = activity_date or datetime.now(timezone.utc).date().isoformat()
    totals = get_activity_totals_for_date(conn, student_id, date_str)
    return success({"activity_date": date_str, **totals})


@router.get("/student/{student_id}")
def get_student(student_id: str, conn: DbConn):
    student = get_student_by_id(conn, student_id)
    if student is None:
        return error("Student not found", 404)

    sessions = get_sessions_by_student(conn, student_id)
    profile = build_cognitive_profile(student, sessions)
    payload = dataclasses.asdict(student)
    payload["suggested_difficulty"] = profile["suggested_difficulty"]
    payload["sessions_completed"] = len(sessions)
    payload["attributes"] = _student_attributes(student)
    payload["learning_path"] = profile["learning_path"]
    payload["learning_style"] = profile["learning_style"]
    return success(payload)


@router.post("/student/log-activity")
def log_activity(body: LogActivityBody, conn: DbConn):
    if not body.student_id or not body.activity or body.value is None:
        return error("Missing required fields", 400)

    if body.activity not in ["study", "sleep", "task_done"]:
        return error("Invalid activity type", 400)

    try:
        value = float(body.value)
    except (ValueError, TypeError):
        return error("Value must be a number", 400)

    if value <= 0:
        return error("Value must be greater than 0", 400)

    student = get_student_by_id(conn, body.student_id)
    if student is None:
        return error("Student not found", 404)

    activity_date = body.activity_date or datetime.now(timezone.utc).date().isoformat()
    daily_totals = get_activity_totals_for_date(conn, body.student_id, activity_date)

    updated_student, delta, notes = update_attributes(
        student,
        body.activity,
        value,
        activity_date=activity_date,
        daily_totals=daily_totals,
    )

    log_value = value
    if body.activity == "task_done":
        log_value = float(
            compute_task_effects(
                value,
                daily_totals.get("tasks_rewarded_today", 0.0),
            )["rewarded_tasks"]
        )

    if any(delta.values()):
        insert_activity_log(
            conn,
            ActivityLog(
                student_id=body.student_id,
                activity=body.activity,
                value=log_value,
                activity_date=activity_date,
                int_delta=delta["INT"],
                wis_delta=delta["WIS"],
                energy_delta=delta["energy"],
            ),
        )
        update_student(conn, updated_student)
        conn.commit()
    else:
        conn.commit()

    return success(
        {
            "updated_attributes": {
                "INT": updated_student.INT,
                "WIS": updated_student.WIS,
                "energy": updated_student.energy,
            },
            "delta": delta,
            "notes": notes,
        }
    )


@router.get("/quiz/{difficulty}")
def get_quiz(difficulty: int, topic: str | None = Query(default=None)):
    if difficulty < 1 or difficulty > 10:
        return error("Difficulty must be between 1 and 10", 400)

    level = _difficulty_to_level(difficulty)
    questions = prepare_shuffled_questions(level, topic)
    return success({"questions": questions, "difficulty": difficulty})


@router.post("/quiz/submit")
def submit_quiz(body: QuizSubmitBody, conn: DbConn):
    if (
        not body.student_id
        or not isinstance(body.answers, list)
        or body.difficulty is None
        or body.time_taken is None
    ):
        return error("Missing required fields", 400)

    if len(body.answers) == 0:
        return error("Answers list cannot be empty", 400)

    try:
        difficulty = int(body.difficulty)
        time_taken = int(body.time_taken)
    except (ValueError, TypeError):
        return error("Difficulty and time_taken must be integers", 400)

    student = get_student_by_id(conn, body.student_id)
    if student is None:
        return error("Student not found", 404)

    correct_count = 0
    for ans in body.answers:
        chosen = ans.get("chosen_index")
        correct = ans.get("correct_index")
        if chosen is not None and correct is not None and int(chosen) == int(correct):
            correct_count += 1

    total = len(body.answers)
    score = (correct_count / total) * 100.0
    mistakes = total - correct_count

    for ans in body.answers:
        chosen = ans.get("chosen_index")
        correct = ans.get("correct_index")
        got_correct = (
            chosen is not None
            and correct is not None
            and int(chosen) == int(correct)
        )
        student = update_streak(student, got_correct)

    first_topic = body.answers[0].get("topic", "mixed")
    session = Session(
        session_id=str(uuid.uuid4()),
        student_id=body.student_id,
        quiz_score=round(score, 1),
        time_taken=time_taken,
        mistakes=mistakes,
        topic=first_topic,
        difficulty=difficulty,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    insert_session(conn, session)

    before_xp = student.xp
    all_events = []

    student, events = award_xp(student, "quiz_complete")
    all_events.extend(events)

    if score == 100.0:
        student, events = award_xp(student, "perfect_score")
        all_events.extend(events)

    if student.streak == 3:
        student, events = award_xp(student, "streak_3")
        all_events.extend(events)
    elif student.streak == 5:
        student, events = award_xp(student, "streak_5")
        all_events.extend(events)

    xp_earned = student.xp - before_xp

    recent = get_sessions_by_student(conn, body.student_id)
    recent_sorted = sorted(recent, key=lambda s: s.timestamp, reverse=True)
    new_difficulty = adjust_difficulty(recent_sorted, difficulty)

    cognitive = build_cognitive_profile(
        student,
        recent,
        latest_score=score,
        latest_time_taken=time_taken,
        latest_mistakes=mistakes,
        latest_difficulty=new_difficulty,
        quiz_answers=body.answers,
    )
    student.learning_style = cognitive["learning_style"]
    # Persist the computed topic weakness so the dashboard shows the same value
    topic_weakness = cognitive["behavioral"].get("topic_weakness")
    if topic_weakness:
        student.topic_weakness = topic_weakness
    game_master = build_game_master(cognitive)

    update_student(conn, student)
    conn.commit()

    return success(
        {
            "score": round(score, 1),
            "xp_earned": xp_earned,
            "events": list(dict.fromkeys(all_events)),
            "new_level": student.level,
            "new_difficulty": new_difficulty,
            "learning_style": student.learning_style,
            "learning_path": cognitive["learning_path"],
            "game_master": game_master,
            "cognitive": {
                "confidence": cognitive["confidence"],
                "model_agreement": cognitive["model_agreement"],
                "predictions": cognitive["predictions"],
                "explanations": cognitive["explanations"],
                "probabilities": cognitive["probabilities"],
                "behavioral": cognitive["behavioral"],
            },
            "student": dataclasses.asdict(student),
        }
    )


@router.get("/cognitive/{student_id}")
def get_cognitive_profile(student_id: str, conn: DbConn):
    student = get_student_by_id(conn, student_id)
    if student is None:
        return error("Student not found", 404)

    sessions = get_sessions_by_student(conn, student_id)
    profile = build_cognitive_profile(student, sessions)
    profile["game_master"] = build_game_master(profile)
    return success(profile)


@router.get("/leaderboard")
def get_leaderboard(
    conn: DbConn,
    sort_by: str = Query(default="xp"),
):
    if sort_by not in ["xp", "INT", "WIS"]:
        sort_by = "xp"

    query = f"SELECT name, xp, level, learning_style, INT, WIS FROM students ORDER BY {sort_by} DESC LIMIT 10"
    rows = conn.execute(query).fetchall()

    leaderboard = []
    for rank, row in enumerate(rows, 1):
        leaderboard.append(
            {
                "rank": rank,
                "name": row["name"],
                "xp": row["xp"],
                "level": row["level"],
                "learning_style": row["learning_style"],
                "INT": row["INT"],
                "WIS": row["WIS"],
            }
        )

    return success({"leaderboard": leaderboard})


def _analytics_payload(student, sessions: list, cognitive: dict) -> dict:
    behavioral_export = build_behavioral_metrics(student, sessions, cognitive)
    game_master = build_game_master(cognitive)
    cognitive_summary = {
        "learning_style": cognitive["learning_style"],
        "confidence": cognitive["confidence"],
        "model_agreement": cognitive.get("model_agreement", False),
        "explanations": cognitive.get("explanations", []),
        "probabilities": cognitive.get("probabilities", {}),
        "topic_weakness": cognitive["behavioral"]["topic_weakness"],
        "pace_score": cognitive["behavioral"]["pace_score"],
        "score_velocity": cognitive["behavioral"]["score_velocity"],
    }

    radar = {
        "INT": student.INT,
        "WIS": student.WIS,
        "energy": student.energy,
        "xp_normalized": min(100, student.xp // 10),
        "level_normalized": min(100, student.level * 10),
        "pace_score": int(cognitive["behavioral"]["pace_score"]),
        "consistency_score": int(cognitive["behavioral"]["consistency_score"]),
    }

    if len(sessions) < 2:
        return {
            "score_trend": [],
            "difficulty_trend": [],
            "time_trend": [],
            "style_history": cognitive["style_history"],
            "consistency_score": cognitive["behavioral"]["consistency_score"],
            "radar": radar,
            "cognitive_summary": cognitive_summary,
            "learning_path": cognitive["learning_path"],
            "game_master": game_master,
            "behavioral_metrics": behavioral_export,
        }

    sessions_sorted = sorted(sessions, key=lambda s: s.timestamp)
    return {
        "score_trend": [s.quiz_score for s in sessions_sorted[-10:]],
        "difficulty_trend": [s.difficulty for s in sessions_sorted[-10:]],
        "time_trend": [s.time_taken for s in sessions_sorted[-10:]],
        "style_history": cognitive["style_history"],
        "consistency_score": cognitive["behavioral"]["consistency_score"],
        "radar": radar,
        "cognitive_summary": cognitive_summary,
        "learning_path": cognitive["learning_path"],
        "game_master": game_master,
        "behavioral_metrics": behavioral_export,
    }


@router.get("/analytics/{student_id}")
def get_analytics(student_id: str, conn: DbConn):
    student = get_student_by_id(conn, student_id)
    if student is None:
        return error("Student not found", 404)

    sessions = get_sessions_by_student(conn, student_id)
    cognitive = build_cognitive_profile(student, sessions)
    return success(_analytics_payload(student, sessions, cognitive))
