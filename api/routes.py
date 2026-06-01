import sys
import os
import pickle
import uuid
import random
import dataclasses
import numpy as np
import pandas as pd
from flask import Blueprint, request
from datetime import datetime, timezone

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.middleware import success, error
from data.models import get_db, get_student_by_id, get_sessions_by_student, insert_session, update_student, Session
from engine.attributes import update_attributes, get_attribute_delta
from engine.rewards import award_xp, update_streak
from engine.adaptive import adjust_difficulty, get_learning_path
from config import *

# Define Blueprint
api_bp = Blueprint("api", __name__, url_prefix="/api")

# Question Bank dict
QUESTION_BANK = {
    1: [  # easy
        {"id": "q1", "question": "What is 2+2?", "options": ["3", "4", "5", "6"], "correct_index": 1, "topic": "mathematics"},
        {"id": "q2", "question": "What color is the sky?", "options": ["red", "blue", "green", "yellow"], "correct_index": 1, "topic": "geography"},
        {"id": "q3", "question": "How many sides does a triangle have?", "options": ["2", "3", "4", "5"], "correct_index": 1, "topic": "mathematics"},
        {"id": "q4", "question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct_index": 2, "topic": "geography"},
        {"id": "q5", "question": "What is H2O?", "options": ["Air", "Water", "Fire", "Earth"], "correct_index": 1, "topic": "chemistry"}
    ],
    5: [  # medium
        {"id": "q6", "question": "What is the capital of Italy?", "options": ["Rome", "Venice", "Milan", "Florence"], "correct_index": 0, "topic": "geography"},
        {"id": "q7", "question": "Which planet is known as the Red Planet?", "options": ["Earth", "Mars", "Venus", "Jupiter"], "correct_index": 1, "topic": "geography"},
        {"id": "q8", "question": "What is 5 * 6?", "options": ["25", "30", "35", "40"], "correct_index": 1, "topic": "mathematics"},
        {"id": "q9", "question": "Who wrote 'Romeo and Juliet'?", "options": ["Shakespeare", "Dickens", "Hemingway", "Tolkien"], "correct_index": 0, "topic": "literature"},
        {"id": "q10", "question": "What is the chemical symbol for Gold?", "options": ["Ag", "Fe", "Au", "Pb"], "correct_index": 2, "topic": "chemistry"}
    ],
    10: [ # hard
        {"id": "q11", "question": "What is the derivative of x^2?", "options": ["x", "2", "2x", "x^2"], "correct_index": 2, "topic": "mathematics"},
        {"id": "q12", "question": "What is the speed of light?", "options": ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], "correct_index": 0, "topic": "physics"},
        {"id": "q13", "question": "Who formulated the general theory of relativity?", "options": ["Newton", "Galileo", "Einstein", "Hawking"], "correct_index": 2, "topic": "physics"},
        {"id": "q14", "question": "What is the capital of Australia?", "options": ["Sydney", "Melbourne", "Canberra", "Brisbane"], "correct_index": 2, "topic": "geography"},
        {"id": "q15", "question": "What is the powerhouse of the cell?", "options": ["Nucleus", "Mitochondria", "Ribosome", "Lysosome"], "correct_index": 1, "topic": "biology"}
    ]
}

# Load ML model preprocessors globally at module level
DT_MODEL_PATH = "models/saved/dt_model.pkl"
SCALER_PATH = "models/saved/scaler.pkl"
LE_PATH = "models/saved/label_encoder.pkl"

clf = None
scaler = None
label_encoder = None

def load_ml_models():
    global clf, scaler, label_encoder
    try:
        # Import CustomLabelEncoder so pickle unpickling can resolve it
        from models.features import CustomLabelEncoder
        
        if os.path.exists(DT_MODEL_PATH):
            with open(DT_MODEL_PATH, "rb") as f:
                clf = pickle.load(f)
        if os.path.exists(SCALER_PATH):
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
        if os.path.exists(LE_PATH):
            with open(LE_PATH, "rb") as f:
                label_encoder = pickle.load(f)
    except Exception as e:
        print(f"Warning: Could not load ML models globally: {e}")

# Call load helper
load_ml_models()

def prepare_shuffled_questions(level):
    original_qs = QUESTION_BANK[level]
    shuffled_qs = []
    for q in original_qs:
        copied_q = dict(q)
        options = list(copied_q["options"])
        correct_option = options[copied_q["correct_index"]]
        
        # Shuffle options randomly
        random.shuffle(options)
        
        # Recalculate correct_index
        new_correct_index = options.index(correct_option)
        
        copied_q["options"] = options
        copied_q["correct_index"] = new_correct_index
        shuffled_qs.append(copied_q)
        
    return shuffled_qs

# ── GET /api/student/<student_id> ──────────────────────────────────────────────
@api_bp.route("/student/<student_id>", methods=["GET"])
def get_student(student_id):
    conn = get_db()
    try:
        student = get_student_by_id(conn, student_id)
        if student is None:
            return error("Student not found", 404)
        return success(dataclasses.asdict(student))
    finally:
        conn.close()

