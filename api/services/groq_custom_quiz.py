"""Generate customized subject/chapter quiz questions via Groq."""
import json
import os
import re

from api.data.subjects import DIFFICULTY_LABELS, DIFFICULTY_LEVELS
from api.env_config import load_project_env
from api.exceptions import ApiError
from api.services.groq_client import groq_chat_completion
from api.services.groq_quiz import _parse_questions_json
from api.services.groq_reader import DEFAULT_MODEL

load_project_env()

CUSTOM_QUIZ_MAX_QUESTIONS = 10


def _slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", (value or "general").lower()).strip("_")
    return slug[:40] or "general"


def _difficulty_prompt(level: int) -> str:
    label = DIFFICULTY_LEVELS.get(level, "medium")
    detail = DIFFICULTY_LABELS.get(label, DIFFICULTY_LABELS["medium"])
    return f"{label.upper()} — {detail}"


def generate_custom_quiz(
    *,
    subject: str,
    chapter: str | None,
    difficulty_level: int,
    count: int,
) -> list[dict]:
    subject_clean = (subject or "").strip()
    if len(subject_clean) < 2:
        raise ApiError("Subject must be at least 2 characters.", 400)

    if difficulty_level not in DIFFICULTY_LEVELS:
        raise ApiError("Difficulty must be 1 (easy), 2 (medium), or 3 (hard).", 400)

    question_count = max(1, min(int(count), CUSTOM_QUIZ_MAX_QUESTIONS))
    topic_slug = _slug(subject_clean)
    chapter_part = ""
    if chapter and chapter.strip():
        chapter_part = f"\nFocus specifically on the chapter/topic: {chapter.strip()}."
    difficulty_text = _difficulty_prompt(difficulty_level)

    system_prompt = (
        "You are an expert educator creating multiple-choice quiz questions. "
        "Questions must be accurate, educational, and appropriate for the subject. "
        "Each question needs exactly 4 distinct options and one correct answer. "
        "Return ONLY valid JSON with this shape (no markdown fences):\n"
        '{"questions":[{"id":"cq1","question":"...","options":["A","B","C","D"],'
        f'"correct_index":0,"topic":"{topic_slug}"}}]}}\n'
        f"Generate exactly {question_count} questions.\n"
        f"Difficulty: {difficulty_text}\n"
        "Mix recall, definitions, and application. Do not repeat questions."
    )

    user_prompt = (
        f"Subject: {subject_clean}.{chapter_part}\n"
        f"Create {question_count} multiple-choice questions at {DIFFICULTY_LEVELS[difficulty_level]} difficulty."
    )

    model = (os.environ.get("GROQ_MODEL") or DEFAULT_MODEL).strip()

    try:
        completion = groq_chat_completion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )
    except ApiError:
        raise
    except Exception as exc:
        raise ApiError(f"Could not generate quiz: {exc}", 502) from exc

    raw = (completion.choices[0].message.content or "").strip()
    if not raw:
        raise ApiError("AI returned an empty quiz. Try again with a different subject.", 502)

    try:
        questions = _parse_questions_json(raw)[:question_count]
    except ApiError as exc:
        raise ApiError(
            f"Quiz generation failed: {exc.message}. Try again or pick a different subject.",
            exc.status_code,
        ) from exc

    for idx, q in enumerate(questions):
        q["id"] = q.get("id") or f"custom_q{idx + 1}"
        q["topic"] = topic_slug

    return questions
