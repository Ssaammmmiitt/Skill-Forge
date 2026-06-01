---

version: alpha
name: Cosmic-Brutalist-Arcade
description: A high-contrast fusion of brutalist structure, deep-space atmosphere, and retro arcade nostalgia. The system combines massive Archivo Black headlines, deep cosmic surfaces, neon-like nebula borders, star-gold calls-to-action, and pixel-inspired labels. RawBlock provides the structural honesty, StarChart contributes the immersive cosmic palette, and Pac-Man injects playful arcade energy through dotted dividers, achievement-driven interfaces, and retro typography. The result feels like an arcade cabinet drifting through deep space—bold, memorable, technical, and premium.

colors:
primary: "#FDE047"
secondary: "#A78BFA"
electric-blue: "#2A3FE5"

canvas: "#0B0B18"
surface-base: "#141136"
surface-raised: "#1E1B4B"
surface-card: "#2E2A6E"
surface-overlay: "#3D3890"

ink: "#FFFFFF"
body: "#E5E7EB"
body-soft: "#B8BDD8"
muted: "#8B82C3"
muted-soft: "#64608F"

border: "#A78BFA"
border-strong: "#FFFFFF"
divider: "#2A3FE5"

success: "#4ADE80"
warning: "#FBBF24"
error: "#F87171"
info: "#60A5FA"

on-primary: "#0B0B18"
on-dark: "#FFFFFF"

typography:
display-xl:
fontFamily: "Archivo Black, sans-serif"
fontSize: 72px
fontWeight: 400
lineHeight: 0.95
letterSpacing: -0.04em

display-lg:
fontFamily: "Archivo Black, sans-serif"
fontSize: 48px
fontWeight: 400
lineHeight: 1.0
letterSpacing: -0.02em

display-md:
fontFamily: "Archivo Black, sans-serif"
fontSize: 32px
fontWeight: 400
lineHeight: 1.1

display-sm:
fontFamily: "Archivo Black, sans-serif"
fontSize: 24px
fontWeight: 400
lineHeight: 1.2

title-md:
fontFamily: "DM Sans, sans-serif"
fontSize: 22px
fontWeight: 600
lineHeight: 1.3

title-sm:
fontFamily: "DM Sans, sans-serif"
fontSize: 18px
fontWeight: 600
lineHeight: 1.35

body-md:
fontFamily: "DM Sans, sans-serif"
fontSize: 16px
fontWeight: 400
lineHeight: 1.7

body-sm:
fontFamily: "DM Sans, sans-serif"
fontSize: 14px
fontWeight: 400
lineHeight: 1.6

mono:
fontFamily: "Space Mono, monospace"
fontSize: 15px
fontWeight: 400
lineHeight: 1.6

arcade-label:
fontFamily: "Press Start 2P, monospace"
fontSize: 12px
fontWeight: 400
lineHeight: 1.8
letterSpacing: 1px

button:
fontFamily: "Press Start 2P, monospace"
fontSize: 12px
fontWeight: 400
lineHeight: 1
letterSpacing: 1px

nav-link:
fontFamily: "Press Start 2P, monospace"
fontSize: 11px
fontWeight: 400
lineHeight: 1.6
letterSpacing: 1px

rounded:
none: 0px
sm: 8px
md: 12px
lg: 16px
pill: 9999px
full: 9999px

spacing:
xxs: 4px
xs: 8px
sm: 16px
md: 24px
lg: 32px
xl: 48px
xxl: 64px
xxxl: 96px
section: 128px

effects:
nebula-glow: "0 0 16px rgba(167,139,250,.45)"
star-glow: "0 0 24px rgba(253,224,71,.55)"
arcade-glow: "0 0 20px rgba(42,63,229,.45)"

components:
button-primary:
backgroundColor: "{colors.primary}"
textColor: "{colors.on-primary}"
typography: "{typography.button}"
rounded: "{rounded.pill}"
padding: 14px 32px
height: 48px

button-secondary:
backgroundColor: transparent
textColor: "{colors.secondary}"
typography: "{typography.button}"
rounded: "{rounded.pill}"
borderColor: "{colors.secondary}"
padding: 14px 32px
height: 48px

button-arcade:
backgroundColor: "{colors.canvas}"
textColor: "{colors.on-dark}"
typography: "{typography.button}"
rounded: "{rounded.none}"
borderStyle: dotted
borderColor: "{colors.electric-blue}"
padding: 14px 32px

top-nav:
backgroundColor: transparent
textColor: "{colors.on-dark}"
typography: "{typography.nav-link}"
height: 64px

hero-banner:
backgroundColor: "{colors.canvas}"
textColor: "{colors.on-dark}"
typography: "{typography.display-xl}"
padding: 96px

achievement-card:
backgroundColor: "{colors.surface-raised}"
textColor: "{colors.on-dark}"
typography: "{typography.body-md}"
rounded: "{rounded.lg}"
borderColor: "{colors.primary}"
padding: 24px

brutalist-card:
backgroundColor: "#000000"
textColor: "{colors.on-dark}"
typography: "{typography.body-md}"
rounded: "{rounded.none}"
borderWidth: 5px
borderColor: "{colors.border-strong}"
padding: 24px

dashboard-panel:
backgroundColor: "{colors.surface-base}"
textColor: "{colors.on-dark}"
typography: "{typography.body-md}"
rounded: "{rounded.md}"
borderColor: "{colors.border}"
padding: 24px

text-input:
backgroundColor: "{colors.surface-base}"
textColor: "{colors.on-dark}"
typography: "{typography.body-md}"
rounded: "{rounded.sm}"
borderColor: "{colors.border}"
padding: 12px 16px
height: 48px

status-chip:
backgroundColor: transparent
textColor: "{colors.success}"
typography: "{typography.arcade-label}"
rounded: "{rounded.pill}"
padding: 4px 12px

tooltip:
backgroundColor: "{colors.surface-overlay}"
textColor: "{colors.on-dark}"
typography: "{typography.mono}"
rounded: "{rounded.sm}"
padding: 8px 12px

footer:
backgroundColor: "{colors.canvas}"
textColor: "{colors.muted}"
typography: "{typography.body-sm}"
padding: 64px
-------------

# Overview

Cosmic Brutalist Arcade is a hybrid design language that combines the raw honesty of brutalism, the wonder of deep-space exploration, and the playful structure of classic arcade interfaces.

Unlike traditional SaaS design systems that rely on subtle shadows, glass effects, and muted colors, this system creates hierarchy through:

* Massive typography
* Thick borders
* Strategic glows
* Dotted arcade dividers
* Strong geometric spacing
* High-contrast dark surfaces

The aesthetic should feel like a premium arcade terminal installed aboard a futuristic spacecraft.

The visual hierarchy follows a strict rule:

1. Typography first.
2. Borders second.
3. Color third.
4. Motion last.

Nothing competes with the headline.

Key characteristics:

* Deep-space dark surfaces dominate every screen.
* Archivo Black creates immediate visual authority.
* Press Start 2P appears only in labels, badges, navigation, and controls.
* DM Sans provides readability and modern usability.
* Space Mono is reserved for technical data and AI outputs.
* Dotted arcade dividers replace decorative graphics.
* Purple nebula accents guide interaction.
* Star-gold is reserved for rewards and primary actions.
* Borders are preferred over shadows.
* Glows exist only to emphasize focus and achievement.

The system should feel engineered, playful, and futuristic at the same time.
