# Game mechanics skill

## What this skill is for
Use this when writing or modifying the XP system, attribute engine, difficulty adjuster, or reward logic.

## Environment facts
- Config values live in config.py — never hardcode magic numbers elsewhere
- Attribute caps: INT max=100, WIS max=100, energy max=100, min=0 for all
- XP to level formula: level = xp // 500

## Step-by-step instructions
1. Check config.py first — if the constant already exists, use it
2. Write the function in the correct engine/ file (attributes.py / rewards.py / adaptive.py)
3. Every function must return the updated state — never mutate in place silently
4. Write a 3-line test at the bottom of the file guarded by if __name__ == "__main__"
5. Run the file directly to confirm the test passes

## Rules
XP awards (from config.py):
- quiz_complete = 50 XP
- perfect_score (100%) = +100 bonus XP
- streak_3 (3 correct in a row) = +75 XP
- level_up event = +200 XP

Difficulty rules:
- If accuracy > 85% for last 3 sessions → increase difficulty by 1 (max 10)
- If accuracy < 60% for last 3 sessions → decrease difficulty by 1 (min 1)
- Otherwise → hold steady

Attribute rules:
- study session: INT += duration_minutes * 0.1 (cap at 100)
- sleep: energy = min(100, energy + hours * 10)
- task_done: WIS += 5 per task completed

## Verification checklist
- [ ] No magic numbers in engine/ files — all from config.py
- [ ] All functions return updated values
- [ ] Level increases when xp crosses a multiple of 500
- [ ] Attributes never exceed 100 or go below 0