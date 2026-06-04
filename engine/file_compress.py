"""
Automatic compression for document uploads (PDF, DOCX, PPTX).

- PDF: pikepdf stream/object optimization
- DOCX/PPTX: recompress embedded images with Pillow + maximum ZIP deflate
"""
from __future__ import annotations

import io
import os
import zipfile
from dataclasses import dataclass
from typing import Callable

from api.exceptions import ApiError

# Only compress when file exceeds this size (bytes) — default 12 MB
TWELVE_MB = 12 * 1024 * 1024
COMPRESS_THRESHOLD_BYTES = int(
    os.environ.get("COMPRESS_THRESHOLD_BYTES", str(TWELVE_MB))
)

# Hard limit on raw upload before processing
MAX_RAW_UPLOAD_BYTES = int(
    os.environ.get("MAX_RAW_UPLOAD_BYTES", str(25 * 1024 * 1024))
)

# Target size after compression (must fit for memory + Groq pipeline)
MAX_COMPRESSED_BYTES = int(
    os.environ.get("MAX_COMPRESSED_BYTES", str(TWELVE_MB))
)

IMAGE_MEDIA_PREFIXES = ("word/media/", "ppt/media/", "xl/media/")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tif", ".tiff", ".webp"}
MAX_IMAGE_EDGE = int(os.environ.get("COMPRESS_MAX_IMAGE_EDGE", "1920"))
JPEG_QUALITY = int(os.environ.get("COMPRESS_JPEG_QUALITY", "82"))
PNG_COMPRESS_LEVEL = 6


@dataclass
class CompressionResult:
    data: bytes
    original_size: int
    compressed_size: int
    was_compressed: bool
    method: str | None = None
    savings_percent: float = 0.0

    def to_dict(self) -> dict:
        return {
            "applied": self.was_compressed,
            "method": self.method,
            "original_size_bytes": self.original_size,
            "compressed_size_bytes": self.compressed_size,
            "savings_percent": round(self.savings_percent, 1),
        }


def _extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return "." + filename.rsplit(".", 1)[-1].lower()


def _should_attempt(filename: str, size: int, *, force: bool) -> bool:
    ext = _extension(filename)
    if ext not in {".pdf", ".docx", ".pptx"}:
        return False
    if force:
        return True
    return size > COMPRESS_THRESHOLD_BYTES


def _compress_pdf(data: bytes) -> bytes:
    import pikepdf

    with pikepdf.open(io.BytesIO(data)) as pdf:
        # Drop redundant objects when safe
        try:
            pdf.remove_unreferenced_resources()
        except Exception:
            pass

        out = io.BytesIO()
        pdf.save(
            out,
            compress_streams=True,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            linearize=True,
        )
        return out.getvalue()


def _compress_image(blob: bytes, ext: str) -> bytes:
    from PIL import Image

    try:
        img = Image.open(io.BytesIO(blob))
        img.load()
    except Exception:
        return blob

    # Downscale large images (major win for scanned slides / photos)
    w, h = img.size
    max_edge = max(w, h)
    if max_edge > MAX_IMAGE_EDGE:
        scale = MAX_IMAGE_EDGE / max_edge
        new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    out = io.BytesIO()

    if ext == ".png" and img.mode in ("RGBA", "LA", "P"):
        if img.mode == "P" and "transparency" in img.info:
            img = img.convert("RGBA")
        elif img.mode == "P":
            img = img.convert("RGB")
        if img.mode in ("RGBA", "LA"):
            img.save(out, format="PNG", optimize=True, compress_level=PNG_COMPRESS_LEVEL)
        else:
            img = img.convert("RGB")
            img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    elif ext in (".jpg", ".jpeg"):
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    else:
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)

    result = out.getvalue()
    return result if len(result) < len(blob) else blob


def _is_media_path(path: str) -> bool:
    normalized = path.replace("\\", "/").lower()
    return any(normalized.startswith(p) for p in IMAGE_MEDIA_PREFIXES)


def _compress_ooxml(data: bytes) -> bytes:
    """DOCX and PPTX are ZIP archives; shrink images and re-deflate all entries."""
    inp = io.BytesIO(data)
    out = io.BytesIO()

    with zipfile.ZipFile(inp, "r") as zin:
        with zipfile.ZipFile(
            out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
        ) as zout:
            for item in zin.infolist():
                if item.is_dir():
                    continue

                blob = zin.read(item.filename)
                if not item.is_dir() and _is_media_path(item.filename):
                    ext = os.path.splitext(item.filename)[1].lower()
                    if ext in IMAGE_EXTENSIONS:
                        blob = _compress_image(blob, ext)

                info = zipfile.ZipInfo(filename=item.filename, date_time=item.date_time)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = item.external_attr
                zout.writestr(info, blob)

    return out.getvalue()


_COMPRESSORS: dict[str, Callable[[bytes], bytes]] = {
    ".pdf": _compress_pdf,
    ".docx": _compress_ooxml,
    ".pptx": _compress_ooxml,
}


def compress_document(filename: str, data: bytes, *, force: bool = False) -> CompressionResult:
    """Return best-effort smaller bytes; keep original if compression does not help."""
    original_size = len(data)
    if original_size == 0:
        raise ApiError("Uploaded file is empty", 400)

    ext = _extension(filename)
    if ext not in _COMPRESSORS:
        return CompressionResult(
            data=data,
            original_size=original_size,
            compressed_size=original_size,
            was_compressed=False,
        )

    if not _should_attempt(filename, original_size, force=force):
        return CompressionResult(
            data=data,
            original_size=original_size,
            compressed_size=original_size,
            was_compressed=False,
        )

    method_key = ext.lstrip(".")
    try:
        compressed = _COMPRESSORS[ext](data)
    except Exception:
        # Non-fatal: proceed with original if optimizer fails
        return CompressionResult(
            data=data,
            original_size=original_size,
            compressed_size=original_size,
            was_compressed=False,
            method=None,
        )

    compressed_size = len(compressed)
    if compressed_size >= original_size:
        return CompressionResult(
            data=data,
            original_size=original_size,
            compressed_size=original_size,
            was_compressed=False,
        )

    savings = ((original_size - compressed_size) / original_size) * 100.0
    return CompressionResult(
        data=compressed,
        original_size=original_size,
        compressed_size=compressed_size,
        was_compressed=True,
        method=method_key,
        savings_percent=savings,
    )


def prepare_upload(filename: str, data: bytes) -> CompressionResult:
    """
    Validate size limits and auto-compress large uploads.

    Raises ApiError if the file cannot be brought under MAX_COMPRESSED_BYTES.
    """
    original_size = len(data)
    if original_size > MAX_RAW_UPLOAD_BYTES:
        raise ApiError(
            f"File too large ({_fmt_mb(original_size)} MB). "
            f"Maximum upload is {_fmt_mb(MAX_RAW_UPLOAD_BYTES)} MB.",
            400,
        )

    force = original_size > MAX_COMPRESSED_BYTES
    result = compress_document(filename, data, force=force)

    if result.compressed_size > MAX_COMPRESSED_BYTES:
        raise ApiError(
            f"Could not compress file below {_fmt_mb(MAX_COMPRESSED_BYTES)} MB "
            f"(still {_fmt_mb(result.compressed_size)} MB). "
            "Remove large images or split the document.",
            400,
        )

    return result


def _fmt_mb(num_bytes: int) -> str:
    return f"{num_bytes / (1024 * 1024):.1f}"
