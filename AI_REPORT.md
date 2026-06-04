# Skill Forge — AI / ML Report

## Problem

Classify each learner’s **cognitive learning style** from quiz behavior and adapt difficulty plus learning-path recommendations (game-master loop).

## Labels (4-class)

| Class | Meaning |
|-------|---------|
| `fast_learner` | High accuracy, short time per question |
| `slow_learner` | Lower accuracy, long time, more mistakes |
| `conceptual` | Moderate pace, fewer mistakes, deeper solving |
| `memorization` | Good recall, quick responses |

## Features (8)

Derived per quiz session:

1. `quiz_score` — percentage correct  
2. `time_taken` — total seconds  
3. `mistakes` — wrong count  
4. `difficulty` — 1–10  
5. `accuracy_rate` — score / 100  
6. `mistake_rate` — mistakes / 5 questions  
7. `time_per_question` — time / 5  
8. `pace_index` — accuracy per minute per question  

## Models

| Model | Library | Role |
|-------|---------|------|
| Decision Tree | scikit-learn | Interpretable baseline, feature importances |
| SkillForgeNet (MLP) | PyTorch | Non-linear patterns, ensemble partner |

**Runtime:** Both models predict on each quiz submit; ensemble picks label using agreement and confidence. If artifacts are missing, heuristic fallback runs until training completes.

## Training data

- Synthetic: `skill_forge/data/generate.py` → `data/training_data.csv` (~200 sessions, balanced styles)  
- Live sessions stored in SQLite (`sessions` table) for future retraining export  

## Evaluation

```bash
python scripts/setup_ml.py
```

Outputs:

- `reports/model_comparison.csv` — accuracy, precision, recall, F1 (macro)  
- `reports/confusion_matrix.png` — side-by-side DT vs NN  

Behavioral simulation: `python reports/evaluation.py` (difficulty + completion trends).

## API (user-facing)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/quiz/submit` | Saves session, runs ensemble, returns `cognitive` + `learning_path` |
| `GET /api/cognitive/{id}` | Full cognitive profile |
| `GET /api/analytics/{id}` | Trends + `cognitive_summary` |

## Limitations (honest)

- Lifestyle activities (study/sleep) affect RPG stats but are not yet ML features (no activity history table).  
- Training set is mostly synthetic; real-user retrain pipeline is manual.  
- Quiz bank has fixed tiers (3 difficulty bands), not per-question IRT.  

## Next steps

1. Export live `sessions` → append to training CSV on schedule  
2. Store per-answer JSON for richer mistake-pattern features  
3. Add SHAP or probability calibration for demos  
