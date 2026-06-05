from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from api.data.subjects import DIFFICULTY_LEVELS, SUBJECT_CATALOG, SUBJECT_LIST
from api.deps import DbConn, get_current_user_id
from api.exceptions import ApiError
from api.responses import error, success
from api.services.groq_custom_quiz import CUSTOM_QUIZ_MAX_QUESTIONS, generate_custom_quiz
from data.models import get_student_by_id, update_student
from engine.custom_quiz_rewards import apply_custom_quiz_rewards, compute_custom_quiz_rewards
from engine.quiz_shuffle import shuffle_question_pool
from engine.rewards import award_xp, update_streak

router = APIRouter(prefix="/api/custom-quiz", tags=["custom-quiz"])


class CustomQuizGenerateBody(BaseModel):
    subject: str = Field(..., min_length=2, max_length=80)
    custom_subject: str | None = Field(default=None, max_length=80)
    chapter: str | None = Field(default=None, max_length=120)
    custom_chapter: str | None = Field(default=None, max_length=120)
    use_chapter: bool = False
    difficulty_level: int = Field(default=2, ge=1, le=3)
    question_count: int = Field(default=5, ge=1, le=CUSTOM_QUIZ_MAX_QUESTIONS)
    timer_seconds: int = Field(default=30, ge=0, le=120)


class CustomQuizSubmitBody(BaseModel):
    student_id: str | None = None
    answers: list | None = None
    difficulty_level: int | None = Field(default=2, ge=1, le=3)
    time_taken: int | None = None
    subject: str | None = None
    chapter: str | None = None


def _resolve_subject(body: CustomQuizGenerateBody) -> str:
    if body.custom_subject and body.custom_subject.strip():
        return body.custom_subject.strip()
    if body.subject in SUBJECT_LIST:
        return body.subject.replace("_", " ").title()
    if body.subject.strip():
        return body.subject.strip()
    raise ApiError("Select or enter a subject.", 400)


def _resolve_chapter(body: CustomQuizGenerateBody, subject_key: str) -> str | None:
    if not body.use_chapter:
        return None
    if body.custom_chapter and body.custom_chapter.strip():
        return body.custom_chapter.strip()
    if body.chapter and body.chapter.strip():
        return body.chapter.strip()
    chapters = SUBJECT_CATALOG.get(subject_key, [])
    if chapters:
        return chapters[0]
    return None


@router.get("/subjects")
def list_subjects():
    return success(
        {
            "subjects": [
                {
                    "id": key,
                    "label": key.replace("_", " ").title(),
                    "chapters": chapters,
                }
                for key, chapters in SUBJECT_CATALOG.items()
            ],
            "difficulty_levels": [
                {"level": level, "label": label}
                for level, label in DIFFICULTY_LEVELS.items()
            ],
            "max_questions": CUSTOM_QUIZ_MAX_QUESTIONS,
        }
    )


@router.post("/generate")
def create_custom_quiz(
    body: CustomQuizGenerateBody,
    _user_id: Annotated[str, Depends(get_current_user_id)],
):
    subject_key = body.subject if body.subject in SUBJECT_LIST else "__custom__"
    subject_label = _resolve_subject(body)
    chapter = _resolve_chapter(body, subject_key if subject_key != "__custom__" else body.subject)

    try:
        questions = generate_custom_quiz(
            subject=subject_label,
            chapter=chapter,
            difficulty_level=body.difficulty_level,
            count=body.question_count,
        )
    except ApiError:
        raise

    shuffled = shuffle_question_pool(questions)
    return success(
        {
            "questions": shuffled,
            "subject": subject_label,
            "chapter": chapter,
            "difficulty_level": body.difficulty_level,
            "difficulty_label": DIFFICULTY_LEVELS[body.difficulty_level],
            "timer_seconds": body.timer_seconds,
            "question_count": len(shuffled),
            "source": "custom",
        }
    )


@router.post("/submit")
def submit_custom_quiz(body: CustomQuizSubmitBody, conn: DbConn):
    """
    Submit a customized quiz result.
    Awards XP, streak, and small INT/WIS gains.
    Does NOT insert sessions or update adaptive learning metrics.
    """
    if (
        not body.student_id
        or not isinstance(body.answers, list)
        or body.difficulty_level is None
        or body.time_taken is None
    ):
        return error("Missing required fields", 400)

    if len(body.answers) == 0:
        return error("Answers list cannot be empty", 400)

    try:
        difficulty_level = int(body.difficulty_level)
        time_taken = int(body.time_taken)
    except (ValueError, TypeError):
        return error("difficulty_level and time_taken must be integers", 400)

    if difficulty_level not in DIFFICULTY_LEVELS:
        return error("difficulty_level must be 1, 2, or 3", 400)

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

    for ans in body.answers:
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

    return success(
        {
            "score": round(score, 1),
            "xp_earned": xp_earned,
            "events": list(dict.fromkeys(all_events)),
            "new_level": student.level,
            "attribute_delta": attr_delta,
            "rewards": rewards,
            "practice_mode": True,
            "subject": body.subject,
            "chapter": body.chapter,
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
    )
