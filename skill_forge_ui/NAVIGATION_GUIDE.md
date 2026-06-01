# SKILL FORGE UI - NAVIGATION GUIDE

**Server:** http://localhost:5173/  
**Status:** ✅ RUNNING

---

## 🚀 QUICK START

### Option 1: Direct Dashboard Access
Visit: **http://localhost:5173/**

This is the main entry point showing the Dashboard with the three-system collision design.

### Option 2: Via Login Page
Visit: **http://localhost:5173/login**

Click **[DEV] Skip to Dashboard →** at the bottom to bypass authentication.

---

## 📍 ALL ROUTES

### Authentication Pages (No Layout)

| Route | Page | System | Description |
|-------|------|--------|-------------|
| `/login` | Login | RawBlock | Black brutal sign-in page |
| `/register` | Register | StarChart | Cosmic account creation |

### Main App Pages (With Sidebar Layout)

| Route | Page | System | Status | Description |
|-------|------|--------|--------|-------------|
| `/` | Dashboard | All 3 | ✅ Built | Three systems collision |
| `/profile` | Profile | StarChart | ✅ Built | Cognitive attributes + 5 StatRings |
| `/analytics` | Analytics | StarChart | ✅ Built | Real charts with Recharts |
| `/test` | Component Test | All 3 | ✅ Built | Component showcase |
| `/path` | Learning Path | StarChart | ⏳ Placeholder | Journey visualization |
| `/leaderboard` | Leaderboard | Arcade | ⏳ Placeholder | Rankings display |
| `/admin` | Admin | RawBlock | ⏳ Placeholder | System management |

### Full-Screen Pages (No Sidebar/Topbar)

| Route | Page | System | Status | Description |
|-------|------|--------|--------|-------------|
| `/quiz` | Quiz | Arcade | ✅ Built | Full arcade game screen |
| `/log` | Logger | RawBlock | ✅ Built | Full white form page |

---

## 🎯 NAVIGATION METHODS

### 1. From Dashboard (Main Entry)

**Using Sidebar (Left Navigation):**
- Click "DASHBOARD" → `/`
- Click "PROFILE" → `/profile`
- Click "QUIZ" → `/quiz` (full-screen arcade)
- Click "LOG ACTIVITY" → `/log` (full-screen forms)
- Click "LEARNING PATH" → `/path`
- Click "ANALYTICS" → `/analytics`
- Click "LEADERBOARD" → `/leaderboard`
- Click "ADMIN" → `/admin`

**Using Quick Action Buttons (Dashboard):**
- Click "START QUIZ" → `/quiz`
- Click "LOG ACTIVITY" → `/log`
- Click "VIEW PATH" → `/path`

### 2. From Quiz Page (Full-Screen)

**Exit Quiz:**
- Click "← EXIT" button (top-left) → Returns to `/`

**After Completing Quiz:**
- Click "VIEW STATS" → `/analytics`
- Click "RETRY" → Restarts quiz

### 3. From Logger Page (Full-Screen)

**Exit Logger:**
- Click "← EXIT" button (top-right) → Returns to `/`

### 4. From Profile Page

**After Viewing Stats:**
- Use sidebar to navigate to other pages

---

## 🎨 PAGE PREVIEWS

### Dashboard (`/`) - Three Systems Collision
```
┌─────────────────────────────────────┐
│ [Sidebar]  │ WELCOME BACK,         │ ← RawBlock black hero
│ NAVIGATION │ ARIA VOSS             │
│            ├───────────────────────┤
│ DASHBOARD* │ TODAY'S XP: 0         │ ← StarChart purple stats
│ PROFILE    │ QUIZ ACCURACY: 77%    │
│ QUIZ       ├───────────────────────┤
│ LOG        │ ║ GAME STATS ║        │ ← Arcade dotted band
│ PATH       ├───────────────────────┤
│ ANALYTICS  │ [START QUIZ]          │ ← RawBlock WHITE section
│ LEADERBOARD│ [LOG ACTIVITY]        │
│ ADMIN      │ [VIEW PATH]           │
│            ├───────────────────────┤
│  LVL 2     │ RECENT SESSIONS       │ ← StarChart purple again
└─────────────────────────────────────┘
```

### Profile (`/profile`) - Pure StarChart
```
┌─────────────────────────────────────┐
│ [Sidebar]  │ ●  ARIA VOSS          │ ← Avatar + name
│            │                        │
│            │ ◐ INT  ◐ WIS  ◐ ENERGY│ ← 5 StatRings
│            │ ◐ XP   ◐ LEVEL        │
│            │                        │
│            │ RECENT SESSIONS        │
│            │ HISTORY    62 / 100   │
│            │ BIOLOGY    71 / 100   │
└─────────────────────────────────────┘
```

