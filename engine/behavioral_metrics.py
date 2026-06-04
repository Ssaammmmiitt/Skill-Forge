"""Behavioral metrics for analytics export (tables + session charts)."""

from __future__ import annotations

import numpy as np

from data.models import Session, Student


def build_behavioral_metrics(
    student: Student,
    sessions: list[Session],
    cognitive: dict,
) -> dict:
    n = len(sessions)
    sorted_sessions = sorted(sessions, key=lambda s: s.timestamp)
    behavioral = cognitive.get("behavioral") or {}

    avg_score = float(np.mean([s.quiz_score for s in sorted_sessions])) if n else 0.0
    avg_difficulty = float(np.mean([s.difficulty for s in sorted_sessions])) if n else 0.0
    target_sessions = 5
    completion_rate = min(100.0, (n / target_sessions) * 100.0)

    chart = []
    window = sorted_sessions[-10:]
    for idx, session in enumerate(window):
        global_idx = len(sorted_sessions) - len(window) + idx
        prior_scores = [s.quiz_score for s in sorted_sessions[: global_idx + 1]]
        tail = prior_scores[-5:]
        std_dev = float(np.std(tail)) if len(tail) >= 2 else 0.0
        rolling_consistency = min(100.0, max(0.0, 100.0 - std_dev))
        chart.append(
            {
                "session": idx + 1,
                "score": round(session.quiz_score, 1),
                "difficulty": session.difficulty,
                "consistency": round(rolling_consistency, 1),
            }
        )

    table = [
        {
            "metric": "Quiz sessions completed",
            "value": str(n),
            "detail": "Total assessments logged",
        },
        {
            "metric": "Session completion rate",
            "value": f"{completion_rate:.0f}%",
            "detail": f"Target: {target_sessions} sessions",
        },
        {
            "metric": "Average quiz score",
            "value": f"{avg_score:.1f}%",
            "detail": "Mean accuracy across sessions",
        },
        {
            "metric": "Average difficulty",
            "value": f"{avg_difficulty:.1f} / 10",
            "detail": "Adaptive level reached",
        },
        {
            "metric": "Consistency score",
            "value": f"{behavioral.get('consistency_score', 0):.0f}%",
            "detail": "Lower score variance = higher consistency",
        },
        {
            "metric": "Pace score",
            "value": f"{behavioral.get('pace_score', 0):.0f}%",
            "detail": "Speed vs accuracy balance",
        },
        {
            "metric": "Score velocity",
            "value": f"{behavioral.get('score_velocity', 0):+.1f}",
            "detail": "Latest session vs previous",
        },
        {
            "metric": "Current streak",
            "value": str(student.streak),
            "detail": "Consecutive correct answers",
        },
    ]

    return {
        "table": table,
        "chart": chart,
        "summary": {
            "sessions_completed": n,
            "completion_rate": round(completion_rate, 1),
            "consistency_score": behavioral.get("consistency_score", 0),
            "pace_score": behavioral.get("pace_score", 0),
        },
    }
