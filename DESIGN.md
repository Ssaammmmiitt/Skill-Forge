# SYSTEM//FUSION Design Language

> A collision of three design systems: **RawBlock** brutalism, **StarChart** cosmic wonder, and **Pac-Man** arcade nostalgia. Use them in tension, not harmony.

---

## Fonts

| Role | RawBlock | StarChart | Arcade |
|------|----------|-----------|--------|
| Headline | Archivo Black | Fredoka | Press Start 2P |
| Body | Work Sans | DM Sans | Work Sans / DM Sans |
| Mono | Space Mono | Space Mono | Space Mono |

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Archivo+Black&family=Work+Sans:wght@400;600&family=Fredoka:wght@400;600&family=DM+Sans:wght@400;600&family=Space+Mono&display=swap');
```

### Scale

| Token | RawBlock | StarChart | Arcade |
|-------|----------|-----------|--------|
| h1 | Archivo Black 64px / 1.0lh | Fredoka 36px bold / 1.2lh | Press Start 2P 22px |
| h2 | Archivo Black 48px / 1.05lh | Fredoka 28px bold / 1.25lh | Press Start 2P 16px |
| h3 | Archivo Black 32px / 1.1lh | Fredoka 22px semibold / 1.3lh | Press Start 2P 12px |
| body | Work Sans 16px / 1.6lh | DM Sans 16px / 1.5lh | Space Mono 13px |
| small | Work Sans 14px / 1.5lh | DM Sans 14px / 1.5lh | Space Mono 11px |
| mono | Space Mono 15px / 1.5lh | Space Mono 14px / 1.6lh | Space Mono 10px |

---

## Colors

### RawBlock Palette

```
Black       #000000   Text, borders, fills
White       #FFFFFF   Background, inverse text
Blue        #0000FF   Links only - reserved
Success     #008000
Warning     #FFA500
Error       #FF0000
```

### StarChart Palette

```
Deep Space  #1E1B4B   Primary background, headers
Nebula      #A78BFA   Interactive elements, accents
Star        #FDE047   Achievements, highlights, CTA
Surface     #2E2A6E   Card backgrounds
Sunken      #141136   Input backgrounds
Success     #4ADE80
Warning     #FBBF24
Error       #F87171
Info        #60A5FA
```

### Arcade Palette

```
Primary     #2A3FE5   Electric blue - actions, links, active states
Secondary   #F4B9B0   Soft peach - supporting accents
Surface     #000000   The arcade screen
Success     #16A34A
Warning     #D97706
Danger      #DC2626
```

---

## Spacing

Base unit: **8px** across all three systems.

| Token | px |
|-------|----|
| sp-1 | 4 |
| sp-2 | 8 |
| sp-3 | 16 |
| sp-4 | 24 |
| sp-5 | 32–40 |
| sp-6 | 48–64 |
| sp-7 | 64–80 |
| sp-8 | 96–120 |

> RawBlock uses spacing **irregularly by design** to create visual tension. StarChart and Arcade follow the scale strictly.

---

## Border Radius

| System | Rule |
|--------|------|
| RawBlock | `0px` everywhere - no exceptions |
| StarChart | sm `8px` · md `12px` · lg `16px` · pill `9999px` · circle `50%` |
| Arcade | `0px` default; dotted borders as signature detail |

---

## Borders & Elevation

### RawBlock
- No shadows. Ever.
- `border-thin` 1px · `border-thick` 3px · `border-heavy` 5px
- Border weight = visual hierarchy

### StarChart
- No hard borders - use glow instead
- `glow-nebula-sm` 8px #A78BFA @ 30%
- `glow-nebula-md` 16px #A78BFA @ 40%
- `glow-star-sm` 8px #FDE047 @ 35%
- `glow-star-md` 16px #FDE047 @ 50%

### Arcade
- `3px dotted #2A3FE5` - the signature border style
- No shadows. Dark canvas + bright accents = depth.

---

## Buttons

### RawBlock Primary
```css
background: #000;
color: #fff;
border: 3px solid #000;
font-family: 'Archivo Black', sans-serif;
text-transform: uppercase;
letter-spacing: 2px;
/* hover: invert - background #fff, color #000 */
```

### StarChart Primary (Star CTA)
```css
background: #FDE047;
color: #1E1B4B;
border: none;
border-radius: 9999px;
font-family: 'Fredoka', sans-serif;
font-weight: 600;
/* hover: brightens + glow-star-sm */
```

