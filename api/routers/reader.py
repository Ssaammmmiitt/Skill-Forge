import os
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel, Field

from api.deps import DbConn, get_current_user_id
from api.env_config import get_groq_api_keys
from api.exceptions import ApiError
from api.responses import error, success
from api.services.groq_quiz import generate_document_quiz
from api.services.groq_reader import generate_study_content
from engine.document_extract import extract_text
from engine.file_compress import prepare_upload
from engine.practice_quiz_submit import document_difficulty_to_level, submit_practice_quiz
from engine.quiz_shuffle import shuffle_question_pool

router = APIRouter(prefix="/api/reader", tags=["reader"])


@router.get("/status")
def reader_status():
    keys = get_groq_api_keys()
    return success(
        {
            "groq_configured": bool(keys),
            "key_count": len(keys),
            "model": (os.environ.get("GROQ_MODEL") or "llama-3.3-70b-versatile").strip(),
        }
    )


class DocumentQuizBody(BaseModel):
    content: str = Field(..., min_length=80)
    filename: str = Field(default="document.pdf")
    difficulty: int = Field(default=5, ge=1, le=10)


class DocumentQuizSubmitBody(BaseModel):
    student_id: str | None = None
    answers: list | None = None
    difficulty: int = Field(default=5, ge=1, le=10)
    time_taken: int | None = None
    filename: str | None = None


@router.post("/quiz/submit")
def submit_document_quiz(body: DocumentQuizSubmitBody, conn: DbConn):
    """
    Submit a document reader quiz result.
    Awards XP, streak, and small INT/WIS gains (practice mode).
    Does NOT update adaptive learning metrics or session history.
    """
    if (
        not body.student_id
        or not isinstance(body.answers, list)
        or body.time_taken is None
    ):
        return error("Missing required fields", 400)

    if len(body.answers) == 0:
        return error("Answers list cannot be empty", 400)

    try:
        int(body.difficulty)
        int(body.time_taken)
    except (ValueError, TypeError):
        return error("difficulty and time_taken must be integers", 400)

    difficulty_level = document_difficulty_to_level(body.difficulty)

    try:
        result = submit_practice_quiz(
            conn,
            student_id=body.student_id,
            answers=body.answers,
            difficulty_level=difficulty_level,
            filename=body.filename,
        )
    except LookupError:
        return error("Student not found", 404)
    except ValueError as exc:
        return error(str(exc), 400)

    return success(result)


@router.post("/quiz")
def create_document_quiz(
    body: DocumentQuizBody,
    _user_id: Annotated[str, Depends(get_current_user_id)],
):
    questions = generate_document_quiz(body.content, body.filename)
    shuffled = shuffle_question_pool(questions)
    return success(
        {
            "questions": shuffled,
            "difficulty": body.difficulty,
            "filename": body.filename,
            "source": "document",
            "question_count": len(shuffled),
        }
    )


@router.post("/analyze")
async def analyze_document(
    _user_id: Annotated[str, Depends(get_current_user_id)],
    file: UploadFile = File(...),
    mode: Literal["summary", "detailed"] = Form("summary"),
):
    if not file.filename:
        raise ApiError("No file provided", 400)

    raw = await file.read()
    compression = prepare_upload(file.filename, raw)

    try:
        extracted = extract_text(file.filename, compression.data)
    except ApiError:
        if compression.was_compressed and compression.data is not raw:
            extracted = extract_text(file.filename, raw)
        else:
            raise

    generated = generate_study_content(extracted, mode)

    preview = extracted[:600] + ("..." if len(extracted) > 600 else "")

    return success(
        {
            "filename": file.filename,
            "mode": mode,
            "char_count": len(extracted),
            "extracted_preview": preview,
            "content": generated,
            "compression": compression.to_dict(),
        }
    )
