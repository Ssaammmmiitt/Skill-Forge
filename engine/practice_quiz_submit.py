"""Shared submit path for practice quizzes (custom + document reader)."""

from api.data.subjects import DIFFICULTY_LEVELS
from data.models import get_student_by_id, update_student
from engine.custom_quiz_rewards import apply_custom_quiz_rewards, compute_custom_quiz_rewards
from engine.rewards import award_xp, update_streak


def document_difficulty_to_level(difficulty: int) -> int:
    """Map document reader difficulty (1-10) to practice level (1-3)."""
    d = max(1, min(10, int(difficulty)))
    if d <= 3:
        return 1
    if d <= 7:
        return 2
    return 3


def submit_practice_quiz(
    conn,
    *,
    student_id: str,
    answers: list,
    difficulty_level: int,
    filename: str | None = None,
    subject: str | None = None,
    chapter: str | None = None,
) -> dict:
    """
    Award XP, streak, and small INT/WIS gains.
    Does NOT insert sessions or update adaptive learning metrics.
    """
    if difficulty_level not in DIFFICULTY_LEVELS:
        raise ValueError("difficulty_level must be 1, 2, or 3")

    student = get_student_by_id(conn, student_id)
    if student is None:
        raise LookupError("Student not found")

    correct_count = 0
    for ans in answers:
        chosen = ans.get("chosen_index")
        correct = ans.get("correct_index")
        if chosen is not None and correct is not None and int(chosen) == int(correct):
            correct_count += 1

    total = len(answers)
    score = (correct_count / total) * 100.0

    for ans in answers:
        chosen = ans.get("chosen_index")
        correct = ans.get("correct_index")
        got_correct = (
            chosen is not None
            and correct is not None
            and int(chosen) == int(correct)
        )
        student = update_streak(student, got_correct)

    before_xp = student.xp
    all_events: list[str] = []

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

    rewards = compute_custom_quiz_rewards(
        score, difficulty_level, correct_count, total
    )
    student, attr_delta = apply_custom_quiz_rewards(student, rewards)

    update_student(conn, student)
    conn.commit()

    return {
        "score": round(score, 1),
        "xp_earned": xp_earned,
        "events": list(dict.fromkeys(all_events)),
        "new_level": student.level,
        "attribute_delta": attr_delta,
        "rewards": rewards,
        "practice_mode": True,
        "filename": filename,
        "subject": subject,
        "chapter": chapter,
        "student": {
            "student_id": student.student_id,
            "name": student.name,
            "xp": student.xp,
            "level": student.level,
            "streak": student.streak,
            "INT": student.INT,
            "WIS": student.WIS,
            "energy": student.energy,
            "learning_style": student.learning_style,
            "topic_weakness": student.topic_weakness,
        },
    }