### StarChart Secondary (Nebula)
```css
background: transparent;
color: #A78BFA;
border: 2px solid #A78BFA;
border-radius: 9999px;
/* hover: #A78BFA at 15% bg + glow-nebula-sm */
```

### Arcade
```css
background: #000;
color: #2A3FE5;
border: 3px dotted #2A3FE5;
font-family: 'Press Start 2P', monospace;
font-size: 9px;
letter-spacing: 1px;
/* hover: background #2A3FE5, color #000 */
```

### Sizes (shared)
| Size | Padding | Font | Min-height |
|------|---------|------|------------|
| Small | 6px 16px | 12px | 32px |
| Medium | 10px 24px | 14px | 44px |
| Large | 16px 40px | 18px | 56px |

---

## Cards

### RawBlock Default
```css
background: #fff;
border: 3px solid #000;
border-radius: 0;
padding: 24px;
/* no shadow */
```

### StarChart Default
```css
background: #2E2A6E;
border: 1px solid /* default border color */;
border-radius: 16px;
padding: 24px;
```

### StarChart Achievement
```css
background: #2E2A6E;
border: 1px solid #FDE047;
border-radius: 16px;
padding: 24px;
box-shadow: 0 0 16px rgba(253,224,71,0.5); /* glow-star-md */
```

### Arcade
```css
background: #000;
border: 3px dotted #2A3FE5;
border-radius: 0;
padding: 16px;
```

---

## Inputs

### RawBlock
```css
background: #F0F0F0;
border: 3px solid #000;
border-radius: 0;
font-family: 'Space Mono', monospace;
font-size: 15px;
padding: 10px 12px;
/* focus: border-width 5px */
```

Label: `Archivo Black 11px uppercase letter-spacing 1px`  
Helper: `Work Sans 12px, margin-top 4px`

### StarChart
```css
background: #141136;
border: 2px solid #3D3890;
border-radius: 12px;
font-family: 'DM Sans', sans-serif;
font-size: 16px;
padding: 10px 16px;
color: #E2DFFF;
/* focus: border #A78BFA + glow-nebula-sm */
/* error: border #F87171 + 8px red glow 30% */
```

Label: `DM Sans 14px semibold, color #A78BFA, margin-bottom 6px`

### Arcade
```css
background: #000;
border: 3px dotted #2A3FE5;
border-radius: 0;
font-family: 'Press Start 2P', monospace;
font-size: 10px;
padding: 10px 12px;
color: #F4B9B0;
/* focus: border-color #FDE047 */
```

---

## Chips & Status Badges

### RawBlock Filter Chip
```css
background: #fff;
border: 2px solid #000;
border-radius: 0;
font-family: 'Archivo Black', sans-serif;
font-size: 10px;
text-transform: uppercase;
letter-spacing: 1px;
padding: 4px 12px;
/* active: background #000, color #fff */
```

### StarChart Status Chips (pill-shaped)
| State | Background | Text |
|-------|-----------|------|
| Completed | #4ADE80 @ 20% | #4ADE80 |
| Pending | #FBBF24 @ 20% | #FBBF24 |
| Missed | #F87171 @ 20% | #F87171 |
| Locked | #8B82C3 @ 20% | #8B82C3 |

### Arcade Chip
```css
background: #000;
border: 2px dotted #FDE047;
color: #FDE047;
font-family: 'Press Start 2P', monospace;
font-size: 8px;
padding: 4px 10px;
letter-spacing: 1px;
```

---

## Checkboxes

### RawBlock
- 20×20px · `border: 3px solid #000` · `border-radius: 0`
- Unchecked: white bg · Checked: black bg + white `✓` (3px stroke)
- Focus: `border-width: 5px`

### StarChart
- 22×22px · `border: 2px solid #3D3890` · `border-radius: 6px`
- Unchecked: transparent · Checked: `background #A78BFA` + white `✓`
- Focus: glow-nebula-sm · Disabled: opacity 0.4

### Arcade
- 20×20px · `border: 2px dotted #2A3FE5` · `border-radius: 0`
- Checked: border-color shifts to `#FDE047`, inner `X` in Press Start 2P

---

## Lists

### RawBlock
```
font-family: Work Sans 16px
border-bottom: 3px solid #000
padding: 12px 0
hover: text-decoration underline
active: background #000, color #fff, full-width
```

### StarChart
```
border-bottom: 1px dotted #3D3890
padding: 12px 16px
hover: background #A78BFA @ 8%
active: background #A78BFA @ 15%
trailing: badges, star counts, chevrons
```

---

## Tooltips

