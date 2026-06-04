# Skill Forge — Content & scope

## What this platform is for

Skill Forge is an **AI adaptive learning prototype**, not a full LMS or document platform.

| Core purpose | How it works today |
|--------------|-------------------|
| **Behavioral ML** | Quiz timing, accuracy, and mistakes → learning-style classification (DT + neural net) |
| **Gamification** | INT / WIS / Energy, XP, levels, streaks, leaderboard |
| **Personalization** | Difficulty adapts; Learning Path + Analytics reflect ML output |

## Quizzes

- **36+ questions** in three difficulty bands (beginner / intermediate / advanced).
- Each session **randomly picks 5** from the pool so repeats feel different.
- Topics: math, science, geography, literature, history, CS, etc.
- Questions live in `api/data/questions.py` — add more dict entries anytime.

## PDF upload / auto-generated questions

**Not implemented** in this version. That would be a separate feature (RAG + LLM or extractive QA), typically:

1. Upload PDF → extract text  
2. Generate MCQs from chunks  
3. Store in the same question bank format  

For your **AI course project**, the intended demo is: *classify how someone learns from behavior*, not *authoring content from documents*. You can describe PDF generation as **future work** in your report.

## If you want more quiz content without PDFs

1. Edit `api/data/questions.py` and add rows to `QUESTIONS_BY_LEVEL[1]`, `[5]`, or `[10]`.  
2. Or export a CSV and add a small import script later.

## Learning Path

Skills map directly to your **INT, WIS, and Energy** (not a separate hidden XP tree). Take quizzes and log activities to move skills off 0%.
