# THEME SYSTEM — Dark & Light Mode

## Overview

Skill Forge UI now supports **Dark Mode** (default) and **Light Mode** across all pages and components, while maintaining the integrity of the Fusion Design System (RawBlock, StarChart, Arcade).

## Features

✅ **Sidebar Theme Toggle** — Located at the bottom of the sidebar  
✅ **Persistent Preference** — Theme choice saved to `localStorage` as `sf_theme`  
✅ **Smooth Transitions** — All color changes use CSS transitions  
✅ **Design System Integrity** — Each system (RawBlock, StarChart, Arcade) has custom light mode colors  
✅ **Chart Support** — All Recharts components adapt to theme changes  
✅ **Fixed Sidebar Hover** — Resolved black hover issue with proper theme-aware colors

---

## How It Works

### 1. Theme Store (`src/store/useThemeStore.js`)

Zustand store that manages theme state:

```javascript
const { theme, setTheme, toggleTheme } = useThemeStore()
```

- **`theme`**: Current theme ('dark' or 'light')
- **`setTheme(newTheme)`**: Set theme directly
- **`toggleTheme()`**: Switch between dark and light

### 2. CSS Variables (`src/index.css`)

All theme colors are defined as CSS variables under `:root[data-theme="dark"]` and `:root[data-theme="light"]`:

```css
:root[data-theme="dark"] {
  --raw-bg: #000000;
  --space-bg: #1E1B4B;
  --arcade-bg: #000000;
  /* ... */
}

:root[data-theme="light"] {
  --raw-bg: #FFFFFF;
  --space-bg: #F0EDFF;
  --arcade-bg: #FFFACD;
  /* ... */
}
```

### 3. Tailwind Config (`tailwind.config.js`)

All Tailwind color utilities map to CSS variables:

```javascript
colors: {
  'raw-black': 'var(--raw-bg)',
  'raw-white': 'var(--raw-text)',
  'space-deep': 'var(--space-bg)',
  // ...
}
```

This means existing code like `bg-raw-black` and `text-space-nebula` automatically adapts to the theme.

### 4. Theme Color Utility (`src/utils/themeColors.js`)

For components that can't use CSS variables directly (like Recharts), we provide a utility function:

```javascript
import { getThemeColors } from '../../utils/themeColors'

const colors = getThemeColors()
// colors.spaceNebula, colors.spaceStar, etc.
```

---

## Color Palette

### RawBlock System

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#000000` (Black) | `#FFFFFF` (White) |
| Surface | `#0a0a0a` (Very Dark Gray) | `#F5F5F5` (Very Light Gray) |
| Text | `#FFFFFF` (White) | `#000000` (Black) |
| Border | `#FFFFFF` (White) | `#000000` (Black) |
| Hover | `#111111` | `#E8E8E8` |

### StarChart System

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#1E1B4B` (Deep Purple) | `#F0EDFF` (Light Lavender) |
| Surface | `#2E2A6E` (Purple) | `#FFFFFF` (White) |
| Overlay | `#3D3890` (Darker Purple) | `#D4C5FF` (Light Purple) |
| Nebula | `#A78BFA` (Bright Purple) | `#7C3AED` (Deep Purple) |
| Star | `#FDE047` (Yellow) | `#CA8A04` (Dark Gold) |
| Text | `#E2DFFF` (Light Purple) | `#1E1B4B` (Deep Purple) |

### Arcade System

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#000000` (Black) | `#FFFACD` (Lemon Chiffon) |
| Surface | `#0a0a0a` (Very Dark Gray) | `#FFF9E6` (Light Yellow) |
| Primary | `#FDE047` (Yellow) | `#D97706` (Amber) |
| Secondary | `#999999` (Gray) | `#666666` (Dark Gray) |
| Hover | `#1a1a1a` | `#FFF4CC` |

---

## Components Updated

### UI Components

- ✅ **Sidebar** — Theme toggle button, fixed hover states
- ✅ **Topbar** — Theme-aware borders
- ✅ **ThemeToggle** — New component for switching themes
- ✅ **ButtonRaw** — Improved hover states
- ✅ **CardRaw** — Theme-aware backgrounds and borders
- ✅ **CardStar** — Already theme-compatible
- ✅ **CardArcade** — Already theme-compatible
- ✅ **StatRing** — Theme-aware ring colors for all systems

### Chart Components

- ✅ **LineChart** — Theme-aware grid, axes, tooltips, and lines
- ✅ **BarChart** — Theme-aware grid, axes, tooltips, and bars
- ✅ **RadarChart** — Theme-aware grid, axes, and radar fills

### Pages

- ✅ **Login** — Theme-aware input backgrounds
- ✅ **Dashboard** — Theme-aware borders and backgrounds
- ✅ **Profile** — Theme-aware dividers
- ✅ **Quiz** — Theme-aware hover and selection states
- ✅ **Logger** — Theme-aware input fields and section numbers
- ✅ **Analytics** — Theme-aware dividers and chart colors
- ✅ **Leaderboard** — Theme-aware user highlights
- ✅ **Admin** — Already theme-compatible

---

## Usage Guide

### For Developers

#### Using Theme in Components

**Option 1: Use Tailwind classes (recommended)**

```jsx
<div className="bg-raw-black text-raw-white">
  {/* Automatically theme-aware */}
</div>
```

**Option 2: Use theme colors utility (for non-CSS contexts)**

```jsx
import { getThemeColors } from '../../utils/themeColors'

const MyComponent = () => {
  const colors = getThemeColors()
  
  return (
    <svg stroke={colors.spaceNebula}>
      {/* ... */}
    </svg>
  )
}
```

**Option 3: Access theme state directly**

