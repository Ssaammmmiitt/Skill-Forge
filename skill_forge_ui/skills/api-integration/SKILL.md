# API integration skill

## What this skill is for
Use this when replacing mock data with real API calls in any page or hook.

## Environment facts
- Axios instance: src/api/client.js (base URL from VITE_API_URL env var)
- All API functions live in src/api/ — one file per domain
- Vite proxy: /api → http://localhost:5000 (configured in vite.config.js)

## Step-by-step instructions
1. Write the API function in the correct src/api/ file first
2. Create a custom hook in src/hooks/ that calls it (e.g. useStudent.js)
3. The hook must return: { data, loading, error }
4. In the page: show <Spinner> while loading is true
5. Show an error message if error is not null
6. Only render data-dependent UI after loading is false and error is null
7. Delete or comment out the mockData import after confirming live data works

## Rules
- Never call axios directly from a page — always through the hook
- All API errors must be caught and stored in the error state
- Never show raw error objects to the user — show a friendly message string
- The mock swap must be atomic: either fully mocked or fully live, not mixed

## Verification checklist
- [ ] Network tab in browser shows real requests to /api/...
- [ ] Loading spinner appears before data loads
- [ ] If the Flask server is off, the page shows an error message (not a crash)
- [ ] No mockData import remaining in the file