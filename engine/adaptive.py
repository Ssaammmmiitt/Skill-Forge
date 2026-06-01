import sys
import os

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import *

def adjust_difficulty(recent_sessions: list, current_difficulty: int) -> int:
    """Adjusts the difficulty level based on the mean accuracy of the last DIFFICULTY_LOOKBACK sessions.
    If the lookback session count is insufficient, the difficulty remains unchanged.
    Returns the updated difficulty level.
    """
    if len(recent_sessions) < DIFFICULTY_LOOKBACK:
        return current_difficulty
        
    lookback = recent_sessions[:DIFFICULTY_LOOKBACK]
    mean_accuracy = sum(s.quiz_score / 100.0 for s in lookback) / DIFFICULTY_LOOKBACK
    
    if mean_accuracy > DIFFICULTY_UP_THRESHOLD:
        return min(DIFFICULTY_MAX, current_difficulty + 1)
    elif mean_accuracy < DIFFICULTY_DOWN_THRESHOLD:
        return max(DIFFICULTY_MIN, current_difficulty - 1)
    else:
        return current_difficulty

def get_learning_path(learning_style: str, difficulty: int) -> dict:
    """Generates a learning path recommendation dict based on the student's learning style
    and current difficulty level.
    """
    if learning_style == STYLE_FAST:
        task_types = ["advanced_problems", "timed_quiz"]
        focus = "Push limits with harder problems"
    elif learning_style == STYLE_SLOW:
        task_types = ["flashcards", "mcq", "spaced_repetition"]
        focus = "Build confidence through repetition"
    elif learning_style == STYLE_CONCEPTUAL:
        task_types = ["essay", "diagram", "deep_dive"]
        focus = "Understanding over memorization"
    elif learning_style == STYLE_MEMORIZER:
        task_types = ["flashcards", "mcq"]
        focus = "Speed and recall"
    else:
        task_types = ["mcq", "flashcards"]
        focus = "Discovering your learning style"
        
    if difficulty <= 3:
        difficulty_label = "Beginner"
    elif difficulty <= 7:
        difficulty_label = "Intermediate"
    else:
        difficulty_label = "Advanced"
        
    # Standard selection of next topics from fixed list
    next_topics = ["mathematics", "physics"]
    
    return {
        "task_types": task_types,
        "focus": focus,
        "next_topics": next_topics,
        "difficulty_label": difficulty_label
    }

if __name__ == "__main__":
    # Test difficulty adjuster
    class FakeSession:
        def __init__(self, score): self.quiz_score = score
        
    sessions = [FakeSession(90), FakeSession(88), FakeSession(92)]
    result = adjust_difficulty(sessions, 5)
    assert result == 6, f"Expected 6, got {result}"

    sessions2 = [FakeSession(40), FakeSession(50), FakeSession(45)]
    result2 = adjust_difficulty(sessions2, 5)
    assert result2 == 4, f"Expected 4, got {result2}"

    path = get_learning_path("conceptual", 6)
    assert "essay" in path["task_types"]
    print("adaptive.py — smoke test PASSED")
