# API testing skill

## What this skill is for
Use this when writing pytest tests for FastAPI routes.

## Environment facts
- Test file: `tests/test_api.py`
- Use `fastapi.testclient.TestClient` with `create_app()` from `api.app`
- Seed the test DB before each test using a fixture with in-memory SQLite (`check_same_thread=False`)

## Step-by-step instructions
1. Create a pytest fixture that builds a fresh in-memory SQLite DB and seeds one student
2. Monkeypatch `data.models.get_db` and `api.deps._get_db` to return the fixture connection
3. For each endpoint write: one happy-path test and one error test
4. Happy path: assert status 200 and check `data` field is not None in JSON body
5. Error test: send missing/wrong fields, assert status 400
6. Run `pytest tests/test_api.py -v` and confirm all pass

## Rules
- Never test against the real skill_forge.db — always use a fixture DB
- Every test function name must start with `test_`
- Do not share state between tests — each test is independent

## Verification checklist
- [ ] `pytest tests/test_api.py -v` shows all PASSED
- [ ] At least 2 tests per endpoint (happy + error)
- [ ] No test modifies the real database
