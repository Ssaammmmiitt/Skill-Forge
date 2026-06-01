# Skill Forge API — Backend Progress & Reference

FastAPI REST API for the Skill Forge adaptive learning platform.  
Migrated from Flask; all routes return a consistent JSON envelope.

---

## Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI + uvicorn |
| Database | SQLite (`skill_forge/data/skill_forge.db`) |
| Auth | JWT (HS256), bcrypt password hashing |
| OAuth | Google Sign-In (`google-auth`) |
| ML | scikit-learn (decision tree), PyTorch (MLP), loaded at runtime |
| Config | `python-dotenv`, `config.py` (XP, difficulty thresholds) |

---

## Project layout

```
api/
├── app.py              # App factory, CORS, exception handlers, uvicorn entry
├── deps.py             # DB session dependency, JWT user dependency
├── responses.py        # success() / error() JSON helpers
├── exceptions.py       # ApiError for auth failures
├── routers/
│   ├── auth.py         # /api/auth/*
│   └── game.py         # /api/* (student, quiz, analytics, admin)
└── services/
    ├── auth_store.py   # Users table, username migration, bcrypt
    └── jwt_auth.py     # Token encode/decode
```

Related packages (repo root):

- `data/` → symlink to `skill_forge/data/` (`models.py`, SQLite)
- `engine/` — attributes, rewards, adaptive difficulty
- `models/` — trained `.pkl` / `.pt` artifacts
- `tests/test_api.py` — pytest with in-memory DB

---

## Run

```bash
# From repository root
pip install -r requirements.txt
cp .env.example .env   # JWT_SECRET_KEY, CORS_ORIGINS, GOOGLE_CLIENT_ID

python -m api.app
# or
uvicorn api.app:app --reload --port 5000
```

- Interactive docs: http://127.0.0.1:5000/docs  
- Default port: `5000` (`PORT` in `.env`)

---

## Response format

Every endpoint returns:

```json
{
  "data": { ... },
  "error": null,
  "status": 200
}
```

On failure, `data` is `null` and `error` contains a message string.

---

## Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Email, username, password, name → JWT + user |
| POST | `/login` | No | Body: `{ "identifier", "password" }` (username or email) |
| POST | `/google` | No | Body: `{ "token" }` — Google ID token |
| POST | `/username/suggestions` | No | Body: `{ "first_name" }` → up to 5 available names |
| POST | `/username/check` | No | Body: `{ "username" }` → `{ "available": bool }` |
| GET | `/verify` | Bearer JWT | Validate token, return user |
| POST | `/logout` | Bearer JWT | Client-side token discard hint |

### Auth features

- **Users table** with username, email, bcrypt hash, Google ID, provider, timestamps.
- **Schema migration** — adds `username` column to legacy DBs and backfills from email.
- **Student profile** — new users get a matching `students` row (`user_id` = `student_id`).
- **JWT** — 24h expiry (`JWT_SECRET_KEY` in `.env`).

---

## Game & learning (`/api`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/student/{id}` | No* | Full student record (INT, WIS, energy, XP, level, style, streak) |
| POST | `/student/log-activity` | No* | Body: `student_id`, `activity`, `value` — study / sleep / task_done |
| GET | `/quiz/{difficulty}` | No | Questions 1–10 (maps to easy/medium/hard banks) |
| POST | `/quiz/submit` | No* | Score, XP, streak, difficulty adjustment, ML style prediction |
| GET | `/leaderboard` | No | Top 10; query `sort_by=xp|INT|WIS` |
| GET | `/analytics/{id}` | No* | Trends, style history, consistency, radar |
| GET | `/admin/metrics` | No | Model comparison CSV metrics |
| POST | `/admin/retrain` | No | Starts background training pipeline |

\*Protected in production by frontend; API does not enforce JWT on game routes yet.

### Game engine integration

- **`engine/attributes`** — INT/WIS/energy updates from logged activities.
- **`engine/rewards`** — XP for quiz complete, perfect score, streak milestones, level-up.
- **`engine/adaptive`** — adjusts next quiz difficulty from recent session scores.
- **ML models** — decision tree + scaler + label encoder predict `learning_style` on quiz submit and in analytics history.

### Quiz flow

1. `GET /quiz/{difficulty}` — shuffled options per question.
2. `POST /quiz/submit` — validates answers, writes `sessions` row, updates student XP/level/streak/style.

### Activity logging

- `study` — duration (minutes) → INT gain  
- `sleep` — hours → energy gain  
- `task_done` — count → WIS gain  

Returns `updated_attributes` and `delta` for the UI.

---

## CORS

Configured in `app.py` via `CORSMiddleware`:

- Origins from `CORS_ORIGINS` (default `http://localhost:5173`, `5174`)
- Regex allows any `localhost` / `127.0.0.1` port in development

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No | Listen port (default `5000`) |
| `DEBUG` | No | Uvicorn reload when `True` |
| `JWT_SECRET_KEY` | Yes (prod) | JWT signing secret |
| `GOOGLE_CLIENT_ID` | For Google login | Must match frontend client ID |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |

---

## Database

- **Path:** `skill_forge/data/skill_forge.db`
- **Tables:** `students`, `sessions`, `users`
- **WAL mode**, foreign keys enabled, `check_same_thread=False` for FastAPI workers

---

## Testing

```bash
pytest tests/test_api.py -v
```

Uses in-memory SQLite; does not touch the real database file.

Manual auth script (server must be running):

```bash
python test_auth.py
```

---

## Migration notes (Flask → FastAPI)

- Flask blueprints replaced by `APIRouter` in `api/routers/`.
- `flask-cors` replaced by Starlette `CORSMiddleware`.
- Shared response helpers in `api/responses.py`.
- Auth DB logic centralized in `api/services/auth_store.py`.

---

## Known limitations

- Game routes are not JWT-gated on the server (rely on frontend `ProtectedRoute`).
- `GET /leaderboard` uses dynamic SQL `ORDER BY` — sort column is validated against a whitelist.
- Admin retrain spawns a shell subprocess; intended for dev/admin use only.
- Google token verification requires matching authorized origins in Google Cloud Console.

---

## Frontend integration

React app (`skill_forge_ui`) proxies `/api` through Vite.  
See [skill_forge_ui/PROJECT_REPORT.md](../skill_forge_ui/PROJECT_REPORT.md) for UI features and route map.
