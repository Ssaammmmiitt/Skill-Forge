import os
import pickle
from typing import Any

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from config import DT_MODEL_PATH, LE_PATH, ML_FEATURE_NAMES, NN_MODEL_PATH, SCALER_PATH
from models.features import CustomLabelEncoder, load_preprocessors, session_to_feature_row


class SkillForgeNet(nn.Module):
    def __init__(self, input_dim: int = 8):
        super().__init__()
        self.layer1 = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),
        )
        self.layer2 = nn.Sequential(
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2),
        )
        self.layer3 = nn.Linear(32, 4)

    def forward(self, x):
        x = self.layer1(x)
        x = self.layer2(x)
        return self.layer3(x)


class ModelRegistry:
    """Loads DT + NN artifacts and runs ensemble inference."""

    def __init__(self):
        self.clf = None
        self.nn = None
        self.scaler = None
        self.label_encoder = None
        self._load()

    def _load(self):
        try:
            from models.features import CustomLabelEncoder  # noqa: F401

            if os.path.exists(DT_MODEL_PATH):
                with open(DT_MODEL_PATH, "rb") as f:
                    self.clf = pickle.load(f)
            if os.path.exists(SCALER_PATH) and os.path.exists(LE_PATH):
                self.scaler, self.label_encoder = load_preprocessors()
            if os.path.exists(NN_MODEL_PATH):
                loaded = torch.load(NN_MODEL_PATH, map_location="cpu", weights_only=False)
                if isinstance(loaded, nn.Module):
                    self.nn = loaded
                else:
                    self.nn = SkillForgeNet(len(ML_FEATURE_NAMES))
                    self.nn.load_state_dict(loaded)
                self.nn.eval()
        except Exception as exc:
            print(f"Warning: ML model load failed: {exc}")

    @property
    def ready(self) -> bool:
        return (
            self.clf is not None
            and self.scaler is not None
            and self.label_encoder is not None
        )

    def predict_session(
        self,
        quiz_score: float,
        time_taken: float,
        mistakes: float,
        difficulty: float,
    ) -> dict[str, Any]:
        raw = session_to_feature_row(quiz_score, time_taken, mistakes, difficulty)
        raw_df = pd.DataFrame(raw, columns=ML_FEATURE_NAMES)
        return self._predict_scaled(self.scaler.transform(raw_df), raw[0])

    def _predict_scaled(self, scaled: np.ndarray, raw_row: np.ndarray) -> dict[str, Any]:
        if not self.ready:
            return {
                "learning_style": None,
                "confidence": 0.0,
                "model_agreement": False,
                "decision_tree": None,
                "neural_net": None,
                "probabilities": {},
                "explanations": ["ML models not trained — run: python scripts/setup_ml.py"],
                "feature_snapshot": dict(zip(ML_FEATURE_NAMES, raw_row.tolist())),
            }

        dt_probs = self.clf.predict_proba(scaled)[0]
        dt_idx = int(np.argmax(dt_probs))
        dt_style = self.label_encoder.inverse_transform([dt_idx])[0]
        dt_conf = float(dt_probs[dt_idx])

        nn_style = None
        nn_conf = 0.0
        nn_probs = None
        if self.nn is not None:
            with torch.no_grad():
                logits = self.nn(torch.FloatTensor(scaled))
                nn_probs = torch.softmax(logits, dim=1).numpy()[0]
            nn_idx = int(np.argmax(nn_probs))
            nn_style = self.label_encoder.inverse_transform([nn_idx])[0]
            nn_conf = float(nn_probs[nn_idx])

        if nn_style is not None:
            agreement = dt_style == nn_style
            if agreement:
                style = dt_style
                confidence = (dt_conf + nn_conf) / 2.0
            elif dt_conf >= nn_conf:
                style = dt_style
                confidence = dt_conf * 0.9
            else:
                style = nn_style
                confidence = nn_conf * 0.9
        else:
            agreement = True
            style = dt_style
            confidence = dt_conf

        explanations = self._build_explanations(raw_row, style)
        class_names = list(self.label_encoder.classes_)
        prob_map = {
            class_names[i]: round(float(dt_probs[i]), 3) for i in range(len(class_names))
        }

        return {
            "learning_style": style,
            "confidence": round(confidence, 3),
            "model_agreement": agreement,
            "decision_tree": dt_style,
            "neural_net": nn_style,
            "probabilities": prob_map,
            "explanations": explanations,
            "feature_snapshot": dict(zip(ML_FEATURE_NAMES, raw_row.tolist())),
        }

    def _build_explanations(self, raw_row: np.ndarray, style: str) -> list[str]:
        snap = dict(zip(ML_FEATURE_NAMES, raw_row))
        lines = []
        if snap["accuracy_rate"] >= 0.85:
            lines.append("High quiz accuracy")
        elif snap["accuracy_rate"] < 0.6:
            lines.append("Lower accuracy — room to reinforce fundamentals")
        if snap["time_per_question"] <= 20:
            lines.append("Fast response pace")
        elif snap["time_per_question"] >= 40:
            lines.append("Deliberate, slower problem-solving pace")
        if snap["mistake_rate"] <= 0.2:
            lines.append("Low mistake rate")
        elif snap["mistake_rate"] >= 0.5:
            lines.append("Frequent mistakes — repetition may help")
        if self.clf is not None and hasattr(self.clf, "feature_importances_"):
            idx = np.argsort(self.clf.feature_importances_)[::-1][:2]
            top = [ML_FEATURE_NAMES[i] for i in idx]
            lines.append(f"Strongest signals: {', '.join(top)}")
        lines.append(f"Ensemble label: {style.replace('_', ' ')}")
        return lines[:5]


_registry: ModelRegistry | None = None


def get_registry() -> ModelRegistry:
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
    return _registry
