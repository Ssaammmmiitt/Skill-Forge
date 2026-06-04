import sys
import os
import dataclasses

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import *
from data.models import Student

def award_xp(student: Student, event: str, streak: int = 0) -> tuple[Student, list[str]]:
    """Awards XP to a student depending on the event type.
    Checks for level ups based on XP milestones and updates the student's level.
    Returns a copy of the updated Student instance and a list of events fired.
    """
    new_student = dataclasses.replace(student)
    events_fired = []
    
    xp_to_add = 0
    if event == "quiz_complete":
        xp_to_add = XP_QUIZ_COMPLETE
        events_fired.append("quiz_complete")
    elif event == "perfect_score":
        xp_to_add = XP_PERFECT_SCORE
        events_fired.append("perfect_score")
    elif event == "streak_3":
        xp_to_add = XP_STREAK_3
        events_fired.append("streak_3")
    elif event == "streak_5":
        xp_to_add = XP_STREAK_5
        events_fired.append("streak_5")
        
    new_student.xp += xp_to_add
    
    # Calculate new level: level is 1-indexed, starting at 1 for [0, 499] XP
    new_level = 1 + (new_student.xp // XP_PER_LEVEL)
    if new_level > new_student.level:
        events_fired.append("level_up")
        new_student.xp += XP_LEVEL_UP
        new_student.level = new_level
        
    return new_student, events_fired

def update_streak(student: Student, got_correct: bool) -> Student:
    """Updates the consecutive correct answer streak for a student.
    Returns a copy of the updated Student instance.
    """
    new_student = dataclasses.replace(student)
    if got_correct:
        new_student.streak += 1
    else:
        new_student.streak = 0
    return new_student

if __name__ == "__main__":
    from data.models import Student
    s = Student(student_id="t", name="T", INT=50, WIS=50, energy=80,
                xp=490, level=1, learning_style="unknown", streak=2,
                created_at="2025-01-01T00:00:00")
    s2, events = award_xp(s, "quiz_complete")
    s2, events2 = award_xp(s2, "perfect_score")
    assert "level_up" in events or "level_up" in events2, "Level up should fire"
    print("rewards.py - smoke test PASSED")
