"""Extract plain text from PDF, Word, and PowerPoint uploads."""
import io
from typing import BinaryIO

from api.exceptions import ApiError

MAX_EXTRACT_CHARS = 50_000
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt"}


def _truncate(text: str) -> str:
    text = text.strip()
    if len(text) > MAX_EXTRACT_CHARS:
        return text[:MAX_EXTRACT_CHARS] + "\n\n[... document truncated for processing ...]"
    return text


def extract_pdf(data: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return _truncate("\n".join(parts))


def extract_docx(data: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(data))
    parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            parts.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                parts.append(" | ".join(cells))
    return _truncate("\n".join(parts))


def extract_pptx(data: bytes) -> str:
    from pptx import Presentation

    prs = Presentation(io.BytesIO(data))
    parts = []
    for slide_num, slide in enumerate(prs.slides, start=1):
        slide_bits = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                slide_bits.append(shape.text.strip())
        if slide_bits:
            parts.append(f"--- Slide {slide_num} ---\n" + "\n".join(slide_bits))
    return _truncate("\n\n".join(parts))


def extract_text(filename: str, data: bytes) -> str:
    if not data:
        raise ApiError("Uploaded file is empty", 400)

    ext = ""
    if "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        ext = f".{ext}"

    if ext not in ALLOWED_EXTENSIONS:
        raise ApiError(
            "Unsupported file type. Upload PDF (.pdf), Word (.docx), or PowerPoint (.pptx).",
            400,
        )

    try:
        if ext == ".pdf":
            text = extract_pdf(data)
        elif ext in (".docx", ".doc"):
            if ext == ".doc":
                raise ApiError(
                    "Legacy .doc files are not supported. Save as .docx and upload again.",
                    400,
                )
            text = extract_docx(data)
        elif ext in (".pptx", ".ppt"):
            if ext == ".ppt":
                raise ApiError(
                    "Legacy .ppt files are not supported. Save as .pptx and upload again.",
                    400,
                )
            text = extract_pptx(data)
        else:
            raise ApiError("Unsupported file type", 400)
    except ApiError:
        raise
    except Exception as exc:
        raise ApiError(f"Could not read file: {exc}", 400) from exc

    if not text or len(text.strip()) < 20:
        raise ApiError(
            "Could not extract enough text from this file. Try a different export or format.",
            400,
        )
    return text
