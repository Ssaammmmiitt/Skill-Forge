import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.models import get_db, insert_student, insert_session, Student, Session
import numpy as np
import pandas as pd
import random
import uuid
from datetime import datetime, timezone

# Topics list
TOPICS = [
    "mathematics", "physics", "history", "biology", "literature",
    "chemistry", "geography", "computer_science", "economics", "philosophy"
]

# Style profiles
PROFILES = {
    "fast_learner": {
        "score_range": (80.0, 100.0),
        "time_range": (30.0, 90.0),
        "mistakes_range": (0, 2),
        "difficulty_range": (6, 10)
    },
    "slow_learner": {
        "score_range": (45.0, 70.0),
        "time_range": (180.0, 300.0),
        "mistakes_range": (5, 12),
        "difficulty_range": (1, 4)
    },
    "conceptual": {
        "score_range": (70.0, 92.0),
        "time_range": (120.0, 200.0),
        "mistakes_range": (1, 4),
        "difficulty_range": (4, 8)
    },
    "memorization": {
        "score_range": (75.0, 95.0),
        "time_range": (35.0, 80.0),
        "mistakes_range": (0, 3),
        "difficulty_range": (3, 7)
    }
}

def get_or_create_student(conn, style: str) -> Student:
    """Queries for an existing average student for the given learning style.
    Creates and inserts one if not found.
    """
    row = conn.execute("SELECT * FROM students WHERE learning_style = ?", (style,)).fetchone()
    if row:
        return Student(
            student_id=row["student_id"],
            name=row["name"],
            INT=row["INT"],
            WIS=row["WIS"],
            energy=row["energy"],
            xp=row["xp"],
            level=row["level"],
            learning_style=row["learning_style"],
            streak=row["streak"],
            created_at=row["created_at"]
        )
    
    # Determine default attributes depending on style for realistic synthetic records
    student = Student(
        name=f"Average {style.replace('_', ' ').title()}",
        learning_style=style
    )
    insert_student(conn, student)
    conn.commit()
    return student

def generate_session(style: str, student_id: str) -> tuple[Session, dict]:
    """Generates a synthetic session conforming to the learning style profile rules,
    injects random noise, applies clamping and rounding constraints, and returns a Session
    along with its dictionary representation.
    """
    profile = PROFILES[style]
    
    # Generate baseline values
    score = random.uniform(*profile["score_range"])
    time_taken = random.uniform(*profile["time_range"])
    mistakes = random.randint(*profile["mistakes_range"])
    difficulty = random.randint(*profile["difficulty_range"])
    topic = random.choice(TOPICS)
    
    # Add noise
    score *= random.uniform(0.92, 1.08)
    time_taken *= random.uniform(0.92, 1.08)
    mistakes *= random.uniform(0.92, 1.08)
    
    # Hard clamp
    score = min(100.0, max(0.0, score))
    time_taken = min(360.0, max(20.0, time_taken))
    mistakes = min(20.0, max(0.0, mistakes))
    
    # Round
    score = round(score, 1)
    time_taken = int(round(time_taken))
    mistakes = int(round(mistakes))
    
    session_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    
    session = Session(
        session_id=session_id,
        student_id=student_id,
        quiz_score=score,
        time_taken=time_taken,
        mistakes=mistakes,
        topic=topic,
        difficulty=difficulty,
        timestamp=timestamp
    )
    
    session_dict = {
        "session_id": session_id,
        "student_id": student_id,
        "quiz_score": score,
        "time_taken": time_taken,
        "mistakes": mistakes,
        "topic": topic,
        "difficulty": difficulty,
        "learning_style": style,
        "timestamp": timestamp
    }
    
    return session, session_dict

def main():
    conn = get_db()
    try:
        # Prepare cache for style-based student mappings
        students_by_style = {}
        for style in PROFILES.keys():
            students_by_style[style] = get_or_create_student(conn, style)
            
        sessions_list = []
        
        # Balanced loop: generate exactly 50 per learning style (200 total)
        for style, student in students_by_style.items():
            for _ in range(50):
                session, session_dict = generate_session(style, student.student_id)
                insert_session(conn, session)
                sessions_list.append(session_dict)
                
        # Commit transaction
        conn.commit()
        
        # Save to CSV (skill_forge/data + optional root data/ for ML scripts)
        df = pd.DataFrame(sessions_list)
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_paths = [os.path.join(root, "skill_forge", "data", "training_data.csv")]
        for csv_path in csv_paths:
            os.makedirs(os.path.dirname(csv_path), exist_ok=True)
            df.to_csv(csv_path, index=False)
        
        # Print summary
        counts = df["learning_style"].value_counts()
        print("fast_learner:    {} rows".format(counts.get("fast_learner", 0)))
        print("slow_learner:    {} rows".format(counts.get("slow_learner", 0)))
        print("conceptual:      {} rows".format(counts.get("conceptual", 0)))
        print("memorization:    {} rows".format(counts.get("memorization", 0)))
        print("Total:          {} rows".format(len(df)))
        print("SYNTHETIC DATA READY -")
        for p in csv_paths:
            print(f"  {p}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
