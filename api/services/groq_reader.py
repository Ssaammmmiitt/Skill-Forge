"""Generate study content from document text via Groq."""
import os

from api.env_config import load_project_env
from api.exceptions import ApiError
from api.services.groq_client import groq_chat_completion

load_project_env()

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


def generate_study_content(text: str, mode: str) -> str:
    if mode not in PROMPTS:
        raise ApiError("Invalid mode. Use 'summary' or 'detailed'.", 400)

    clipped = text.strip()
    if len(clipped) > GROQ_MAX_INPUT_CHARS:
        clipped = clipped[:GROQ_MAX_INPUT_CHARS] + "\n\n[... truncated for AI processing ...]"

    model = (os.environ.get("GROQ_MODEL") or DEFAULT_MODEL).strip()
    completion = groq_chat_completion(
        model=model,
        messages=[
            {"role": "system", "content": PROMPTS[mode]},
            {"role": "user", "content": f"Document text:\n\n{clipped}"},
        ],
        temperature=0.4,
        max_tokens=4096,
    )

    content = (completion.choices[0].message.content or "").strip()
    if not content:
        raise ApiError("AI returned an empty response. Try again.", 502)
    return content
