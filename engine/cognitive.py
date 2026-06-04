"""Cognitive behavior analysis — aggregates sessions, ML inference, and game-master paths."""

from __future__ import annotations

from collections import Counter
from typing import Any

import numpy as np

from config import (
    QUIZ_QUESTION_COUNT,
    STYLE_CONCEPTUAL,
    STYLE_FAST,
    STYLE_MEMORIZER,
    STYLE_SLOW,
)
from data.models import Session, Student
from engine.adaptive import adjust_difficulty, get_learning_path
from models.inference import get_registry


def _heuristic_style(quiz_score: float, time_taken: float, mistakes: int, difficulty: int) -> str:
    accuracy = quiz_score / 100.0
    tpq = time_taken / max(QUIZ_QUESTION_COUNT, 1)
    if accuracy >= 0.8 and tpq <= 25:
        return STYLE_FAST
    if accuracy < 0.65 and tpq >= 45:
        return STYLE_SLOW
    if mistakes <= 2 and tpq >= 35:
        return STYLE_CONCEPTUAL
    if accuracy >= 0.7 and mistakes <= 3:
        return STYLE_MEMORIZER
    return STYLE_CONCEPTUAL


def mistake_profile_from_answers(answers: list[dict] | None) -> dict[str, int]:
    if not answers:
        return {}
    wrong_by_topic: Counter[str] = Counter()
    for ans in answers:
        chosen = ans.get("chosen_index")
        correct = ans.get("correct_index")
        topic = ans.get("topic") or "mixed"
        if chosen is not None and correct is not None and int(chosen) != int(correct):
            wrong_by_topic[topic] += 1
    return dict(wrong_by_topic)


def mistake_profile_from_sessions(sessions: list[Session]) -> dict[str, int]:
    """Proxy: attribute mistakes to session topic when per-answer data unavailable."""
    profile: Counter[str] = Counter()
    for s in sessions:
        if s.mistakes > 0:
            profile[s.topic or "mixed"] += int(s.mistakes)
    return dict(profile)


def pace_score(time_taken: float, quiz_score: float) -> float:
    tpq = time_taken / float(QUIZ_QUESTION_COUNT)
    accuracy = quiz_score / 100.0
    raw = (accuracy * 100.0) - (tpq * 0.8)
    return float(min(100.0, max(0.0, raw)))


def consistency_from_sessions(sessions: list[Session]) -> float:
    if len(sessions) < 2:
        return 0.0
    ordered = sorted(sessions, key=lambda s: s.timestamp)
    last_scores = [s.quiz_score for s in ordered[-5:]]
    std_dev = float(np.std(last_scores))
    return round(min(100.0, max(0.0, 100.0 - std_dev)), 2)


def score_velocity(sessions: list[Session]) -> float:
    ordered = sorted(sessions, key=lambda s: s.timestamp)
    if len(ordered) < 2:
        return 0.0
    return round(ordered[-1].quiz_score - ordered[-2].quiz_score, 2)


def suggested_difficulty(sessions: list[Session], fallback: int = 5) -> int:
    if not sessions:
        return fallback
    ordered = sorted(sessions, key=lambda s: s.timestamp, reverse=True)
    current = ordered[0].difficulty
    return adjust_difficulty(ordered, current)


def build_cognitive_profile(
    student: Student,
    sessions: list[Session],
    *,
    latest_score: float | None = None,
    latest_time_taken: int | None = None,
    latest_mistakes: int | None = None,
    latest_difficulty: int | None = None,
    quiz_answers: list[dict] | None = None,
) -> dict[str, Any]:
    registry = get_registry()
    ordered = sorted(sessions, key=lambda s: s.timestamp)

    if latest_score is not None and latest_time_taken is not None and latest_mistakes is not None:
        diff = latest_difficulty if latest_difficulty is not None else suggested_difficulty(sessions)
        ml = registry.predict_session(latest_score, latest_time_taken, latest_mistakes, diff)
        style = ml["learning_style"] or _heuristic_style(
            latest_score, latest_time_taken, latest_mistakes, diff
        )
        if ml["learning_style"] is None:
            ml["confidence"] = 0.5
            ml["explanations"] = ["Heuristic classifier (run scripts/setup_ml.py for ML)"] + ml.get(
                "explanations", []
            )[:2]
    elif ordered:
        last = ordered[-1]
        ml = registry.predict_session(last.quiz_score, last.time_taken, last.mistakes, last.difficulty)
        style = ml["learning_style"] or student.learning_style or _heuristic_style(
            last.quiz_score, last.time_taken, last.mistakes, last.difficulty
        )
        diff = last.difficulty
    else:
        ml = {"learning_style": None, "confidence": 0.0, "explanations": [], "probabilities": {}}
        style = student.learning_style if student.learning_style != "unknown" else STYLE_CONCEPTUAL
        diff = 5

    diff = latest_difficulty if latest_difficulty is not None else suggested_difficulty(sessions, diff)
    learning_path = get_learning_path(style, diff)

    mistake_profile = mistake_profile_from_answers(quiz_answers)
    if not mistake_profile:
        mistake_profile = mistake_profile_from_sessions(sessions)

    topic_weakness = None
    if mistake_profile:
        topic_weakness = max(mistake_profile, key=mistake_profile.get)

    last_score = latest_score if latest_score is not None else (ordered[-1].quiz_score if ordered else 0.0)
    last_time = (
        latest_time_taken
        if latest_time_taken is not None
        else (ordered[-1].time_taken if ordered else 0)
    )

    return {
        "learning_style": style,
        "confidence": ml.get("confidence", 0.0),
        "model_agreement": ml.get("model_agreement", False),
        "predictions": {
            "decision_tree": ml.get("decision_tree"),
            "neural_net": ml.get("neural_net"),
        },
        "probabilities": ml.get("probabilities", {}),
        "explanations": ml.get("explanations", []),
        "feature_snapshot": ml.get("feature_snapshot", {}),
        "behavioral": {
            "pace_score": round(pace_score(last_time, last_score), 2),
            "consistency_score": consistency_from_sessions(sessions),
            "score_velocity": score_velocity(sessions),
            "mistake_profile": mistake_profile,
            "topic_weakness": topic_weakness,
            "study_proxy_int": student.INT,
            "wisdom_proxy_wis": student.WIS,
            "energy_level": student.energy,
        },
        "learning_path": learning_path,
        "suggested_difficulty": diff,
        "style_history": _style_history_counts(sessions, registry),
    }


def _style_history_counts(sessions: list[Session], registry) -> dict[str, int]:
    counts = {STYLE_FAST: 0, STYLE_SLOW: 0, STYLE_CONCEPTUAL: 0, STYLE_MEMORIZER: 0}
    if not registry.ready:
        return counts
    for s in sessions:
        pred = registry.predict_session(s.quiz_score, s.time_taken, s.mistakes, s.difficulty)
        st = pred.get("learning_style")
        if st in counts:
            counts[st] += 1
    return counts