### RawBlock / Arcade
```css
background: #000;
color: #fff;
font-family: 'Space Mono', monospace;
font-size: 11px;
border: 3px dotted #2A3FE5;
padding: 8px 12px;
border-radius: 0;
max-width: 260px;
```

### StarChart
```css
background: #3D3890;
color: #E2DFFF;
font-family: 'DM Sans', sans-serif;
font-size: 13px;
border-radius: 8px;
padding: 6px 12px;
border: 1px solid #A78BFA;
max-width: 240px;
/* shows after 300ms, hides after 100ms */
```

---

## Progress Bars

### RawBlock
```css
background: #1a1a1a;
border: 3px solid #fff;
height: 12px;
border-radius: 0;
fill: #fff; /* inner bar */
```

### StarChart
```css
background: #1E1B4B;
border: 2px solid #A78BFA;
border-radius: 9999px;
height: 12px;
fill: linear-gradient(90deg, #A78BFA, #FDE047);
```

---

## Scoreboard / Metrics

```css
/* Arcade Scoreboard */
background: #000;
border: 3px dotted #FDE047;
font-family: 'Press Start 2P', monospace;
label: 8px #F4B9B0 letter-spacing 2px;
value: 22px #FDE047 letter-spacing 4px;

/* StarChart Metric */
background: #0A0919;
border: 2px solid #A78BFA;
border-radius: 12px;
label: Fredoka 12px #A78BFA;
value: Fredoka 26px bold #FDE047;

/* RawBlock Metric */
background: #000;
border: 3px solid #fff;
label: Archivo Black 10px uppercase #fff letter-spacing 2px;
value: Archivo Black 28px #fff;
```

---

## Do's and Don'ts

### Do
- Use thick borders (3–5px) as the primary RawBlock organizer
- Use `9999px` radius for all StarChart pills and star badges
- Use `3px dotted` borders in `#2A3FE5` as the Arcade signature
- Apply `UPPERCASE + letter-spacing` on all RawBlock labels and buttons
- Use `Press Start 2P` at 8–12px minimum - never smaller
- Keep StarChart text large (minimum 14px) - designed for kids
- Use star-yellow `#FDE047` **only** for achievements and primary CTAs
- Use nebula-purple `#A78BFA` glow to guide attention to interactive elements
- Reserve `#0000FF` (RawBlock) exclusively for hyperlinks

### Don't
- Round any corners in RawBlock - ever
- Use shadows in RawBlock or Arcade - none, zero
- Use `#0000FF` blue for anything other than links in RawBlock
- Combine star-glow and nebula-glow on the same StarChart element
- Use pure white backgrounds in StarChart - always maintain the deep space theme
- Mix the arcade aesthetic with glassmorphism, gradients, or soft UI
- Use `Press Start 2P` below 8px - bitmap fonts need minimum size to remain legible
- Polish or refine RawBlock - if it looks too designed, strip it back further

---

## CSS Custom Properties (Quick Start)

```css
:root {
  /* RawBlock */
  --raw-black: #000000;
  --raw-white: #FFFFFF;
  --raw-link: #0000FF;
  --raw-border-thin: 1px solid #000;
  --raw-border-thick: 3px solid #000;
  --raw-border-heavy: 5px solid #000;

  /* StarChart */
  --space-deep: #1E1B4B;
  --space-surface: #2E2A6E;
  --space-sunken: #141136;
  --space-overlay: #3D3890;
  --space-nebula: #A78BFA;
  --space-star: #FDE047;
  --space-success: #4ADE80;
  --space-warning: #FBBF24;
  --space-error: #F87171;
  --space-glow-nebula: 0 0 16px rgba(167,139,250,0.4);
  --space-glow-star: 0 0 16px rgba(253,224,71,0.5);

  /* Arcade */
  --arcade-primary: #2A3FE5;
  --arcade-secondary: #F4B9B0;
  --arcade-surface: #000000;
  --arcade-border: 3px dotted #2A3FE5;
  --arcade-border-star: 3px dotted #FDE047;
  --arcade-border-nebula: 3px dotted #A78BFA;

  /* Shared */
  --font-headline-raw: 'Archivo Black', sans-serif;
  --font-headline-space: 'Fredoka', sans-serif;
  --font-headline-arcade: 'Press Start 2P', monospace;
  --font-body-raw: 'Work Sans', sans-serif;
  --font-body-space: 'DM Sans', sans-serif;
  --font-mono: 'Space Mono', monospace;
}
```

---

*SYSTEM//FUSION - RawBlock · StarChart · Pac-Man - Combined Build v1.0*