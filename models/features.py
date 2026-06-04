import os
import pickle

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from config import ML_FEATURE_NAMES, QUIZ_QUESTION_COUNT, SESSION_FEATURE_COLS


class CustomLabelEncoder(LabelEncoder):
    """Fixed class order: fast_learner, slow_learner, conceptual, memorization."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.classes_ = np.array(
            ["fast_learner", "slow_learner", "conceptual", "memorization"], dtype=object
        )

    def fit(self, y):
        self.classes_ = np.array(
            ["fast_learner", "slow_learner", "conceptual", "memorization"], dtype=object
        )
        return self

    def transform(self, y):
        mapping = {val: idx for idx, val in enumerate(self.classes_)}
        return np.array([mapping[x] for x in y])

    def fit_transform(self, y):
        self.fit(y)
        return self.transform(y)

    def inverse_transform(self, y):
        return np.array([self.classes_[int(x)] for x in y])


def enrich_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Adds derived behavioral features used by DT and neural net."""
    out = frame[SESSION_FEATURE_COLS].copy()
    out["accuracy_rate"] = out["quiz_score"] / 100.0
    out["mistake_rate"] = out["mistakes"] / float(QUIZ_QUESTION_COUNT)
    out["time_per_question"] = out["time_taken"] / float(QUIZ_QUESTION_COUNT)
    out["pace_index"] = out["accuracy_rate"] / np.maximum(out["time_per_question"] / 60.0, 0.05)
    return out[ML_FEATURE_NAMES]


def session_to_feature_row(
    quiz_score: float,
    time_taken: float,
    mistakes: float,
    difficulty: float,
) -> np.ndarray:
    """Single session → 1×8 feature row (before scaling)."""
    accuracy_rate = quiz_score / 100.0
    mistake_rate = mistakes / float(QUIZ_QUESTION_COUNT)
    time_per_question = time_taken / float(QUIZ_QUESTION_COUNT)
    pace_index = accuracy_rate / max(time_per_question / 60.0, 0.05)
    return np.array(
        [
            [
                quiz_score,
                time_taken,
                mistakes,
                difficulty,
                accuracy_rate,
                mistake_rate,
                time_per_question,
                pace_index,
            ]
        ],
        dtype=np.float64,
    )


def resolve_training_csv_path() -> str:
    """Resolve training CSV (supports root `data/` symlink or skill_forge/data/)."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for rel in ("data/training_data.csv", "skill_forge/data/training_data.csv"):
        path = os.path.join(root, rel)
        if os.path.isfile(path):
            return path
    raise FileNotFoundError(
        "training_data.csv not found. Run: python skill_forge/data/generate.py"
    )


def load_and_prepare(csv_path: str | None = None):
    """Load CSV, engineer features, split 80/20, fit scaler on train."""
    csv_path = csv_path or resolve_training_csv_path()
    df = pd.read_csv(csv_path)
    X = enrich_features(df)
    label_encoder = CustomLabelEncoder()
    y = label_encoder.fit_transform(df["learning_style"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, label_encoder


def save_preprocessors(scaler, label_encoder):
    os.makedirs("models/saved", exist_ok=True)
    with open("models/saved/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    with open("models/saved/label_encoder.pkl", "wb") as f:
        pickle.dump(label_encoder, f)


def load_preprocessors():
    from config import LE_PATH, SCALER_PATH

    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    with open(LE_PATH, "rb") as f:
        label_encoder = pickle.load(f)
    return scaler, label_encoder