```jsx
import { useThemeStore } from '../../store/useThemeStore'

const MyComponent = () => {
  const theme = useThemeStore(state => state.theme)
  
  return (
    <div>
      Current theme: {theme}
    </div>
  )
}
```

#### Adding New Theme-Aware Colors

1. **Add CSS variable** to `src/index.css`:
   ```css
   :root[data-theme="dark"] {
     --my-new-color: #123456;
   }
   :root[data-theme="light"] {
     --my-new-color: #ABCDEF;
   }
   ```

2. **Add to Tailwind config** in `tailwind.config.js`:
   ```javascript
   colors: {
     'my-new-color': 'var(--my-new-color)',
   }
   ```

3. **Use in components**:
   ```jsx
   <div className="bg-my-new-color">
     {/* ... */}
   </div>
   ```

#### Creating Theme-Aware Inline Styles

Avoid hardcoded hex colors in inline styles. Instead, use:

```jsx
// ❌ BAD
<div style={{ background: '#1E1B4B' }}>

// ✅ GOOD
<div className="bg-space-deep">

// ✅ ALSO GOOD (if inline style is necessary)
const colors = getThemeColors()
<div style={{ background: colors.spaceBg }}>
```

---

## Design Decisions

### Why CSS Variables?

- **Dynamic:** Changes instantly without component re-renders
- **Performant:** Browser-native, no JavaScript overhead
- **Simple:** One source of truth for all components
- **Compatible:** Works with Tailwind utilities seamlessly

### Light Mode Color Strategy

1. **RawBlock**: Complete inversion (black ↔ white) maintains brutalist aesthetic
2. **StarChart**: Lighter purples with inverted text maintains cosmic feel with better readability
3. **Arcade**: Warm yellow tones preserve retro game aesthetic while improving contrast

### What Stays the Same?

- ✅ All typography (fonts, sizes, tracking)
- ✅ All spacing (padding, margins, gaps)
- ✅ All border styles (widths, dotted/solid patterns)
- ✅ All component layouts
- ✅ All animations and transitions
- ✅ Design system separation (no cross-contamination)

---

## Testing Checklist

### Visual Verification

- [ ] Sidebar hover states work correctly (no black text on black bg)
- [ ] Theme toggle button shows correct state (DARK/LIGHT label)
- [ ] All text is readable in both modes
- [ ] No hardcoded colors remain (check for `#` in components)
- [ ] Charts update correctly when theme changes
- [ ] Buttons have visible hover states in both modes
- [ ] Input fields are visible and usable in both modes

### Functional Verification

- [ ] Theme persists after page refresh
- [ ] Theme applies across all pages (Dashboard, Profile, Quiz, etc.)
- [ ] Theme toggle button is accessible from all pages with layout
- [ ] Full-screen pages (Quiz, Logger) respect theme choice
- [ ] No console errors when switching themes
- [ ] Theme transitions are smooth (not jarring)

### Accessibility

- [ ] Sufficient contrast ratios in both modes (WCAG AA minimum)
- [ ] Theme toggle is keyboard accessible
- [ ] Theme toggle has proper aria-label
- [ ] Theme preference is respected on initial load

---

## Troubleshooting

### Theme doesn't change when toggled

**Solution:** Check that `data-theme` attribute is set on `<html>` element.  
Run in console: `document.documentElement.getAttribute('data-theme')`

### Some colors still hardcoded

**Solution:** Search for hex colors in the component and replace with CSS variable or theme utility:
```bash
# Find remaining hex colors
rg '#[0-9A-Fa-f]{6}' src/
```

### Charts don't update with theme

**Solution:** Ensure the chart component imports and uses `getThemeColors()`:
```jsx
import { getThemeColors } from '../../utils/themeColors'
const colors = getThemeColors()
```

### Theme doesn't persist

**Solution:** Check localStorage:
```javascript
localStorage.getItem('sf_theme') // Should return 'dark' or 'light'
```

---

## Future Enhancements

Potential improvements for the theme system:

- [ ] Add "System" option to follow OS theme preference
- [ ] Add theme transition animations (optional fade)
- [ ] Add more theme variants (e.g., high contrast mode)
- [ ] Add theme-specific illustrations/icons
- [ ] Add per-system theme overrides (e.g., dark RawBlock + light StarChart)

---

## Files Modified

### New Files
- `src/store/useThemeStore.js` — Theme state management
- `src/components/ui/ThemeToggle.jsx` — Theme toggle button
- `src/utils/themeColors.js` — Theme color utility

### Modified Files
- `src/index.css` — CSS variables for both themes
- `tailwind.config.js` — Map Tailwind colors to CSS variables
- `src/components/layout/Sidebar.jsx` — Added theme toggle, fixed hover
- `src/components/layout/Topbar.jsx` — Theme-aware borders
- `src/components/ui/ButtonRaw.jsx` — Improved hover states
- `src/components/ui/CardRaw.jsx` — Theme-aware backgrounds
- `src/components/ui/StatRing.jsx` — Theme-aware ring colors
- `src/components/charts/LineChart.jsx` — Theme-aware chart colors
- `src/components/charts/BarChart.jsx` — Theme-aware chart colors
- `src/components/charts/RadarChart.jsx` — Theme-aware chart colors
- `src/pages/Login.jsx` — Theme-aware input fields
- `src/pages/Dashboard.jsx` — Theme-aware borders
- `src/pages/Profile.jsx` — Theme-aware dividers
- `src/pages/Quiz.jsx` — Theme-aware hover states
- `src/pages/Logger.jsx` — Theme-aware inputs and text
- `src/pages/Analytics.jsx` — Theme-aware dividers
- `src/pages/Leaderboard.jsx` — Theme-aware highlights

---

**Theme System Complete ✅**

All components and pages now support both dark and light modes while maintaining the distinct identity of each design system (RawBlock, StarChart, Arcade).
