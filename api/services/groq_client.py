"""Groq API calls with multi-key rotation and rate-limit fallback."""
from api.env_config import get_groq_api_keys
from api.exceptions import ApiError


def _is_rate_limit_error(exc: Exception) -> bool:
    if getattr(exc, "status_code", None) == 429:
        return True
    text = str(exc).lower()
    return "429" in text or "rate limit" in text or "rate_limit" in text


def groq_chat_completion(*, model: str, messages: list, temperature: float, max_tokens: int, **kwargs):
    """Run chat.completions.create, trying each configured API key on rate limits."""
    try:
        from groq import Groq
    except ImportError as exc:
        raise ApiError("Groq SDK not installed on server", 503) from exc

    keys = get_groq_api_keys()
    if not keys:
        raise ApiError(
            "AI reader is not configured. Set GROQ_API_KEY in the project root .env file, save it, and restart the API.",
            503,
        )

    last_error: Exception | None = None
    for key in keys:
        try:
            client = Groq(api_key=key)
            return client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )
        except Exception as exc:
            last_error = exc
            if _is_rate_limit_error(exc) and len(keys) > 1:
                continue
            raise ApiError(f"AI service error: {exc}", 502) from exc

    raise ApiError(
        f"AI service rate limited on all {len(keys)} API keys. Try again later.",
        502,
    ) from last_error
