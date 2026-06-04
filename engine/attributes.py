import dataclasses
import math
from typing import Any

from config import (
    ATTR_MAX,
    ATTR_MIN,
    SLEEP_MAX_HOURS,
    SLEEP_MIN_HOURS,
    SLEEP_OPTIMAL_HIGH,
    SLEEP_OPTIMAL_LOW,
    SLEEP_RATE_NEAR,
    SLEEP_RATE_OPTIMAL,
    SLEEP_RATE_POOR,
    STUDY_DAILY_INT_CAP,
    STUDY_ENERGY_COST_MIN,
    STUDY_INT_RATE_PRIMARY,
    STUDY_INT_RATE_SECONDARY,
    STUDY_MAX_MINUTES,
    STUDY_MIN_MINUTES,
    STUDY_PRIMARY_MINUTES,
    TASK_MAX_PER_DAY,
    WIS_PER_TASK,
)
from data.models import Student


def _clamp_attr(value: float) -> int:
    return int(round(min(ATTR_MAX, max(ATTR_MIN, value))))


def _study_focus_multiplier(energy: int) -> float:
    if energy >= 40:
        return 1.0
    if energy >= 20:
        return 0.75
    if energy >= 10:
        return 0.5
    return 0.25


def compute_study_effects(
    minutes: float,
    energy: int,
    int_already_today: float = 0.0,
) -> dict[str, Any]:
    """Study: focused time builds INT but drains energy; gains taper after 45 min."""
    minutes = float(minutes)
    notes: list[str] = []

    if minutes < STUDY_MIN_MINUTES:
        return {
            "int_gain": 0.0,
            "energy_cost": 0.0,
            "notes": [f"Study at least {STUDY_MIN_MINUTES} minutes to earn INT."],
        }

    effective_minutes = min(minutes, STUDY_MAX_MINUTES)
    if minutes > STUDY_MAX_MINUTES:
        notes.append(f"Only the first {STUDY_MAX_MINUTES} minutes count per session.")

    primary = min(effective_minutes, STUDY_PRIMARY_MINUTES)
    secondary = max(0.0, effective_minutes - STUDY_PRIMARY_MINUTES)
    raw_int = (
        primary * STUDY_INT_RATE_PRIMARY
        + secondary * STUDY_INT_RATE_SECONDARY
    ) * _study_focus_multiplier(energy)

    if energy < 20:
        notes.append("Low energy reduced study gains — rest or sleep first.")

    remaining_cap = max(0.0, STUDY_DAILY_INT_CAP - int_already_today)
    int_gain = min(raw_int, remaining_cap)
    if raw_int > remaining_cap and remaining_cap <= 0:
        notes.append(f"Daily INT cap ({STUDY_DAILY_INT_CAP}) reached — try again tomorrow.")
    elif raw_int > remaining_cap:
        notes.append(f"Daily INT cap applied ({STUDY_DAILY_INT_CAP} max per day).")

    energy_cost = effective_minutes * STUDY_ENERGY_COST_MIN
    return {
        "int_gain": int_gain,
        "energy_cost": energy_cost,
        "notes": notes,
    }


def compute_sleep_effects(hours: float, current_energy: int) -> dict[str, Any]:
    """Sleep: best recovery in the 7–9 h window; too little or too much helps less."""
    hours = float(hours)
    notes: list[str] = []

    if hours <= 0:
        return {"energy_gain": 0.0, "notes": ["Enter valid sleep hours."]}

    if hours < SLEEP_MIN_HOURS:
        notes.append(f"Under {SLEEP_MIN_HOURS} h — partial recovery only.")

    effective_hours = min(hours, SLEEP_MAX_HOURS)
    if hours > SLEEP_MAX_HOURS:
        notes.append(f"Only the first {SLEEP_MAX_HOURS} hours count toward recovery.")

    if SLEEP_OPTIMAL_LOW <= effective_hours <= SLEEP_OPTIMAL_HIGH:
        rate = SLEEP_RATE_OPTIMAL
    elif (6 <= effective_hours < SLEEP_OPTIMAL_LOW) or (
        SLEEP_OPTIMAL_HIGH < effective_hours <= 10
    ):
        rate = SLEEP_RATE_NEAR
    else:
        rate = SLEEP_RATE_POOR

    raw_gain = effective_hours * rate
    room = max(0, ATTR_MAX - current_energy)
    energy_gain = min(raw_gain, room)

    if current_energy >= ATTR_MAX:
        notes.append("Energy already full.")

    return {"energy_gain": energy_gain, "notes": notes}