# ── POST /api/student/log-activity ─────────────────────────────────────────────
@api_bp.route("/student/log-activity", methods=["POST"])
def log_activity():
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    activity = data.get("activity")
    value = data.get("value")
    
    # 1. Validate presence
    if not student_id or not activity or value is None:
        return error("Missing required fields", 400)
        
    # 2. Validate allowed activity
    if activity not in ["study", "sleep", "task_done"]:
        return error("Invalid activity type", 400)
        
    try:
        value = float(value)
    except (ValueError, TypeError):
        return error("Value must be a number", 400)
        
    # 3. Load student
    conn = get_db()
    try:
        student = get_student_by_id(conn, student_id)
        if student is None:
            return error("Student not found", 404)
            
        # 4. Update attributes
        updated_student = update_attributes(student, activity, value)
        
        # 5. Get delta
        delta = get_attribute_delta(student, updated_student)
        
        # 6. Update student database entry
        update_student(conn, updated_student)
        conn.commit()
        
        # 7. Return
        return success({
            "updated_attributes": {
                "INT": updated_student.INT,
                "WIS": updated_student.WIS,
                "energy": updated_student.energy
            },
            "delta": delta
        })
    finally:
        conn.close()

# ── GET /api/quiz/<int:difficulty> ─────────────────────────────────────────────
@api_bp.route("/quiz/<int:difficulty>", methods=["GET"])
def get_quiz(difficulty):
    # Validate difficulty 1-10
    if difficulty < 1 or difficulty > 10:
        return error("Difficulty must be between 1 and 10", 400)
        
    if difficulty <= 3:
        level = 1
    elif difficulty <= 7:
        level = 5
    else:
        level = 10
        
    questions = prepare_shuffled_questions(level)
    return success({"questions": questions})