### Quiz (`/quiz`) - Full Arcade Screen
```
┌─────────────────────────────────────┐
│ ← EXIT                              │
│                                     │
│     ╔═══════════════════════╗      │
│     ║   SKILL FORGE         ║      │
│     ║   ASSESSMENT          ║      │
│     ║                       ║      │
│     ║   [PRESS START]       ║      │
│     ╚═══════════════════════╝      │
│                                     │
│         Pure black screen           │
│         Dotted borders              │
│         Press Start 2P font         │
└─────────────────────────────────────┘
```

### Logger (`/log`) - Full White Page
```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════════╗│ ← EXIT
│ ║ LOG ACTIVITY                      ║│
│ ╚═══════════════════════════════════╝│
│                                       │
│ 01  STUDY SESSION                    │
│     Subject: [_________]             │
│     Duration: [___] minutes          │
│     +18 INTELLIGENCE                 │
│     [LOG STUDY SESSION]              │
│─────────────────────────────────────│
│ 02  SLEEP                            │
│─────────────────────────────────────│
│ 03  TASKS COMPLETED                  │
│     ☐ Complete practice problem set  │
│     Pure white background            │
│     Brutal black borders             │
└─────────────────────────────────────┘
```

### Analytics (`/analytics`) - StarChart Charts
```
┌─────────────────────────────────────┐
│ [Sidebar]  │ ANALYTICS             │
│            │                        │
│            │ ╔═══════════════════╗ │
│            │ ║ Cognitive Profile ║ │
│            │ ║   Pentagon Chart  ║ │
│            │ ╚═══════════════════╝ │
│            │                        │
│            │ ╔═══════════════════╗ │
│            │ ║ Score Progression ║ │
│            │ ║   Yellow Line     ║ │
│            │ ╚═══════════════════╝ │
└─────────────────────────────────────┘
```

---

## 🧪 TESTING CHECKLIST

### Test Each Page (15 pages total)

**✅ Authentication (2 pages):**
- [ ] `/login` - Black page loads, form inputs work
- [ ] `/register` - Purple page loads, form inputs work

**✅ Main App with Sidebar (7 pages):**
- [ ] `/` - Dashboard with 5 sections (hero, stats, arcade, actions, sessions)
- [ ] `/profile` - 5 StatRings render with arcs
- [ ] `/analytics` - 3 charts render (radar, line, bar)
- [ ] `/test` - All component variants display
- [ ] `/path` - Placeholder shows "LEARNING PATH"
- [ ] `/leaderboard` - Placeholder shows "LEADERBOARD"
- [ ] `/admin` - Placeholder shows "ADMIN"

**✅ Full-Screen Pages (2 pages):**
- [ ] `/quiz` - Pure black arcade screen, "PRESS START" button
- [ ] `/log` - Pure white forms page, 3 sections

### Test Navigation

**From Dashboard:**
- [ ] Sidebar links navigate to all pages
- [ ] "START QUIZ" button → Quiz page
- [ ] "LOG ACTIVITY" button → Logger page
- [ ] "VIEW PATH" button → Learning Path page

**From Quiz:**
- [ ] "← EXIT" returns to Dashboard
- [ ] Complete quiz → "VIEW STATS" goes to Analytics
- [ ] "RETRY" restarts quiz

**From Logger:**
- [ ] "← EXIT" returns to Dashboard

**From Any Page with Sidebar:**
- [ ] All sidebar links work
- [ ] Active page highlighted in sidebar
- [ ] XP progress bar shows at bottom of sidebar

---

## 🔍 BROWSER DEVTOOLS VERIFICATION

### Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Verify: No red errors
4. Expected warnings only: npm deprecation (safe to ignore)

### Inspect Elements

**Dashboard Hero:**
```css
background-color: rgb(0, 0, 0) ✓ (should be black)
```

**Dashboard Actions:**
```css
background-color: rgb(255, 255, 255) ✓ (should be white)
```

**Quiz Background:**
```css
background-color: rgb(0, 0, 0) ✓ (should be black)
border: 3px dotted rgb(42, 63, 229) ✓ (should be dotted blue)
```

**Logger Background:**
```css
background-color: rgb(255, 255, 255) ✓ (should be white)
```

---

## 🎮 INTERACTIVE FEATURES TO TEST