def compute_task_effects(
    task_count: float,
    tasks_already_rewarded_today: float = 0.0,
) -> dict[str, Any]:
    """Tasks: WIS for completed work, capped per day to prevent spam syncing."""
    count = max(0, int(task_count))
    notes: list[str] = []

    if count <= 0:
        return {"wis_gain": 0.0, "rewarded_tasks": 0, "notes": ["No completed tasks to reward."]}

    remaining = max(0, TASK_MAX_PER_DAY - int(tasks_already_rewarded_today))
    rewarded = min(count, remaining)
    wis_gain = rewarded * WIS_PER_TASK

    if rewarded < count:
        notes.append(f"Daily task WIS cap ({TASK_MAX_PER_DAY} tasks) reached for today.")
    if rewarded == 0:
        notes.append("Tasks for this day were already synced.")

    return {"wis_gain": float(wis_gain), "rewarded_tasks": rewarded, "notes": notes}


def update_attributes(
    student: Student,
    activity: str,
    value: float,
    *,
    activity_date: str,
    daily_totals: dict[str, float] | None = None,
) -> tuple[Student, dict[str, int], list[str]]:
    """Apply activity with practical caps and side-effects. Returns student, delta, notes."""
    daily_totals = daily_totals or {}
    new_student = dataclasses.replace(student)
    notes: list[str] = []
    int_delta = wis_delta = energy_delta = 0

    if activity == "study":
        effects = compute_study_effects(
            value,
            student.energy,
            daily_totals.get("study_int_today", 0.0),
        )
        notes.extend(effects["notes"])
        int_gain = effects["int_gain"]
        energy_cost = effects["energy_cost"]
        if int_gain > 0:
            new_student.INT += int_gain
            new_student.energy -= energy_cost
            int_delta = _clamp_attr(new_student.INT) - student.INT
            energy_delta = _clamp_attr(new_student.energy) - student.energy

    elif activity == "sleep":
        if daily_totals.get("sleep_logged_today"):
            notes.append("Sleep already logged today — one entry per day.")
        else:
            effects = compute_sleep_effects(value, student.energy)
            notes.extend(effects["notes"])
            energy_gain = effects["energy_gain"]
            if energy_gain > 0:
                new_student.energy += energy_gain
                energy_delta = _clamp_attr(new_student.energy) - student.energy

    elif activity == "task_done":
        effects = compute_task_effects(
            value,
            daily_totals.get("tasks_rewarded_today", 0.0),
        )
        notes.extend(effects["notes"])
        wis_gain = effects["wis_gain"]
        if wis_gain > 0:
            new_student.WIS += wis_gain
            wis_delta = _clamp_attr(new_student.WIS) - student.WIS

    new_student.INT = _clamp_attr(new_student.INT)
    new_student.WIS = _clamp_attr(new_student.WIS)
    new_student.energy = _clamp_attr(new_student.energy)

    delta = {
        "INT": int_delta,
        "WIS": wis_delta,
        "energy": energy_delta,
    }
    return new_student, delta, notes


def get_attribute_delta(before: Student, after: Student) -> dict:
    return {
        "INT": after.INT - before.INT,
        "WIS": after.WIS - before.WIS,
        "energy": after.energy - before.energy,
    }
