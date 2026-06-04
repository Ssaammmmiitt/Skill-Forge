"""Game Master — personalized guidance from ML + adaptive engine."""

from __future__ import annotations

from typing import Any


def build_game_master(cognitive: dict[str, Any]) -> dict[str, Any]:
    path = cognitive.get("learning_path") or {}
    behavioral = cognitive.get("behavioral") or {}
    weakness = behavioral.get("topic_weakness")

    if weakness:
        action_label = f"Practice {weakness.replace('_', ' ')}"
        action_route = "/quiz"
    elif cognitive.get("suggested_difficulty", 5) >= 7:
        action_label = "Take an advanced quiz"
        action_route = "/quiz"
    else:
        action_label = "Start your next quiz"
        action_route = "/quiz"

    return {
        "title": "GAME MASTER",
        "learning_style": cognitive.get("learning_style", "unknown"),
        "confidence": cognitive.get("confidence", 0.0),
        "model_agreement": cognitive.get("model_agreement", False),
        "focus": path.get("focus", "Complete a quiz to unlock personalized guidance."),
        "difficulty_label": path.get("difficulty_label", "Beginner"),
        "task_types": path.get("task_types", []),
        "next_topics": path.get("next_topics", []),
        "suggested_difficulty": cognitive.get("suggested_difficulty", 5),
        "explanations": (cognitive.get("explanations") or [])[:4],
        "topic_weakness": weakness,
        "action_label": action_label,
        "action_route": action_route,
    }
