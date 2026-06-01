# Data modeling skill

## What this skill is for
Use this when creating the Student table, session log table, or any DB schema change.

## Environment facts
- Database: SQLite, file at data/skill_forge.db
- ORM: plain sqlite3 Python module (no SQLAlchemy)
- Student fields: student_id, name, INT, WIS, energy, xp, level, learning_style
- Session fields: session_id, student_id, quiz_score, time_taken, mistakes, topic, timestamp

## Step-by-step instructions
1. Define the dataclass in data/models.py first
2. Write CREATE TABLE SQL with proper types and NOT NULL constraints
3. Add a get_db() function that returns a connection
4. Write insert_student() and insert_session() helper functions
5. Run the script and confirm the .db file is created
6. Test by inserting one dummy row and reading it back

## Rules
- Never use float for XP or level — use INTEGER
- Always cap INT, WIS, energy at 100 in the insert function, not the caller
- student_id must be UUID, not auto-increment integer

## Verification checklist
- [ ] skill_forge.db exists after running
- [ ] SELECT * FROM students returns the dummy row
- [ ] No column is nullable that shouldn't be