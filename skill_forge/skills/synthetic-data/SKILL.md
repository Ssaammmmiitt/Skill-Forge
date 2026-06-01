# Synthetic data skill

## What this skill is for
Use this to generate 200 fake student sessions with labeled learning styles for ML training.

## Environment facts
- Output: rows inserted into sessions table AND a CSV at data/training_data.csv
- Labels: fast_learner, slow_learner, conceptual, memorization (exactly these 4 strings)
- Libraries: numpy, pandas, random

## Step-by-step instructions
1. Define label rules first (see Rules below)
2. Loop 200 times, randomly pick a label
3. Generate quiz_score, time_taken, mistakes based on that label's range
4. Add small random noise to each value (±10%) so data isn't perfectly clean
5. Insert each row into the DB and append to a list
6. Save the list as a pandas DataFrame to data/training_data.csv
7. Print label distribution at the end

## Rules
- fast_learner: score 80–100, time_taken 30–90s, mistakes 0–2
- slow_learner: score 50–75, time_taken 180–300s, mistakes 4–10
- conceptual: score 70–95, time_taken 90–180s, mistakes 1–4 (longer time, fewer mistakes)
- memorization: score 75–95, time_taken 40–80s, mistakes 0–3 (fast, decent score)
- Dataset must have at least 40 rows per label (balanced classes)

## Verification checklist
- [ ] CSV has exactly 200 rows
- [ ] All 4 labels present, each with 40+ rows
- [ ] No NaN values in any column
- [ ] Running the script twice gives different random values
