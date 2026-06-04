import sys
import os
import dataclasses

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import *
from data.models import Student

def update_attributes(student: Student, activity: str, value: float) -> Student:
    """Updates student INT, WIS, or energy depending on activity.
    Clamps attributes strictly within ATTR_MIN and ATTR_MAX.
    Returns a copy of the updated Student instance.
    """
    # Clone the student instance to avoid in-place mutations
    new_student = dataclasses.replace(student)
    
    if activity == "study":
        new_student.INT += value * INT_PER_STUDY_MIN
    elif activity == "sleep":
        new_student.energy += value * ENERGY_PER_SLEEP_H
    elif activity == "task_done":
        new_student.WIS += value * WIS_PER_TASK
        
    # Clamp and round/convert attributes to integer
    new_student.INT = int(round(min(ATTR_MAX, max(ATTR_MIN, new_student.INT))))
    new_student.WIS = int(round(min(ATTR_MAX, max(ATTR_MIN, new_student.WIS))))
    new_student.energy = int(round(min(ATTR_MAX, max(ATTR_MIN, new_student.energy))))
    
    return new_student

def get_attribute_delta(before: Student, after: Student) -> dict:
    """Returns a dictionary mapping of standard attribute changes."""
    return {
        "INT": after.INT - before.INT,
        "WIS": after.WIS - before.WIS,
        "energy": after.energy - before.energy
    }

if __name__ == "__main__":
    # Quick smoke test
    from data.models import Student
    s = Student(student_id="test", name="Test", INT=50, WIS=50, energy=50,
                xp=0, level=1, learning_style="unknown", streak=0,
                created_at="2025-01-01T00:00:00")
    s2 = update_attributes(s, "study", 30)   # 30 min study
    assert s2.INT == 62, f"Expected 62, got {s2.INT}"
    print("attributes.py - smoke test PASSED")
