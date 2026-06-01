# Skill Forge UI

Adaptive learning platform frontend — **SYSTEM//FUSION** design (RawBlock · StarChart · Arcade).

## Quick start

```bash
npm install
npm run dev
```

Requires the FastAPI backend on port 5000 (or set `VITE_API_URL`). See the repo root [`README.md`](../README.md).

## Documentation

| Doc | Contents |
|-----|----------|
| **[PROJECT_REPORT.md](./PROJECT_REPORT.md)** | Full project report: routes, auth, features, API, theme, testing, deployment, phase history |
| **[../DESIGN.md](../DESIGN.md)** | Design system specification |

## Stack

React 18 · Vite · Tailwind CSS v4 · Zustand · React Router · Axios · Recharts · Lucide React

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Environment

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
