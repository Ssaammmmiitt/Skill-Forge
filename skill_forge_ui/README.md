# SKILL FORGE UI

Adaptive learning system with gamification - React + Vite + Tailwind CSS

## Three Design Systems in Tension

### 🔲 RawBlock (Brutalist)
- **Purpose:** Structural chrome, navigation, layout skeleton
- **Style:** Sharp 0px borders, 3–5px black/white borders, no shadows, Archivo Black font
- **Components:** ButtonRaw, CardRaw, BadgeRaw, MetricRaw, ProgressRaw
- **Pages:** Login, Logger, Admin

### ⭐ StarChart (Cosmic)
- **Purpose:** Learning data, stats, cognitive attributes
- **Style:** Glows instead of borders, rounded corners (8–16px), purple/yellow palette, Fredoka font
- **Components:** ButtonStar, CardStar, BadgeStar, MetricStar, ProgressStar, StatRing
- **Pages:** Dashboard, Profile, LearningPath, Analytics, Register

### 🎮 Arcade (Retro)
- **Purpose:** Quiz, scoring, XP, game mechanics
- **Style:** Dotted borders, 0px radius, electric blue, Press Start 2P font
- **Components:** ButtonArcade, CardArcade, BadgeArcade, MetricArcade
- **Pages:** Quiz, Leaderboard

## Quick Start

```bash
cd skill_forge_ui
npm install
npm run dev
```

Visit: http://localhost:5173/

## Routes

- `/login` - RawBlock sign-in page
- `/register` - StarChart account creation
- `/` - Dashboard (StarChart)
- `/profile` - Student profile with attributes
- `/quiz` - Adaptive quiz interface (Arcade) ✅ Phase 3
- `/log` - Manual activity logger (RawBlock) ✅ Phase 3
- `/path` - Learning journey visualization (StarChart)
- `/analytics` - Performance charts (StarChart)
- `/leaderboard` - Top students (Arcade)
- `/admin` - System management (RawBlock)
- `/test` - Component showcase (all systems)

## Design Constraints

### Hard Rules (Never Violate)
- ❌ NEVER round corners in RawBlock (`borderRadius: '0px'` enforced)
- ❌ NEVER use shadows in RawBlock or Arcade
- ❌ NEVER use `#0000FF` (raw-link) for anything except hyperlinks
- ❌ NEVER combine star-glow AND nebula-glow on same element
- ❌ NEVER use Press Start 2P below 8px
- ❌ NEVER mix button systems within a page

### Enforced Patterns
- ✅ RawBlock uses 3–5px solid borders as primary organizer
- ✅ StarChart uses glows (`box-shadow`) instead of borders
- ✅ Arcade uses 3px dotted borders
- ✅ `#FDE047` (space-star) ONLY for achievements, CTAs, scoreboard values
- ✅ AppLayout creates the RawBlock/StarChart seam (black nav + purple content)

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 4** - Styling (with custom design tokens)
- **React Router 6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization (Phase 2)

## Folder Structure

```
src/
├── api/           # API client + endpoints
├── components/
│   ├── ui/        # Design system primitives (17 components)
│   ├── layout/    # AppLayout, Sidebar, TopBar
│   └── charts/    # Recharts wrappers (Phase 2)
├── pages/         # Route components (10 pages)
├── store/         # Zustand stores (auth, student, quiz, notifications)
├── hooks/         # Custom React hooks
└── utils/         # Constants, formatters, mock data
```

## Development

### Mock Data
Mock student data is pre-loaded in `useStudentStore` for Phase 1–3 development:
- Student: ARIA VOSS (INT: 72, WIS: 58, XP: 1240, Level 2)
- Sessions history with 5 entries
- Leaderboard with 5 students

### API Proxy
Vite dev server proxies `/api/*` requests to `http://localhost:5000`

### Verification
See `VERIFICATION.md` for complete scaffolding checklist

## Google Fonts

All 6 fonts are loaded from Google Fonts CDN:
1. **Press Start 2P** - Arcade system
2. **Archivo Black** - RawBlock headlines
3. **Work Sans** - RawBlock body text
4. **Fredoka** - StarChart headlines
5. **DM Sans** - StarChart body text
6. **Space Mono** - Monospace (all systems)

## Custom Tailwind Tokens

### Colors (18 total)
- `raw-*` (6 colors) - RawBlock palette
- `space-*` (9 colors) - StarChart palette  
- `arcade-*` (3 colors) - Arcade palette

### Fonts (6 families)
- `font-raw` → Archivo Black
- `font-space` → Fredoka
- `font-arcade` → Press Start 2P
- `font-body` → Work Sans
- `font-body-space` → DM Sans
- `font-mono` → Space Mono

### Border Radius (5 values)
- `rounded-none` → 0px (RawBlock/Arcade)
- `rounded-sm` → 8px (StarChart)
- `rounded-md` → 12px (StarChart)
- `rounded-lg` → 16px (StarChart)
- `rounded-pill` → 9999px (StarChart buttons/badges)

## Phase Status

- ✅ **Phase 1:** Scaffolding Complete (17 UI components, 3 layouts, 10 pages)
- ✅ **Phase 2:** Real Pages Built (Dashboard, Profile, Analytics with charts)
- ✅ **Phase 3:** Quiz & Logger Pages (Pure system implementations)
- ⏳ **Phase 4:** Learning Path, Leaderboard, Admin, Backend Integration

---

Built with deliberate design tension. Three systems. One vision.
