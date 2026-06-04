# FastAPI API skill

## What this skill is for
Use this when creating or modifying any API route under `api/routers/`.

## Environment facts
- FastAPI app factory in `api/app.py`
- Routers: `api/routers/auth.py` (auth), `api/routers/game.py` (game/quiz/student)
- All routes prefixed with `/api`
- CORS enabled for localhost Vite dev servers (see `CORS_ORIGINS` in `.env`)
- Response format: always JSON with keys: `data`, `error`, `status`
- Run server: `python -m api.app` or `uvicorn api.app:app --reload --port 5000`

## Step-by-step instructions
1. Add the route to the appropriate router (`auth` or `game`)
2. Use Pydantic models for request bodies when helpful
3. Inject DB with `conn: DbConn` from `api/deps.py`
4. Always validate required fields at the top of the handler
5. Call engine/model functions — never put business logic inside the route
6. Return via `success()` or `error()` from `api/responses.py`
7. Test with `pytest tests/test_api.py` or curl before moving on

## Rules
Standard success response:
{"data": <result>, "error": null, "status": 200}

Standard error response:
{"data": null, "error": "description", "status": 400}

Protected auth routes: use `Depends(get_current_user_id)` from `api/deps.py`

Required game endpoints:
- GET  /api/student/<id>
- POST /api/student/log-activity  body: {activity, value, student_id}
- GET  /api/quiz/<difficulty>
- POST /api/quiz/submit            body: {student_id, answers[]}
- GET  /api/leaderboard
- GET  /api/analytics/<id>
- GET  /api/cognitive/{student_id}

## Verification checklist
- [ ] curl http://localhost:5000/api/student/<id> returns JSON (not HTML)
- [ ] Missing required field returns 400 with error message
- [ ] No route has business logic — only calls to engine functions
