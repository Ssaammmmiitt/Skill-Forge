# Skill Forge

> Adaptive learning platform with RPG-style progression, ML-powered personalization, and a unique **FUSION** design system combining brutalism, cosmic aesthetics, and retro arcade vibes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![React](https://img.shields.io/badge/react-18-61dafb)

---

## Overview

Skill Forge is an adaptive learning platform that gamifies education through:

- **RPG-style Attributes** — INT, WIS, energy, XP, and leveling system
- **Adaptive Quiz System** — Difficulty adjusts based on performance
- **ML-Powered Personalization** — Predicts learning styles using decision trees and neural networks
- **Interactive Learning Path** — 3D skill constellation with real-time progress tracking
- **Gamification** — Streaks, achievements, leaderboards, and XP rewards
- **Unique UI Design** — FUSION design system: RawBlock (brutalism) + StarChart (cosmic) + Arcade (retro)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | FastAPI + Uvicorn |
| **Database** | SQLite with SQLAlchemy ORM |
| **Auth** | JWT (HS256) + Bcrypt + Google OAuth |
| **State** | Zustand with persistence |
| **ML** | scikit-learn (Decision Tree) + PyTorch (MLP) |
| **Charts** | Recharts |
| **Animations** | Framer Motion |

---

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Skill-Forge.git
cd Skill-Forge
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: Set JWT_SECRET_KEY and optional GOOGLE_CLIENT_ID

# Start backend server
python -m api.app
```

Backend runs at **http://127.0.0.1:5001** (default port changed to avoid macOS AirPlay conflicts)

### 3. Frontend Setup

```bash
cd skill_forge_ui

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: Set VITE_API_URL=http://localhost:5001

# Start development server
npm run dev
```

Frontend runs at **http://localhost:5173** (or next available port)

### 4. First Run

1. Visit `http://localhost:5173`
2. Register a new account (email + username + password)
3. Complete a quiz to unlock the dashboard
4. Explore:
   - **Dashboard** — Overview with collision design
   - **Learning Path** — Interactive 3D skill constellation
   - **Analytics** — Performance trends and learning style insights
   - **Leaderboard** — Compete with other students

---

## Project Structure

```
Skill-Forge/
├── api/                      # FastAPI backend
│   ├── app.py               # App entry point
│   ├── routers/             # Route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   └── game.py          # Game/learning endpoints
│   ├── services/            # Business logic
│   │   ├── auth_store.py    # User management
│   │   └── jwt_auth.py      # JWT utilities
│   ├── deps.py              # FastAPI dependencies
│   ├── responses.py         # Response helpers
│   └── exceptions.py        # Custom exceptions
│
├── skill_forge_ui/          # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Design system components
│   │   │   ├── layout/      # Layout components
│   │   │   └── learningPath/ # Learning Path features
│   │   ├── pages/           # Route pages
│   │   ├── store/           # Zustand stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api/             # API client
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── DESIGN.md            # Design system documentation
│
├── skill_forge/data/        # Database & models
│   ├── models.py            # SQLAlchemy models
│   └── skill_forge.db       # SQLite database
│
├── engine/                  # Game mechanics
│   ├── attributes.py        # INT/WIS/Energy calculations
│   ├── rewards.py           # XP & leveling system
│   └── adaptive.py          # Difficulty adjustment
│
├── models/                  # ML artifacts
│   ├── dt_model.pkl         # Decision tree model
│   ├── nn_model.pt          # Neural network model
│   ├── scaler.pkl           # Feature scaler
│   └── label_encoder.pkl    # Learning style encoder
│
├── tests/                   # Test suite
│   └── test_api.py          # API tests
│
├── reports/                 # Evaluation outputs
├── config.py                # Global configuration
└── requirements.txt         # Python dependencies
```

---

## Features

### 🎮 Gamification System

- **XP & Leveling** — Earn XP from quizzes, level up, and track progress
- **Attributes** — INT, WIS, and Energy that affect learning outcomes
- **Streaks** — Maintain daily quiz streaks for bonus rewards
- **Achievements** — Unlock milestones as you progress
- **Leaderboard** — Compete globally on XP, INT, or WIS

### 🧠 Adaptive Learning

- **Dynamic Difficulty** — Quiz difficulty adjusts based on performance
- **Learning Style Prediction** — ML models identify your learning patterns
- **Personalized Recommendations** — Skill suggestions based on current progress
- **Progress Tracking** — Detailed analytics on trends and consistency

### 🎨 Design System — SYSTEM//FUSION

Three distinct design languages in deliberate tension:

1. **RawBlock** (Brutalism)
   - Heavy borders, high contrast
   - Monospace fonts, uppercase
   - Black/white/gray palette

2. **StarChart** (Cosmic)
   - Gradients, glows, nebulas
   - Purple/blue space theme
   - Smooth animations

3. **Arcade** (Retro)
   - Pixelated fonts (Press Start 2P)
   - Dotted borders, neon colors
   - 8-bit aesthetic

### 🛣️ Interactive Learning Path

- **3D Skill Constellation** — Mouse-controlled rotation with CSS 3D transforms
- **Visual Dependencies** — Connection lines show prerequisite skills
- **Status Indicators** — Color-coded mastery levels (Locked → Started → Learning → Mastered)
- **Achievement Notifications** — Animated pop-ups for milestones
- **Skill Recommendations** — AI-driven suggestions for next steps
- **Tutorial Overlay** — First-time user onboarding

### 🔐 Authentication

- **Email/Password** — Secure bcrypt hashing
- **Google OAuth** — One-click sign-in
- **Username System** — Unique usernames with smart suggestions
- **JWT Tokens** — 24-hour expiry with automatic refresh
- **Protected Routes** — Client-side route guards

### 📊 Analytics & Insights

- **Performance Trends** — XP, score, and difficulty over time
- **Learning Style History** — Track how your style evolves
- **Consistency Metrics** — Quiz frequency and streak tracking
- **Skill Radar** — Visual breakdown of attribute mastery

---

## API Documentation

### Response Format

All endpoints return a consistent envelope:

```json
{
  "data": { ... },
  "error": null,
  "status": 200
}
```

### Authentication Endpoints (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/register` | Create account (email, username, password, name) |
| `POST` | `/login` | Login with username/email + password |
| `POST` | `/google` | Google OAuth login |
| `POST` | `/username/suggestions` | Get username suggestions from first name |
| `POST` | `/username/check` | Check username availability |
| `GET` | `/verify` | Verify JWT token |
| `POST` | `/logout` | Logout (client-side token removal) |

### Game Endpoints (`/api`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/student/{id}` | Get student profile |
| `POST` | `/student/log-activity` | Log study/sleep/task activity |
| `GET` | `/quiz/{difficulty}` | Get quiz questions (1-10 difficulty) |
| `POST` | `/quiz/submit` | Submit quiz answers, get results |
| `GET` | `/leaderboard` | Get top 10 students (sort by xp/INT/WIS) |
| `GET` | `/analytics/{id}` | Get student analytics |
| `GET` | `/admin/metrics` | Get ML model comparison metrics |
| `POST` | `/admin/retrain` | Retrain ML models (admin only) |

Interactive API docs: **http://127.0.0.1:5001/docs**

---

## Environment Configuration

### Backend (`.env`)

```env
PORT=5001                                    # API server port
DEBUG=True                                   # Enable debug mode
JWT_SECRET_KEY=your-secret-key-here         # JWT signing secret
GOOGLE_CLIENT_ID=your-google-client-id      # Google OAuth (optional)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend (`skill_forge_ui/.env`)

```env
VITE_API_URL=http://localhost:5001          # Backend URL
VITE_GOOGLE_CLIENT_ID=your-google-client-id # Google OAuth (optional)
```

---

## Development Guide

### Running Tests

```bash
# Backend tests (pytest)
pytest tests/test_api.py -v

# Manual auth test (server must be running)
python test_auth.py
```

### Building for Production

```bash
# Frontend build
cd skill_forge_ui
npm run build
npm run preview

# Backend (use production WSGI server)
pip install gunicorn
gunicorn api.app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Database Management

```bash
# Database is automatically created on first run
# Location: skill_forge/data/skill_forge.db

# To reset database (WARNING: deletes all data)
rm skill_forge/data/skill_forge.db
python -m api.app  # Recreates tables
```

### ML Model Training

```bash
# Retrain models using existing session data
# Option 1: Via API (backend must be running)
curl -X POST http://localhost:5001/api/admin/retrain

# Option 2: Direct script
python -m models.train_models
```

---

## UI Routes

| Path | Page | Design System |
|------|------|---------------|
| `/` | Landing Page | Collision |
| `/login` | Login | RawBlock |
| `/register` | Register | RawBlock |
| `/dashboard` | Dashboard | Collision (all 3) |
| `/quiz` | Quiz Assessment | Arcade |
| `/app/profile` | Student Profile | StarChart |
| `/app/learning-path` | Learning Path | StarChart |
| `/app/log` | Activity Logger | RawBlock |
| `/app/analytics` | Analytics | StarChart |
| `/app/leaderboard` | Leaderboard | StarChart |
| `/app/admin` | Admin Dashboard | RawBlock |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check if port 5001 is available; update `PORT` in `.env` |
| **CORS errors** | Add your frontend URL to `CORS_ORIGINS` in backend `.env` |
| **Network error in UI** | Verify backend is running; check `VITE_API_URL` in frontend `.env` |
| **Username suggestions fail** | Backend needs to migrate database; restart backend |
| **Google Sign-In blocked** | Verify `GOOGLE_CLIENT_ID` matches in both `.env` files |
| **Quiz won't load** | Backend offline or database missing; check console for errors |
| **XP bar not visible** | Clear localStorage and refresh; issue fixed in v1.2 |
| **Learning Path nodes overlap** | Fixed in latest version; clear cache and refresh |
| **Max update depth error** | Fixed in v1.3; update to latest commit |

---

## Recent Updates (v1.3)

### ✅ Learning Path Enhancements
- Added 3D skill constellation with mouse-controlled rotation
- Implemented skill unlock animations with Framer Motion
- Added achievement notification system
- Built AI-powered skill recommendation engine
- Created interactive tutorial overlay for first-time users

### ✅ UI/UX Improvements
- Enhanced Quiz page with hover effects and larger elements
- Fixed sidebar progress bar visibility in dark/light modes
- Improved XP display accuracy across all pages
- Added smooth transitions and animations throughout

### ✅ State Management
- Integrated Zustand persistence for localStorage
- Student data now persists across page refreshes
- Fixed auth context loss in ErrorBoundary
- Optimized state updates to prevent infinite loops

### ✅ Bug Fixes
- Fixed infinite loop in achievement notification hook
- Resolved node layering issues in Learning Path
- Fixed CORS preflight errors (moved to port 5001)
- Improved error handling in Admin dashboard

---

## Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: ~250KB (gzipped)
- **API Response Time**: < 100ms (average)

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See `LICENSE` file for details.

---

## Acknowledgments

- **Design System** — Inspired by brutalism, space aesthetics, and retro gaming
- **ML Models** — Built with scikit-learn and PyTorch
- **UI Framework** — React ecosystem with Vite, Tailwind, and Framer Motion
- **Backend** — FastAPI for modern Python web APIs

---

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/Skill-Forge/issues)
- **Documentation**: See `skill_forge_ui/PROJECT_REPORT.md` for detailed frontend docs
- **Design System**: See `DESIGN.md` for full design specification

---

**Built with ❤️ by the Skill Forge team**
