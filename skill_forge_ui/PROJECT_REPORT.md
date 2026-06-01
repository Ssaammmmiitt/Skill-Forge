# Skill Forge UI — Project Report

**Last updated:** June 2026  
**Stack:** React 18 · Vite · Tailwind CSS v4 · Zustand · React Router v6 · Axios · Lucide React  
**Backend:** FastAPI (`python -m api.app` on port 5000)

This document consolidates all phase verification notes, integration guides, theme docs, and progress reports into a single source of truth for the frontend.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Design system (SYSTEM//FUSION)](#design-system-systemfusion)
3. [Theme system](#theme-system)
4. [Routing & authentication](#routing--authentication)
5. [Pages & features](#pages--features)
6. [API integration](#api-integration)
7. [State management](#state-management)
8. [Project structure](#project-structure)
9. [Implementation history](#implementation-history)
10. [Verification & quality](#verification--quality)
11. [Testing guide](#testing-guide)
12. [Deployment](#deployment)
13. [Known limitations](#known-limitations)

---

## Quick start

```bash
# Backend (repo root)
pip install -r requirements.txt
python -m api.app

# Frontend
cd skill_forge_ui
npm install
npm run dev
```

Open **http://localhost:5173** (or the next free port Vite assigns).

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin when not using Vite proxy (e.g. `http://localhost:5000`) |
| `VITE_GOOGLE_CLIENT_ID` | Optional Google Sign-In (GIS) |

**Production build:** `npm run build` → output in `dist/`. Preview with `npm run preview`.

---

## Design system (SYSTEM//FUSION)

Three visual systems in deliberate tension — do not harmonize them. Full spec: [`../DESIGN.md`](../DESIGN.md).

| System | Primary pages | Character |
|--------|---------------|-----------|
| **RawBlock** | Login, Logger, Admin, Landing CTAs | Brutalist: 0px radius, 3–5px borders, Archivo Black, no shadows |
| **StarChart** | Register, Profile, Analytics, Learning Path | Cosmic: soft radius 8–16px, Fredoka headers, nebula glows |
| **Arcade** | Quiz, Leaderboard | Retro: black screen, dotted borders, Press Start 2P (min 8px) |
| **Collision** | Dashboard | All three systems in horizontal bands |

### Constraints (audit checklist)

- **RawBlock / Arcade:** `border-radius: 0`, no `box-shadow`, borders ≥ 3px
- **StarChart:** glow only on cards; never mix `glow-nebula` + `glow-star` on one element
- **Arcade font:** never below 8px
- **Link blue (`#0000FF` / `text-raw-link`):** only on `<a>`, never buttons
- **Shared UI:** `ButtonOffset` (brutalist offset shadow), `ButtonRaw`, `ButtonStar`, `ButtonArcade`, cards, badges, `Spinner`, `Modal`, `Toast`, Recharts wrappers

```bash
# Design integrity greps (from repo root)
cd skill_forge_ui
grep -r "rounded-sm\|rounded-md\|rounded-lg" src/components/ui/ButtonRaw.jsx src/components/ui/CardRaw.jsx
grep -r "shadow-" src/components/ui/ButtonRaw.jsx src/components/ui/CardArcade.jsx
```

---

## Theme system

Dark mode is default; light mode inverts palettes per system while keeping fusion identity.

| Piece | Location |
|-------|----------|
| Store | `src/store/useThemeStore.js` — `theme`, `setTheme`, `toggleTheme` |
| Persistence | `localStorage` key `sf_theme` |
| Boot | `initTheme()` in `main.jsx` |
| Tokens | `src/index.css` — `:root[data-theme="dark|light"]` CSS variables |
| Toggle | `ThemeToggle.jsx` — public header, sidebar, top bar, quiz |
| Charts | `src/utils/themeColors.js` for Recharts when CSS vars are insufficient |

**RawBlock:** dark = black bg / white text; light = white bg / black text.  
**StarChart:** dark = deep purple `#1E1B4B`; light = lavender `#F0EDFF`.  
**Arcade:** dark = black + yellow accents; light = lemon `#FFFACD` + amber accents.

`ButtonOffset` uses `--btn-offset-*` variables for theme-aware offset shadows.

---

## Routing & authentication

### Public routes

| Route | Page |
|-------|------|
| `/` | Landing (marketing + interactive demo) |
| `/login` | Sign in (email/username + password, optional Google) |
| `/register` | Account creation + username picker |

Logged-in users on `/`, `/login`, `/register` redirect to `/dashboard`.

### Protected routes (`ProtectedRoute` + JWT)

All routes below require `useAuthStore.isAuthenticated`. Unauthenticated access → `/login` with `state.from` for post-login redirect.

| Route | Page | Layout |
|-------|------|--------|
| `/dashboard` | Dashboard | App shell (sidebar + top bar) |
| `/app/profile` | Profile | App shell |
| `/app/log` | Activity logger | App shell |
| `/app/path` | Learning path | App shell |
| `/app/analytics` | Analytics | App shell |
| `/app/leaderboard` | Leaderboard | App shell |
| `/app/admin` | Model admin | App shell |
| `/app/test` | Component gallery | App shell |
| `/quiz` | Adaptive quiz | Full-screen (no sidebar) |

**Legacy shortcuts** (protected): `/analytics`, `/log`, `/profile`, `/leaderboard`, `/path`, `/admin` → redirect into `/app/...`.

**Catch-all:** `*` → `/` (landing).

### Auth features

- Email registration: name, username (suggestions + availability), email, password
- Login: `identifier` (username or email) + password; `PasswordInput` with show/hide (Lucide Eye / EyeOff)
- Google Sign-In via `VITE_GOOGLE_CLIENT_ID` + `useGoogleSignIn`
- JWT in `localStorage`; axios `Authorization: Bearer`
- Logout clears auth + student store

---

## Pages & features

### Landing (`/`)

Hero, `ButtonOffset` CTAs, interactive difficulty blocks (1–10), learning-style selector, features grid, stats, footer.

### Dashboard (`/dashboard`)

Welcome hero, StarChart metrics (accuracy, streak, energy), XP progress, arcade session band, quick actions (`ButtonOffset`), recent sessions from analytics API.

### Quiz (`/quiz`)

Arcade flow: start → questions → feedback → complete. `GET /api/quiz/{difficulty}`, `POST /api/quiz/submit`. Timer, keyboard 1–4 / A–D, server sync for XP/level, level-up modal, theme toggle.

### Logger (`/app/log`)

Study, sleep, tasks → `POST /api/student/log-activity`; refreshes student profile.

### Profile (`/app/profile`)

Identity, StatRings, learning style, session history.

### Analytics (`/app/analytics`)

Score/difficulty/time trends, style distribution, consistency, cognitive radar — `GET /api/analytics/{id}`.

### Leaderboard (`/app/leaderboard`)

Top players; sort XP / INT / WIS — `GET /api/leaderboard`.

### Admin (`/app/admin`)

Model metrics, retrain — `GET/POST /api/admin/*`.

### Component test (`/app/test`)

Internal Raw / Star / Arcade component showcase.

---

## API integration

- **Client** (`src/api/client.js`): base URL from `VITE_API_URL` or Vite proxy `/api`; unwraps `{ data, error, status }` → `data`
- **Modules:** `auth.js`, `student.js`, `quiz.js`, `analytics.js`, `admin.js`
- **Pattern:** pages use hooks or store methods — avoid raw axios in components

**Expected endpoints:**

| Method | Path | Use |
|--------|------|-----|
| POST | `/api/auth/register`, `/login`, `/google` | Auth |
| GET | `/api/auth/username/suggestions`, `/check` | Username |
| GET | `/api/student/:id` | Profile |
| POST | `/api/student/log-activity` | Logger |
| GET | `/api/quiz/:difficulty` | Quiz load |
| POST | `/api/quiz/submit` | Quiz submit |
| GET | `/api/analytics/:id` | Analytics |
| GET | `/api/leaderboard` | Leaderboard |
| GET | `/api/admin/metrics` | Admin |
| POST | `/api/admin/retrain` | Retrain |

---

## State management

| Store | Purpose |
|-------|---------|
| `useAuthStore` | User, token, `isAuthenticated` |
| `useStudentStore` | Profile; `refreshStudent`, `applyActivityResult` |
| `useThemeStore` | Dark / light |
| `useNotifStore` | Toasts, level-up modal |
| `useQuizStore` | Quiz session (if used) |

**Hooks:** `useStudent`, `useQuiz`, `useAnalytics`, `useGoogleSignIn`.

---

## Project structure

```
skill_forge_ui/
├── src/
│   ├── api/                 # client, auth, student, quiz, analytics, admin
│   ├── components/
│   │   ├── auth/            # ProtectedRoute, UsernamePicker
│   │   ├── charts/          # Line, Bar, Radar (memoized)
│   │   ├── layout/          # AppLayout, Sidebar, TopBar, PublicHeader, BrandLogo
│   │   └── ui/              # Design primitives, ButtonOffset, ThemeToggle, PasswordInput
│   ├── hooks/
│   ├── pages/               # Lazy-loaded route components
│   ├── store/
│   ├── utils/               # theme.js, themeColors.js
│   ├── App.jsx
│   └── main.jsx
├── PROJECT_REPORT.md        # This file
├── README.md                # Short overview + link here
└── package.json
```

---

## Implementation history

Condensed from Phase 1–4 docs (original files removed; content preserved here).

| Phase | Focus | Deliverables |
|-------|--------|--------------|
| **1 — Scaffolding** | Tooling + primitives | Vite/React/Tailwind, fonts, `ButtonRaw` / `ButtonStar` / `ButtonArcade`, cards, badges, spinners, Login + Register shells, design constraint verification |
| **2 — Core pages** | Real layouts + charts | Dashboard (three-system collision), Profile + StatRings, Analytics (Recharts), Component Test, enhanced Spinner/empty states |
| **3 — Interactive** | Game + forms | Full Quiz arcade flow (timer, streak, XP), Logger (study/sleep/tasks, validation, toasts), full-screen routes with exit controls |
| **4 — API** | Backend wiring | Axios client + hooks, all pages on live FastAPI, Leaderboard + Admin built, Analytics rebuilt with real data |
| **Polish** | Ship readiness | ErrorBoundary (fusion fallback), lazy routes + Suspense, level-up modal, document titles, keyboard shortcuts, chart memoization, theme system, JWT auth + protected routes, Landing + username system |

---

## Verification & quality

### Build

- `npm run build` — zero errors (~1.5s typical)
- Lazy chunks per page; Recharts loaded on chart routes
- Initial load ~220 KB gzipped (varies with dependencies)

### Design audit (passed)

- No rounded corners on RawBlock/Arcade primitives
- No shadows on RawBlock/Arcade
- Arcade text ≥ 8px
- Link color only on anchors

### Runtime hardening

- **ErrorBoundary** at app root — fusion-styled recovery UI
- **Loading / empty / error** states on Profile, Dashboard, Quiz, Logger, Analytics, Leaderboard, Admin
- **Level-up modal** when `new_level > old_level` after quiz submit (5s auto-close)
- **Document titles** on all major pages

### Optional follow-ups (non-blocking)

- Mobile: collapsible sidebar, stacked dashboard metrics
- Skeleton loaders vs spinners only
- PWA / offline
- Dashboard rank API (`#--` until endpoint exists)

---

## Testing guide

### 5-minute smoke test

1. Register → land on `/dashboard`
2. Start quiz → answer one question → exit or complete
3. Log a study session on `/app/log`
4. Confirm dashboard/analytics reflect server data
5. Toggle theme (sidebar or header) → refresh → preference persists
6. Logout → protected URL redirects to login

### Manual checklist

- [ ] All protected routes require login
- [ ] Login redirect returns to `state.from`
- [ ] Password show/hide on login and register
- [ ] Quiz keys 1–4 and A–D select answers
- [ ] Level-up modal on level increase
- [ ] Error boundary: throw in dev → recovery UI
- [ ] FastAPI off → graceful error states, no white screen

### Recommended tour (logged in)

`Dashboard` → `Profile` → `Analytics` → `Quiz` (full flow) → `Logger` → `Leaderboard` → `Admin` → `/app/test`

---

## Deployment

1. `npm run build`
2. Serve `dist/` with SPA fallback (`try_files … /index.html`)
3. Proxy `/api` to FastAPI backend
4. Set `VITE_API_URL` at build time for production API host

**Nginx sketch:**

```nginx
location / {
  root /var/www/skill-forge-ui/dist;
  try_files $uri $uri/ /index.html;
}
location /api {
  proxy_pass http://localhost:5000;
}
```

---

## Known limitations

- Google Sign-In needs authorized JavaScript origins per dev port in Google Cloud Console
- Some dashboard accents may still use hardcoded colors; most surfaces use theme tokens
- Legacy files `*_old.jsx` may exist but are not routed
- Mobile UX is functional but not fully optimized (sidebar always visible on desktop layout)

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [`../DESIGN.md`](../DESIGN.md) | Full fusion design specification |
| [`../README.md`](../README.md) | Monorepo overview + run instructions |
| [`../api/README.md`](../api/README.md) | FastAPI backend API |
| [`README.md`](./README.md) | UI folder quick reference |

---

*Skill Forge UI — consolidated project report.*
