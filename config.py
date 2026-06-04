# XP awards
XP_QUIZ_COMPLETE   = 50
XP_PERFECT_SCORE   = 100   # bonus on top of quiz complete
XP_STREAK_3        = 75    # bonus when streak reaches 3
XP_STREAK_5        = 150   # bonus when streak reaches 5
XP_LEVEL_UP        = 200   # bonus when leveling up

# Level thresholds
XP_PER_LEVEL       = 500   # level = xp // 500

# Attribute caps
ATTR_MAX           = 100
ATTR_MIN           = 0

# Attribute gain rates (per unit of activity)
INT_PER_STUDY_MIN  = 0.4   # INT gained per minute of study
WIS_PER_TASK       = 5     # WIS gained per completed task
ENERGY_PER_SLEEP_H = 12    # energy gained per hour of sleep

# Difficulty adjustment thresholds
DIFFICULTY_UP_THRESHOLD   = 0.85   # accuracy above this → harder
DIFFICULTY_DOWN_THRESHOLD = 0.60   # accuracy below this → easier
DIFFICULTY_MIN            = 1
DIFFICULTY_MAX            = 10
DIFFICULTY_LOOKBACK       = 3      # sessions to consider

# Quiz / ML feature engineering
QUIZ_QUESTION_COUNT = 5

# Learning style labels
STYLE_FAST        = "fast_learner"
STYLE_SLOW        = "slow_learner"
STYLE_CONCEPTUAL  = "conceptual"
STYLE_MEMORIZER   = "memorization"

# Model artifact paths (relative to repo root)
DT_MODEL_PATH = "models/saved/dt_model.pkl"
NN_MODEL_PATH = "models/saved/nn_model_full.pt"
SCALER_PATH = "models/saved/scaler.pkl"
LE_PATH = "models/saved/label_encoder.pkl"

# Core columns stored in training CSV
SESSION_FEATURE_COLS = ["quiz_score", "time_taken", "mistakes", "difficulty"]

# Full feature vector for ML (includes derived)
ML_FEATURE_NAMES = [
    "quiz_score",
    "time_taken",
    "mistakes",
    "difficulty",
    "accuracy_rate",
    "mistake_rate",
    "time_per_question",
    "pace_index",
]
