from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel, Field

from api.deps import get_current_user_id
from api.exceptions import ApiError
from api.responses import success
from api.services.groq_quiz import generate_document_quiz
from api.services.groq_reader import generate_study_content
from engine.document_extract import extract_text
from engine.file_compress import prepare_upload
from engine.quiz_shuffle import shuffle_question_pool

router = APIRouter(prefix="/api/reader", tags=["reader"])


class DocumentQuizBody(BaseModel):
    content: str = Field(..., min_length=80)
    filename: str = Field(default="document.pdf")
    difficulty: int = Field(default=5, ge=1, le=10)


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

    extracted = extract_text(file.filename, compression.data)
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
