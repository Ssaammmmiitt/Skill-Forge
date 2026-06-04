"""Load project .env reliably (including under uvicorn --reload workers)."""
import itertools
import os
import re
import threading
from collections.abc import Iterator
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

_PLACEHOLDER = "your-groq-api-key"
_GROQ_KEY_RE = re.compile(r"^GROQ_API_KEY(\d+)?$")
_key_cycle: Iterator[str] | None = None
_key_cycle_lock = threading.Lock()
_last_cycle_keys: tuple[str, ...] = ()


def load_project_env() -> None:
    if ENV_PATH.is_file():
        load_dotenv(ENV_PATH, override=True)


def _valid_key(value: str) -> bool:
    v = (value or "").strip().strip('"').strip("'")
    return bool(v) and v != _PLACEHOLDER


def _parse_env_file_keys() -> dict[str, str]:
    if not ENV_PATH.is_file():
        return {}
    found: dict[str, str] = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        name, _, value = stripped.partition("=")
        name = name.strip()
        if _GROQ_KEY_RE.match(name) and _valid_key(value):
            found[name] = value.strip().strip('"').strip("'")
    return found


def get_groq_api_keys() -> list[str]:
    """All Groq keys: GROQ_API_KEYS, GROQ_API_KEY, GROQ_API_KEY2, …"""
    load_project_env()
    keys: list[str] = []
    seen: set[str] = set()

    def add(key: str) -> None:
        if _valid_key(key) and key not in seen:
            seen.add(key)
            keys.append(key)

    bulk = (os.environ.get("GROQ_API_KEYS") or "").strip()
    if bulk:
        for part in bulk.split(","):
            add(part)

    file_keys = _parse_env_file_keys()

    def sort_name(name: str) -> tuple[int, str]:
        m = _GROQ_KEY_RE.match(name)
        suffix = m.group(1) if m and m.group(1) else "0"
        return (int(suffix), name)

    env_names = sorted(
        {n for n in os.environ if _GROQ_KEY_RE.match(n)} | set(file_keys),
        key=sort_name,
    )
    for name in env_names:
        value = (os.environ.get(name) or file_keys.get(name) or "").strip()
        add(value)

    return keys


def get_groq_api_key() -> str:
    """Next key in round-robin rotation across all configured keys."""
    global _key_cycle, _last_cycle_keys
    all_keys = get_groq_api_keys()
    if not all_keys:
        return ""

    frozen = tuple(all_keys)
    with _key_cycle_lock:
        if _key_cycle is None or _last_cycle_keys != frozen:
            _key_cycle = itertools.cycle(frozen)
            _last_cycle_keys = frozen
        return next(_key_cycle)


def reset_groq_key_cycle() -> None:
    """Clear rotation state (for tests)."""
    global _key_cycle, _last_cycle_keys
    with _key_cycle_lock:
        _key_cycle = None
        _last_cycle_keys = ()
