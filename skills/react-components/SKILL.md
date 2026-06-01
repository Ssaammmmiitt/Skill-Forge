# React components skill

## What this skill is for
Use this when building any React component in src/components/ or src/pages/.

## Environment facts
- Stack: React 18, Vite, TailwindCSS
- State: Zustand stores in src/store/
- Charts: Recharts
- No CSS files — Tailwind classes only
- Component files: PascalCase.jsx

## Step-by-step instructions
1. Check if a similar component exists in src/components/ui/ before creating a new one
2. Write the component as a named export (not default) unless it is a page
3. Accept all dynamic values as props — no hardcoded strings inside components
4. Use Tailwind classes for all styling
5. Add a loading prop that shows a Spinner when true
6. Export the component and import it in the parent page

## Rules
- Never use inline style={{}} — Tailwind only
- All text must use text-primary / text-secondary color tokens (no hardcoded hex)
- All numbers displayed to the user must be Math.round()'d
- Stat cards: gray background, muted label on top, large number below
- Charts: always include a title and axis labels
- Forms: no <form> tag — use button onClick handlers only

## Verification checklist
- [ ] npm run dev shows no console errors for this component
- [ ] Component renders with mock data from src/utils/mockData.js
- [ ] Loading state shows Spinner correctly
- [ ] No hardcoded text strings inside the component