# ── POST /api/quiz/submit ───────────────────────────────────────────────────────
@api_bp.route("/quiz/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    answers = data.get("answers")
    difficulty = data.get("difficulty")
    time_taken = data.get("time_taken")
    
    # 1. Validate fields
    if not student_id or not isinstance(answers, list) or difficulty is None or time_taken is None:
        return error("Missing required fields", 400)
        
    if len(answers) == 0:
        return error("Answers list cannot be empty", 400)
        
    try:
        difficulty = int(difficulty)
        time_taken = int(time_taken)
    except (ValueError, TypeError):
        return error("Difficulty and time_taken must be integers", 400)
        
    # Load Student
    conn = get_db()
    try:
        student = get_student_by_id(conn, student_id)
        if student is None:
            return error("Student not found", 404)
            
        # 2. Compute score
        correct_count = 0
        for ans in answers:
            chosen = ans.get("chosen_index")
            correct = ans.get("correct_index")
            if chosen is not None and correct is not None and int(chosen) == int(correct):
                correct_count += 1
                
        total = len(answers)
        score = (correct_count / total) * 100.0
        
        # 3. Count mistakes
        mistakes = total - correct_count
        
        # 5. Update streak
        for ans in answers:
            chosen = ans.get("chosen_index")
            correct = ans.get("correct_index")
            got_correct = (chosen is not None and correct is not None and int(chosen) == int(correct))
            student = update_streak(student, got_correct)
            
        # 6. Build Session
        session_id = str(uuid.uuid4())
        # Pick topic of the first question, default to "mixed"
        first_topic = answers[0].get("topic", "mixed")
        timestamp = datetime.now(timezone.utc).isoformat()
        
        session = Session(
            session_id=session_id,
            student_id=student_id,
            quiz_score=round(score, 1),
            time_taken=time_taken,
            mistakes=mistakes,
            topic=first_topic,
            difficulty=difficulty,
            timestamp=timestamp
        )
        insert_session(conn, session)
        
        # 7. Award XP
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
        
        # 8. Adjust difficulty
        recent = get_sessions_by_student(conn, student_id)
        recent_sorted = sorted(recent, key=lambda s: s.timestamp, reverse=True)
        new_difficulty = adjust_difficulty(recent_sorted, difficulty)
        
        # 9. Predict learning style
        if clf is not None and scaler is not None and label_encoder is not None:
            raw_features = np.array([[score, time_taken, mistakes, difficulty, score / 100.0]])
            scaled_features = scaler.transform(raw_features)
            pred_class = clf.predict(scaled_features)[0]
            pred_style = label_encoder.inverse_transform([pred_class])[0]
            student.learning_style = pred_style
            
        # 10. Save updated student
        update_student(conn, student)
        conn.commit()
        
        # 11. Return
        return success({
            "score": round(score, 1),
            "xp_earned": xp_earned,
            "events": list(dict.fromkeys(all_events)),  # Unique preserving order
            "new_level": student.level,
            "new_difficulty": new_difficulty,
            "learning_style": student.learning_style,
            "student": dataclasses.asdict(student)
        })
    finally:
        conn.close()

# ── GET /api/leaderboard ────────────────────────────────────────────────────────
@api_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    sort_by = request.args.get("sort_by", "xp")
    if sort_by not in ["xp", "INT", "WIS"]:
        sort_by = "xp"
        
    conn = get_db()
    try:
        query = f"SELECT name, xp, level, learning_style, INT, WIS FROM students ORDER BY {sort_by} DESC LIMIT 10"
        rows = conn.execute(query).fetchall()
        
        leaderboard = []
        for rank, row in enumerate(rows, 1):
            leaderboard.append({
                "rank": rank,
                "name": row["name"],
                "xp": row["xp"],
                "level": row["level"],
                "learning_style": row["learning_style"],
                "INT": row["INT"],
                "WIS": row["WIS"]
            })
            
        return success({"leaderboard": leaderboard})
    finally:
        conn.close()

# ── GET /api/analytics/<student_id> ─────────────────────────────────────────────
@api_bp.route("/analytics/<student_id>", methods=["GET"])
def get_analytics(student_id):
    conn = get_db()
    try:
        student = get_student_by_id(conn, student_id)
        if student is None:
            return error("Student not found", 404)
            
        sessions = get_sessions_by_student(conn, student_id)
        
        # If student has < 2 sessions, return empty lists and zeros
        if len(sessions) < 2:
            return success({
                "score_trend": [],
                "difficulty_trend": [],
                "time_trend": [],
                "style_history": {
                    "fast_learner": 0, "slow_learner": 0,
                    "conceptual": 0, "memorization": 0
                },
                "consistency_score": 0.0,
                "radar": {
                    "INT": student.INT,
                    "WIS": student.WIS,
                    "energy": student.energy,
                    "xp_normalized": min(100, student.xp // 10),
                    "level_normalized": min(100, student.level * 10)
                }
            })
            
        # Chronological sorting
        sessions_sorted = sorted(sessions, key=lambda s: s.timestamp)
        
        score_trend = [s.quiz_score for s in sessions_sorted[-10:]]
        difficulty_trend = [s.difficulty for s in sessions_sorted[-10:]]
        time_trend = [s.time_taken for s in sessions_sorted[-10:]]
        
        # style_history: count per learning_style across all sessions by running dynamic prediction
        style_history = {
            "fast_learner": 0, "slow_learner": 0,
            "conceptual": 0, "memorization": 0
        }
        if clf is not None and scaler is not None and label_encoder is not None:
            for s in sessions:
                raw = np.array([[s.quiz_score, s.time_taken, s.mistakes, s.difficulty, s.quiz_score / 100.0]])
                scaled = scaler.transform(raw)
                pred_class = clf.predict(scaled)[0]
                pred_style = label_encoder.inverse_transform([pred_class])[0]
                if pred_style in style_history:
                    style_history[pred_style] += 1
        else:
            # Fallback to current style
            style_history[student.learning_style] = len(sessions)
            
        # consistency_score: 100 - (std dev of last 5 scores)
        last_5_scores = [s.quiz_score for s in sessions_sorted[-5:]]
        std_dev = np.std(last_5_scores) if len(last_5_scores) >= 2 else 0.0
        consistency_score = float(min(100.0, max(0.0, 100.0 - std_dev)))
        
        radar = {
            "INT": student.INT,
            "WIS": student.WIS,
            "energy": student.energy,
            "xp_normalized": min(100, student.xp // 10),
            "level_normalized": min(100, student.level * 10)
        }
        
        return success({
            "score_trend": score_trend,
            "difficulty_trend": difficulty_trend,
            "time_trend": time_trend,
            "style_history": style_history,
            "consistency_score": round(consistency_score, 2),
            "radar": radar
        })
    finally:
        conn.close()

# ── GET /api/admin/metrics ───────────────────────────────────────────────────────
@api_bp.route("/admin/metrics", methods=["GET"])
def get_metrics():
    CSV_PATH = "reports/model_comparison.csv"
    if not os.path.exists(CSV_PATH):
        return error("Models not yet evaluated — run models/compare.py", 503)
        
    df = pd.read_csv(CSV_PATH)
    metrics = df.to_dict(orient="records")
    return success({"metrics": metrics})

# ── POST /api/admin/retrain ──────────────────────────────────────────────────────
@api_bp.route("/admin/retrain", methods=["POST"])
def retrain_models():
    import subprocess
    
    # Run Decision Tree and PyTorch MLP training sequentially in background
    cmd = f"{sys.executable} models/decision_tree.py && {sys.executable} models/neural_net.py && {sys.executable} models/compare.py"
    subprocess.Popen(cmd, shell=True)
    
    return success({
        "status": "retrain_started",
        "message": "Model retraining and evaluation pipeline initiated in the background."
    })

def register_routes(app):
    """Registers the API blueprint to the Flask app."""
    app.register_blueprint(api_bp)
