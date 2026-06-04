"""Generate multiple-choice quiz questions from document study content via Groq."""
import json
import os
import re

from api.data.questions import QUIZ_QUESTIONS_PER_SESSION
from api.env_config import load_project_env
from api.exceptions import ApiError
from api.services.groq_client import groq_chat_completion
from api.services.groq_reader import DEFAULT_MODEL

load_project_env()

QUIZ_MAX_INPUT_CHARS = 12_000


def _slug_topic(filename: str) -> str:
    base = (filename or "document").rsplit(".", 1)[0]
    slug = re.sub(r"[^a-z0-9]+", "_", base.lower()).strip("_")
    return slug[:40] or "document"


def _parse_questions_json(raw: str) -> list[dict]:
    text = raw.strip()
    fence = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", text, re.DOTALL | re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()

    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ApiError("AI returned invalid quiz JSON. Try again.", 502) from exc

    questions = payload.get("questions") if isinstance(payload, dict) else payload
    if not isinstance(questions, list) or not questions:
        raise ApiError("AI returned no quiz questions. Try again.", 502)

    validated = []
    for idx, item in enumerate(questions):
        if not isinstance(item, dict):
            continue
        options = item.get("options")
        if not isinstance(options, list) or len(options) < 2:
            continue
        try:
            correct_index = int(item["correct_index"])
        except (KeyError, TypeError, ValueError):
            continue
        if correct_index < 0 or correct_index >= len(options):
            continue
        question_text = str(item.get("question", "")).strip()
        if not question_text:
            continue
        validated.append(
            {
                "id": str(item.get("id") or f"doc_q{idx + 1}"),
                "question": question_text,
                "options": [str(o) for o in options[:4]],
                "correct_index": correct_index,
                "topic": str(item.get("topic") or "document"),
            }
        )

    if not validated:
        raise ApiError("AI quiz format was invalid. Try again.", 502)
    return validated


def generate_document_quiz(content: str, filename: str, count: int | None = None) -> list[dict]:
    clipped = content.strip()
    if len(clipped) < 80:
        raise ApiError("Study content is too short to generate a quiz.", 400)

    if len(clipped) > QUIZ_MAX_INPUT_CHARS:
        clipped = clipped[:QUIZ_MAX_INPUT_CHARS] + "\n\n[... truncated ...]"

    question_count = count or QUIZ_QUESTIONS_PER_SESSION
    question_count = max(3, min(question_count, 8))
    doc_topic = _slug_topic(filename)

    system_prompt = (
        "You create exam-style multiple-choice questions from study material. "
        "Questions must be answerable ONLY from the provided material. "
        "Each question needs exactly 4 distinct options and one correct answer. "
        "Return ONLY valid JSON with this shape (no markdown fences):\n"
        '{"questions":[{"id":"doc_q1","question":"...","options":["A","B","C","D"],'
        f'"correct_index":0,"topic":"{doc_topic}"}}]}}\n'
        f"Generate exactly {question_count} questions. "
        "Mix recall, definitions, and application. Do not invent facts."
    )

    model = (os.environ.get("GROQ_MODEL") or DEFAULT_MODEL).strip()
    completion = groq_chat_completion(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Study material:\n\n{clipped}"},
        ],
        temperature=0.35,
        max_tokens=4096,
        response_format={"type": "json_object"},
    )

    raw = (completion.choices[0].message.content or "").strip()
    if not raw:
        raise ApiError("AI returned an empty quiz. Try again.", 502)

    questions = _parse_questions_json(raw)[:question_count]
    for q in questions:
        if q["topic"] == "document":
            q["topic"] = doc_topic
    return questions
