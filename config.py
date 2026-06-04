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

# Attribute gain — study (minutes)
STUDY_MIN_MINUTES       = 15    # minimum session length to count
STUDY_MAX_MINUTES       = 120   # cap per log entry
STUDY_DAILY_INT_CAP     = 15    # max INT from study per calendar day
STUDY_INT_RATE_PRIMARY  = 0.25  # INT per minute for first block
STUDY_INT_RATE_SECONDARY = 0.12 # INT per minute after primary block
STUDY_PRIMARY_MINUTES   = 45    # minutes at full rate before taper
STUDY_ENERGY_COST_MIN   = 0.15  # energy lost per study minute

# Attribute gain — sleep (hours)
SLEEP_MIN_HOURS         = 4
SLEEP_MAX_HOURS         = 12
SLEEP_OPTIMAL_LOW       = 7
SLEEP_OPTIMAL_HIGH      = 9
SLEEP_RATE_OPTIMAL      = 10    # energy per hour in 7–9 h range
SLEEP_RATE_NEAR         = 7     # 6–7 h or 9–10 h
SLEEP_RATE_POOR         = 4     # under 6 h or over 10 h

# Attribute gain — tasks
WIS_PER_TASK            = 4
TASK_MAX_PER_DAY        = 5     # max tasks that grant WIS per calendar day

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
