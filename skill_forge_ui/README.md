# SKILL FORGE UI

Adaptive learning platform with behavioral pattern recognition and real-time difficulty adjustment.

## DESIGN SYSTEM

**SYSTEM//FUSION** — RawBlock · StarChart · Arcade

Three systems in deliberate tension. Do not harmonize them.

### Page-to-System Mapping

| System | Pages | Characteristics |
|--------|-------|-----------------|
| **RawBlock** | Login, Logger, Admin | White backgrounds, thick borders (3px-5px), Archivo Black, brutalist sharp edges, no rounded corners, no shadows |
| **StarChart** | Register, Profile, Analytics, Learning Path | Deep space (#1E1B4B), nebula glows, soft rounded corners (8px-16px), Fredoka headers, cosmic gradient feel |
| **Arcade** | Quiz, Leaderboard | Black screen (#000), dotted borders (3px), Press Start 2P, retro pixel aesthetic, no rounded corners, no shadows |
| **Collision** | Dashboard | All three systems coexist in horizontal bands - intentional visual tension |

### Design Constraints

#### RawBlock Rules
- **Border radius**: 0px everywhere (no exceptions)
- **Shadows**: None (no box-shadow, no drop-shadow)
- **Borders**: 3px minimum, 5px for emphasis
- **Font**: Archivo Black (inherently bold, never use font-bold class)
- **Colors**: Pure black (#000) and white (#FFF) only
- **Link color**: #0000FF (only for `<a>` tags, never buttons)

#### StarChart Rules
- **Border radius**: 8px-16px (soft, cosmic feel)
- **Shadows**: Nebula glow only (`0 0 8px rgba(167,139,250,0.3)`)
- **Never combine**: glow-nebula + glow-star in same element
- **Font**: Fredoka (600 weight) for headers, DM Sans for body
- **Star yellow** (#FDE047): Reserved for achievements and primary CTAs only

#### Arcade Rules
- **Border radius**: 0px everywhere (sharp pixel aesthetic)
- **Shadows**: None
- **Borders**: 3px dotted (#FDE047 in dark mode, #D97706 in light mode)
- **Font**: Press Start 2P minimum 8px (never 6px or 7px)
- **Background**: Pure black (#000)
- **No gradients**: No glassmorphism, no blur effects

## TECH STACK

- **React 18** — UI framework
- **Vite** — Build tool and dev server
- **TailwindCSS 4** — Utility-first CSS with custom design tokens
- **Zustand** — Lightweight state management
- **Recharts** — Data visualization
- **Axios** — HTTP client for API integration
- **React Router v6** — Client-side routing

## FONTS

All fonts loaded via Google Fonts in `index.html`:

- **Archivo Black** — RawBlock system headers
- **Fredoka** (400, 600) — StarChart system headers
- **Press Start 2P** — Arcade system (all text)
- **Work Sans** (400, 600) — General body text
- **DM Sans** (400, 600) — StarChart body text
- **Space Mono** — Monospace for code/data

## PROJECT STRUCTURE

```
skill_forge_ui/
├── src/
│   ├── api/              # API client and endpoint functions
│   │   ├── client.js     # Axios instance with interceptors
│   │   ├── student.js    # Student-related endpoints
│   │   ├── quiz.js       # Quiz endpoints
│   │   ├── analytics.js  # Analytics and leaderboard
│   │   └── admin.js      # Admin endpoints
│   ├── components/
│   │   ├── charts/       # Recharts wrappers (memoized)
│   │   ├── layout/       # AppLayout, Sidebar, Topbar
│   │   └── ui/           # Design system primitives
│   ├── hooks/            # Custom React hooks
│   │   ├── useStudent.js
│   │   ├── useQuiz.js
│   │   └── useAnalytics.js
│   ├── pages/            # Route components (lazy-loaded)
│   ├── store/            # Zustand stores
│   │   ├── useAuthStore.js
│   │   ├── useStudentStore.js
│   │   ├── useNotifStore.js
│   │   ├── useQuizStore.js
│   │   └── useThemeStore.js
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Router and Suspense wrapper
│   └── main.jsx          # Entry point with ErrorBoundary
├── public/               # Static assets
├── vite.config.js        # Vite configuration + proxy
├── tailwind.config.js    # Custom design tokens
└── package.json
```

## SETUP

### Prerequisites
- Node.js 18+ and npm
- Flask backend running on `localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start dev server (defaults to :5173, may use :5174 if port busy)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Configuration

The Vite dev server proxies `/api` requests to `http://localhost:5000`. Ensure your Flask backend is running before starting the frontend.

**API Endpoints Expected:**
- `GET /api/student/:id` — Fetch student data
- `POST /api/student/log-activity` — Log study/sleep activities
- `GET /api/quiz/:difficulty` — Load quiz questions
- `POST /api/quiz/submit` — Submit quiz answers
- `GET /api/analytics/:id` — Fetch analytics data
- `GET /api/leaderboard?sort_by=` — Fetch ranked players
- `GET /api/admin/metrics` — Fetch model metrics
- `POST /api/admin/retrain` — Trigger model retraining

## KEY FEATURES

### Theme System (Dark/Light Mode)
- Toggle in sidebar (bottom)
- Persists in `localStorage` as `sf_theme`
- All three design systems adapt to theme
- CSS variable-based for zero-cost switching

### Level-Up Modal
- Triggers when quiz submission returns `new_level > old_level`
- Arcade-themed modal with celebration
- Auto-closes after 5 seconds
- Shows unlocked learning path

### Error Boundary
- Catches all React errors
- Displays all three design systems simultaneously (maximum tension)
- RawBlock error heading, Arcade error details, StarChart recovery button

### Lazy Loading
- All pages code-split and lazy-loaded
- Arcade-themed loading spinner
- Improves initial load time

### Keyboard Accessibility
- **Quiz page**: Press 1/2/3/4 or A/B/C/D to select answers
- **Logger page**: Enter key submits forms
- All interactive elements keyboard-accessible

## DEVELOPMENT GUIDELINES

### Adding New Pages

1. Create page component in `src/pages/`
2. Add document title: `useEffect(() => { document.title = 'SKILL FORGE // PAGE' }, [])`
3. Choose design system (RawBlock, StarChart, or Arcade)
4. Lazy-load in `App.jsx`: `const NewPage = lazy(() => import('./pages/NewPage'))`
5. Add route

### Creating Components

**Follow design system constraints strictly:**

```jsx
// ✅ GOOD (RawBlock)
<div className="bg-raw-white border-[3px] border-raw-black p-6" 
     style={{ borderRadius: '0px' }}>

// ❌ BAD (RawBlock with rounded corners)
<div className="bg-raw-white border-[3px] border-raw-black p-6 rounded-md">

// ✅ GOOD (Arcade font size)
<p className="font-arcade text-[8px]">

// ❌ BAD (Arcade font too small)
<p className="font-arcade text-[6px]">

// ✅ GOOD (Link color usage)
<a href="/" className="text-raw-link underline">

// ❌ BAD (Link color on button)
<button className="text-raw-link">
```

### State Management

- **Auth**: `useAuthStore` — User/token management
- **Student**: `useStudentStore` — Student attributes, XP, level
- **Notifications**: `useNotifStore` — Toasts, level-up modal
- **Quiz**: `useQuizStore` — Quiz history
- **Theme**: `useThemeStore` — Dark/light mode

### API Integration

Never call `axios` directly from components. Always use:
1. API functions in `src/api/`
2. Custom hooks in `src/hooks/`
3. Hooks return `{ data, loading, error, refetch }`

## TESTING

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Theme toggle works (dark ↔ light)
- [ ] Quiz keyboard shortcuts (1/2/3/4 select answers)
- [ ] Level-up modal triggers after quiz
- [ ] Logger forms submit with Enter key
- [ ] Charts render correctly in both themes
- [ ] Error boundary catches thrown errors
- [ ] Lazy loading: Network tab shows chunk files
- [ ] All document titles correct

### Design System Audit

Run these grep commands to verify design integrity:

```bash
# No rounded corners in RawBlock/Arcade
grep -r "rounded-sm\|rounded-md\|rounded-lg" src/components/ui/ButtonRaw.jsx
grep -r "rounded-sm\|rounded-md\|rounded-lg" src/components/ui/CardRaw.jsx
grep -r "rounded-sm\|rounded-md\|rounded-lg" src/components/ui/CardArcade.jsx
# Should return EMPTY

# No shadows in RawBlock/Arcade
grep -r "shadow-" src/components/ui/ButtonRaw.jsx
grep -r "shadow-" src/components/ui/CardArcade.jsx
# Should return EMPTY

# Arcade minimum font size
grep -r "font-arcade" src/
# Manually verify no text-[6px] or text-[7px]

# Link color only on <a> tags
grep -r "#0000FF\|raw-link" src/
# Should only appear in text-raw-link on <a> elements
```

## TROUBLESHOOTING

### Build Errors

**"Cannot find module"**: Ensure all lazy-loaded components have default exports
**Tailwind not applying**: Run `npm run dev` again (Vite may need restart)
**Theme not persisting**: Check localStorage for `sf_theme` key

### API Errors

**Network error**: Flask backend not running on `:5000`
**CORS error**: Check Vite proxy config in `vite.config.js`
**401 Unauthorized**: Token not set in `localStorage.getItem('sf_token')`

### Performance Issues

**Slow initial load**: Charts may be importing too much — verify lazy loading
**Re-renders**: Ensure chart components are memoized (`React.memo`)

## DEPLOYMENT

### Production Build

```bash
npm run build
```

Output in `dist/` folder. Serve with:
- **Nginx**: Point root to `dist/`, proxy `/api` to Flask backend
- **Vercel/Netlify**: Set build command to `npm run build`, output dir to `dist`

### Environment Variables

Create `.env` for production:

```
VITE_API_URL=https://api.yourproduction.com
```

Update `vite.config.js` proxy target accordingly.

## LICENSE

Proprietary — Skill Forge Learning Platform

## SUPPORT

For design system questions, refer to documentation in:
- `DESIGN.md` — Full design system spec
- `THEME_SYSTEM.md` — Dark/light mode implementation
- `PHASE*_VERIFICATION.md` — Implementation verification docs
