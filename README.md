# Skill Forge

Adaptive learning platform with RPG-style student attributes (INT, WIS, energy, XP), quiz-driven progression, ML-based learning-style prediction, and a React UI built on three colliding design systems (RawBlock, StarChart, Arcade).

For visual and UI tokens, see **[DESIGN.md](./DESIGN.md)**.

---

## Stack

| Layer | Tech |
|-------|------|
| API | FastAPI + uvicorn |
| UI | React + Vite + Tailwind |
| Data | SQLite (`skill_forge/data/skill_forge.db`) |
| Auth | JWT, bcrypt, optional Google Sign-In |
| ML | scikit-learn decision tree + PyTorch MLP |

---

## Quick start

### 1. Backend

```bash
# From project root
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env      # Edit JWT_SECRET_KEY and optional GOOGLE_CLIENT_ID
python -m api.app
```

API runs at **http://127.0.0.1:5000** (override with `PORT` in `.env`).

### 2. Frontend

```bash
cd skill_forge_ui
npm install
cp .env.example .env      # Set VITE_API_URL if backend is not on :5000
npm run dev
```

Open **http://localhost:5173** or **http://localhost:5174** (if 5173 is busy).

Vite proxies `/api` to the backend URL from `VITE_API_URL` (default `http://localhost:5000`).

### 3. Smoke test

1. Visit `/` → register with email, username, and password (username suggestions load from the API).
2. After login, open **Dashboard**, take a **Quiz**, check **Analytics** and **Leaderboard**.

---

## Configuration

### Backend (`.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000`) |
| `DEBUG` | Enable uvicorn reload when `True` |
| `JWT_SECRET_KEY` | Signs auth tokens — change in production |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Frontend (`skill_forge_ui/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin, e.g. `http://localhost:5001` |
| `VITE_GOOGLE_CLIENT_ID` | Same client ID as backend (optional) |

---

## API

All responses use a single envelope:

```json
{ "data": { ... }, "error": null, "status": 200 }
```

The UI axios client unwraps `data` automatically.

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Email + username + password + name |
| POST | `/login` | Body: `{ "identifier": "user or email", "password": "..." }` |
| POST | `/google` | Body: `{ "token": "<Google ID token>" }` |
| POST | `/username/suggestions` | Body: `{ "first_name": "..." }` |
| POST | `/username/check` | Body: `{ "username": "..." }` |
| GET | `/verify` | Bearer JWT |
| POST | `/logout` | Bearer JWT |

New users get a matching **student** profile (`user_id` = `student_id`).

### Game — `/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/student/{id}` | Student profile |
| POST | `/student/log-activity` | Study / sleep / task_done |
| GET | `/quiz/{difficulty}` | Questions (1–10) |
| POST | `/quiz/submit` | Score, XP, difficulty adjustment |
| GET | `/leaderboard?sort_by=xp` | Top 10 |
| GET | `/analytics/{id}` | Trends and radar |
| GET | `/admin/metrics` | Model comparison CSV |
| POST | `/admin/retrain` | Background model pipeline |

Interactive docs: **http://127.0.0.1:5000/docs** (when the server is running).

More detail: [api/README.md](./api/README.md).

---

## Project layout

```
Skill-Forge/
├── api/                    # FastAPI app, routers, auth services
├── skill_forge_ui/         # React frontend
├── skill_forge/data/       # SQLite DB + models (symlinked as data/)
├── engine/                 # Attributes, rewards, adaptive difficulty
├── models/                 # ML training + saved artifacts
├── tests/                  # API pytest suite
├── reports/                # Evaluation outputs
├── config.py               # XP, difficulty, style constants
├── DESIGN.md               # UI design language (keep as reference)
└── requirements.txt
```

---

## Testing

```bash
# API tests (in-memory DB, no real skill_forge.db)
pytest tests/test_api.py -v

# Manual auth script (server must be running)
python test_auth.py
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Network error in UI | Start backend; confirm `VITE_API_URL` matches its port |
| CORS errors | Add your Vite origin to `CORS_ORIGINS` in backend `.env` |
| Username suggestions 500 | Restart backend (migrates legacy `users` table for `username`) |
| Google Sign-In blocked | Allow `accounts.google.com` or use email registration |
| Quiz shows load failed | Backend offline or wrong proxy target |

---

## UI routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Dashboard |
| `/quiz` | Quiz (full screen) |
| `/app/profile` | Profile |
| `/app/log` | Activity logger |
| `/app/analytics` | Analytics |
| `/app/leaderboard` | Leaderboard |
| `/app/admin` | Model admin |

Frontend setup notes: [skill_forge_ui/README.md](./skill_forge_ui/README.md).

---

## License

See repository defaults; adjust as needed for your deployment.
