"""Generate study content from document text via Groq."""
import os

from api.exceptions import ApiError

GROQ_MAX_INPUT_CHARS = 28_000
DEFAULT_MODEL = "llama-3.3-70b-versatile"

PROMPTS = {
    "summary": (
        "You are an educational assistant. Summarize the following document clearly for a "
        "student who wants to learn the material quickly. Use plain language, short paragraphs, "
        "and bullet points for key takeaways. Focus on main ideas, not minor details. "
        "Format your response in Markdown: use ## for section headings, **bold** for key terms, "
        "and - for bullet lists. Do not invent facts not present in the source."
    ),
    "detailed": (
        "You are an educational assistant. Create a detailed, point-wise study guide from "
        "the following document. Use numbered sections and nested bullet points. Cover major "
        "topics, definitions, examples, and relationships. Make it suitable for exam review. "
        "Format your response in Markdown: use ## and ### for section headings, **bold** for "
        "important terms, numbered lists for sections, and - for bullet points. "
        "Be thorough but stay faithful to the source—do not add outside information."
    ),
}


def _api_key() -> str:
    key = (os.environ.get("GROQ_API_KEY") or "").strip()
    if not key:
        raise ApiError(
            "AI reader is not configured. Set GROQ_API_KEY in the server environment.",
            503,
        )
    return key


def generate_study_content(text: str, mode: str) -> str:
    if mode not in PROMPTS:
        raise ApiError("Invalid mode. Use 'summary' or 'detailed'.", 400)

    clipped = text.strip()
    if len(clipped) > GROQ_MAX_INPUT_CHARS:
        clipped = clipped[:GROQ_MAX_INPUT_CHARS] + "\n\n[... truncated for AI processing ...]"

    try:
        from groq import Groq
    except ImportError as exc:
        raise ApiError("Groq SDK not installed on server", 503) from exc

    model = (os.environ.get("GROQ_MODEL") or DEFAULT_MODEL).strip()
    client = Groq(api_key=_api_key())

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": PROMPTS[mode]},
                {
                    "role": "user",
                    "content": f"Document text:\n\n{clipped}",
                },
            ],
            temperature=0.4,
            max_tokens=4096,
        )
    except Exception as exc:
        raise ApiError(f"AI service error: {exc}", 502) from exc

    content = (completion.choices[0].message.content or "").strip()
    if not content:
        raise ApiError("AI returned an empty response. Try again.", 502)
    return content
