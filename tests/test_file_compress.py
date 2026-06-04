import io
import zipfile

import pytest

from engine.file_compress import (
    COMPRESS_THRESHOLD_BYTES,
    compress_document,
    prepare_upload,
)


def _minimal_docx_bytes() -> bytes:
    """Tiny valid DOCX (ZIP with minimal structure)."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>',
        )
        zf.writestr(
            "word/document.xml",
            '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello compression test</w:t></w:r></w:p></w:body></w:document>',
        )
    return buf.getvalue()


def test_small_file_skips_compression():
    data = _minimal_docx_bytes()
    result = compress_document("notes.docx", data)
    assert result.was_compressed is False
    assert result.data == data


def test_compression_only_above_12mb_threshold():
    data = _minimal_docx_bytes()
    assert len(data) < COMPRESS_THRESHOLD_BYTES
    result = compress_document("notes.docx", data, force=False)
    assert result.was_compressed is False


def test_prepare_upload_accepts_small_docx():
    data = _minimal_docx_bytes()
    result = prepare_upload("notes.docx", data)
    assert len(result.data) > 0


def test_prepare_upload_rejects_empty():
    from api.exceptions import ApiError

    with pytest.raises(ApiError):
        prepare_upload("empty.pdf", b"")
