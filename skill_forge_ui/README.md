# Skill Forge UI

> React frontend for Skill Forge — Adaptive learning platform with **SYSTEM//FUSION** design system

## Quick Start

```bash
npm install
npm run dev
```

**Requires backend running on port 5001** (see [root README](../README.md))

## Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS v4** — Styling with custom design tokens
- **Zustand** — State management with localStorage persistence
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with interceptors
- **Recharts** — Data visualization
- **Framer Motion** — Animations
- **Lucide React** — Icons

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Design system components
│   ├── layout/          # Sidebar, TopBar, AppLayout
│   └── learningPath/    # Learning Path features
├── pages/               # Route components
├── store/               # Zustand stores
├── hooks/               # Custom React hooks
├── api/                 # API client & services
└── utils/               # Helper functions
```

## Documentation

| Document | Description |
|----------|-------------|
| [**PROJECT_REPORT.md**](./PROJECT_REPORT.md) | Complete frontend documentation: features, routes, theme system, implementation history |
| [**../README.md**](../README.md) | Main project README with setup & API docs |
| [**../DESIGN.md**](../DESIGN.md) | Full SYSTEM//FUSION design specification |

## Key Features

- **Fusion Design System** — Three colliding design languages (RawBlock, StarChart, Arcade)
- **Dark/Light Modes** — Full theme support with CSS variables
- **Persistent State** — Zustand with localStorage sync
- **Protected Routes** — JWT authentication with route guards
- **Error Boundaries** — Graceful error handling with context preservation
- **Code Splitting** — React.lazy() for optimized loading
- **Responsive Design** — Mobile-first approach
- **Accessibility** — ARIA labels and keyboard navigation

## Development Notes

- Port 5173 is default; Vite auto-assigns next available if busy
- Vite proxies `/api` requests to backend (configured in `vite.config.js`)
- Hot module replacement (HMR) enabled for fast development
- Design tokens defined in `tailwind.config.js` and `src/index.css`
- Theme state managed by `useThemeStore` with system preference detection

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

---

For full setup instructions and troubleshooting, see [root README](../README.md)
