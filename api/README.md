# Skill Forge Flask API

This package contains the complete Flask REST API for the Skill Forge adaptive learning platform.

## Endpoints

All API routes are prefixed with `/api` and return standard JSON payloads.

### Student Management

- **`GET /api/student/<student_id>`**: Retrieve student profile details, metrics, and level states.
- **`POST /api/student/log-activity`**: Log user micro-activities (`study`, `sleep`, or `task_done`) to update attributes in real-time.

### Quiz Engine

- **`GET /api/quiz/<int:difficulty>`**: Fetch 5 shuffled, procedurally generated multiple-choice questions matching the user's difficulty tier (Level 1, 5, or 10).
- **`POST /api/quiz/submit`**: Submit student quiz answers to compute performance scores, award XP/milestone achievements, dynamically adjust next-session difficulty, and run ML style classification.

### Analytics & gamification

- **`GET /api/leaderboard`**: Query top-performing students ranked descending by XP or specified attributes (`INT`, `WIS`).
- **`GET /api/analytics/<student_id>`**: Compile performance trends, historic predicted styles, consistency scores, and normalized metrics for radar representations.

### Model Administration

- **`GET /api/admin/metrics`**: Load pre-evaluated model comparison results (`Accuracy`, `Precision_Macro`, `Recall_Macro`, `F1_Macro`).
- **`POST /api/admin/retrain`**: Trigger non-blocking, asynchronous model retraining and evaluation workflows.
