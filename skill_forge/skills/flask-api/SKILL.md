# Flask API skill

## What this skill is for
Use this when creating or modifying any Flask route in api/routes.py.

## Environment facts
- Flask app factory in api/app.py
- All routes prefixed with /api
- CORS enabled for http://localhost:5173 (Vite dev server)
- Response format: always JSON with keys: data, error, status

## Step-by-step instructions
1. Define the route in api/routes.py using a Blueprint
2. Always validate required fields at the top of the function
3. Call the engine/model function — never put business logic inside the route
4. Wrap the return in the standard response format (see Rules)
5. Add the route to the list in api/README.md
6. Test it with curl or pytest before moving on

## Rules
Standard success response:
{"data": <result>, "error": null, "status": 200}

Standard error response:
{"data": null, "error": "description", "status": 400}

Required endpoints:
- GET  /api/student/<id>
- POST /api/student/log-activity  body: {activity, value, student_id}
- GET  /api/quiz/<difficulty>
- POST /api/quiz/submit            body: {student_id, answers[]}
- GET  /api/leaderboard
- GET  /api/analytics/<id>
- GET  /api/admin/metrics
- POST /api/admin/retrain

## Verification checklist
- [ ] curl http://localhost:5000/api/student/1 returns JSON (not HTML)
- [ ] Missing required field returns 400 with error message
- [ ] No route has business logic — only calls to engine functions