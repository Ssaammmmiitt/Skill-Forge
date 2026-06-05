"""Attribute rewards for customized quizzes (isolated from adaptive ML pipeline)."""

from config import ATTR_MAX, ATTR_MIN


def _clamp(value: float) -> int:
    return int(round(min(ATTR_MAX, max(ATTR_MIN, value))))


def compute_custom_quiz_rewards(
    score_percent: float,
    difficulty_level: int,
    correct_count: int,
    total: int,
) -> dict[str, float]:
    """
    Small INT/WIS gains for custom quiz performance.
    Does not interact with study caps or task caps.
    """
    if total <= 0:
        return {"int_gain": 0.0, "wis_gain": 0.0}

    mult = {1: 1.0, 2: 1.25, 3: 1.5}.get(difficulty_level, 1.0)
    accuracy = score_percent / 100.0

    int_gain = round(accuracy * 2.5 * mult, 2)
    wis_gain = round(correct_count * 0.35 * mult, 2) if accuracy >= 0.5 else 0.0

    if score_percent == 100.0:
        wis_gain = round(wis_gain + 0.5 * mult, 2)

    return {"int_gain": int_gain, "wis_gain": wis_gain}


def apply_custom_quiz_rewards(student, rewards: dict[str, float]):
    """Return updated student with INT/WIS applied (clamped)."""
    import dataclasses

    updated = dataclasses.replace(student)
    int_before = updated.INT
    wis_before = updated.WIS

    updated.INT = _clamp(updated.INT + rewards["int_gain"])
    updated.WIS = _clamp(updated.WIS + rewards["wis_gain"])

    return updated, {
        "INT": updated.INT - int_before,
        "WIS": updated.WIS - wis_before,
    }
