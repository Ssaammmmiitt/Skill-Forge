"""Groq API calls with multi-key rotation and failover across configured keys."""
import logging

from api.env_config import get_groq_api_key, get_groq_api_keys
from api.exceptions import ApiError

logger = logging.getLogger(__name__)

# Status codes where another API key may succeed (quota, auth, transient upstream).
_RETRYABLE_STATUS_CODES = frozenset({401, 403, 408, 429, 500, 502, 503, 504})


def _error_status_code(exc: Exception) -> int | None:
    code = getattr(exc, "status_code", None)
    if isinstance(code, int):
        return code
    response = getattr(exc, "response", None)
    if response is not None:
        status = getattr(response, "status_code", None)
        if isinstance(status, int):
            return status
    return None


def _is_rate_limit_error(exc: Exception) -> bool:
    if _error_status_code(exc) == 429:
        return True
    text = str(exc).lower()
    return "429" in text or "rate limit" in text or "rate_limit" in text


def _should_try_next_key(exc: Exception) -> bool:
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        return True

    exc_name = type(exc).__name__.lower()
    if "timeout" in exc_name or "connect" in exc_name:
        return True

    code = _error_status_code(exc)
    if code in _RETRYABLE_STATUS_CODES:
        return True
    if _is_rate_limit_error(exc):
        return True

    text = str(exc).lower()
    return any(
        phrase in text
        for phrase in (
            "connection reset",
            "connection aborted",
            "temporarily unavailable",
            "overloaded",
            "timeout",
            "timed out",
            "bad gateway",
            "service unavailable",
        )
    )


def _ordered_keys() -> list[str]:
    """Round-robin starting key, then remaining keys in order."""
    keys = get_groq_api_keys()
    if len(keys) <= 1:
        return keys

    first = get_groq_api_key()
    try:
        start = keys.index(first)
    except ValueError:
        return keys
    return keys[start:] + keys[:start]


def _response_status_for_error(exc: Exception) -> int:
    if _is_rate_limit_error(exc):
        return 429
    code = _error_status_code(exc)
    if code in {401, 403, 503}:
        return code
    return 502


def groq_chat_completion(*, model: str, messages: list, temperature: float, max_tokens: int, **kwargs):
    """Run chat.completions.create, failing over to each configured API key when needed."""
    try:
        from groq import Groq
    except ImportError as exc:
        raise ApiError("Groq SDK not installed on server", 503) from exc

    keys = _ordered_keys()
    if not keys:
        raise ApiError(
            "AI reader is not configured. Set GROQ_API_KEY in the project root .env file, save it, and restart the API.",
            503,
        )

    last_error: Exception | None = None
    total = len(keys)

    for idx, key in enumerate(keys):
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
            remaining = total - idx - 1
            if remaining > 0 and _should_try_next_key(exc):
                code = _error_status_code(exc)
                logger.warning(
                    "Groq call failed on key %s/%s (status=%s): %s — trying next key",
                    idx + 1,
                    total,
                    code,
                    exc,
                )
                print(
                    f"[groq] key {idx + 1}/{total} failed"
                    f"{f' ({code})' if code else ''} — trying next key",
                    flush=True,
                )
                continue
            if remaining == 0 and _should_try_next_key(exc):
                break
            raise ApiError(f"AI service error: {exc}", _response_status_for_error(exc)) from exc

    assert last_error is not None
    raise ApiError(
        f"AI service unavailable after trying all {total} API keys. Try again later.",
        _response_status_for_error(last_error),
    ) from last_error
