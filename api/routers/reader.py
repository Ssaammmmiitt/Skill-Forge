from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile

from api.deps import get_current_user_id
from api.exceptions import ApiError
from api.responses import success
from api.services.groq_reader import generate_study_content
from engine.document_extract import extract_text
from engine.file_compress import prepare_upload

router = APIRouter(prefix="/api/reader", tags=["reader"])


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