### Dashboard
1. Hover over "START QUIZ" button → inverts (white bg, black text)
2. Click any sidebar link → navigates correctly
3. XP progress bar shows 48% (1240/2500)

### Profile
1. StatRings show animated arcs
2. Progress bar shows XP to next level
3. 5 recent sessions display with badges

### Quiz
1. Click "PRESS START" → goes to question phase
2. Timer counts down from 30
3. Timer turns red when < 10s
4. Click an answer → border turns solid white
5. See feedback with XP (e.g., "+050 XP")
6. Auto-advance after 2s
7. Complete 5 questions → "GAME OVER" screen

### Logger
1. Type "45" in duration → see "+18 INTELLIGENCE"
2. Try to submit "0" → red border + error message
3. Type valid number → submit → toast appears
4. Fields reset after submission
5. Check 3 tasks → see count "3 / 5"
6. Submit tasks → boxes uncheck

### Analytics
1. Radar chart renders purple pentagon
2. Line chart shows yellow line
3. Bar chart shows purple bars
4. All charts on dark StarChart backgrounds

---

## 🐛 TROUBLESHOOTING

### Issue: Pages not loading
**Solution:** Check if dev server is running
```bash
cd skill_forge_ui
npm run dev
```

### Issue: Sidebar not showing on some pages
**Expected:** Quiz (`/quiz`) and Logger (`/log`) are full-screen by design (no sidebar)

### Issue: Routes not working
**Solution:** Ensure you're using the full URL path:
- ✅ `http://localhost:5173/quiz`
- ❌ `localhost:5173/quiz` (missing http://)

### Issue: Styles not applying
**Solution:** Hard refresh the page:
- Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux)
- Chrome/Firefox: `Cmd+Shift+R` (Mac)

### Issue: Components not rendering
**Solution:** Check browser console for errors:
1. Press `F12` to open DevTools
2. Go to Console tab
3. Look for red error messages

---

## 📱 RECOMMENDED WORKFLOW

### For Development Testing:
1. Start at `/` (Dashboard)
2. Explore all sidebar pages
3. Click "START QUIZ" → Test quiz flow
4. Return to Dashboard
5. Click "LOG ACTIVITY" → Test logger forms
6. Return to Dashboard
7. Navigate to `/analytics` → View charts
8. Navigate to `/profile` → View StatRings
9. Navigate to `/test` → See all components

### For Design Review:
1. `/` - Dashboard (three-system collision)
2. `/profile` - Profile (pure StarChart)
3. `/quiz` - Quiz (pure Arcade)
4. `/log` - Logger (pure RawBlock)
5. `/analytics` - Analytics (StarChart charts)

---

## 🎯 KEYBOARD SHORTCUTS

**Browser:**
- `Ctrl/Cmd + R` - Refresh page
- `Ctrl/Cmd + Shift + R` - Hard refresh (clear cache)
- `F12` - Open DevTools
- `Ctrl/Cmd + L` - Focus address bar

**Navigation:**
- Use mouse/trackpad to click sidebar links
- Use browser back/forward buttons
- Use "← EXIT" buttons on Quiz/Logger pages

---

## 📊 PAGE COMPLETION STATUS

| Page | Status | Routes | Design System |
|------|--------|--------|---------------|
| Login | ✅ Phase 1 | `/login` | RawBlock |
| Register | ✅ Phase 1 | `/register` | StarChart |
| Dashboard | ✅ Phase 2 | `/` | All 3 Systems |
| Profile | ✅ Phase 2 | `/profile` | StarChart |
| Analytics | ✅ Phase 2 | `/analytics` | StarChart |
| Component Test | ✅ Phase 2 | `/test` | All 3 Systems |
| Quiz | ✅ Phase 3 | `/quiz` | Arcade |
| Logger | ✅ Phase 3 | `/log` | RawBlock |
| Learning Path | ⏳ Phase 4 | `/path` | StarChart |
| Leaderboard | ⏳ Phase 4 | `/leaderboard` | Arcade |
| Admin | ⏳ Phase 4 | `/admin` | RawBlock |

**Progress: 8/11 pages complete (73%)**

---

## 🚀 NEXT STEPS

1. **Test all routes** using the checklist above
2. **Verify interactive features** (timer, forms, navigation)
3. **Check design constraints** (colors, borders, fonts)
4. **Report any issues** you encounter

---

**Happy Testing! 🎮**

The app is fully integrated and all built pages are renderable.
Use the sidebar for main navigation and enjoy the three-system design collision.
