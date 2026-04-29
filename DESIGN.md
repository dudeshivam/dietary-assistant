# Design Brief

## Direction

**Dietary Assistant** — Authentication pages (Register & Sign In) feature elevated form cards against dark gradient backgrounds. Form inputs use semi-transparent light backgrounds with strong borders and purple focus glow — inputs are always clearly visible, never blending into background. Blue/purple gradient border accent reinforces brand. Dashboard extends this clarity through gamified "Today's Journey" progression with state-based node styling, choreographed completion sequences, and vertical path UI. Unified professional modern aesthetic throughout.

## Tone

Professional, approachable, motivational. Auth pages convey security and clarity. Dashboard celebrates progress through visual feedback. Fitness-tech professional with engaging micro-interactions — confident without being aggressive.

## Differentiation

Unified OKLCH palette extended with gamification tokens (success, warning). Auth forms feature elevated semi-transparent card backgrounds with purple focus glow — inputs always clearly visible. Dashboard uses state-based node coloring, smooth choreographed sequences, gradient borders on active nodes. Vertical curved path UI unique to journey. Coordinated motion: node completion → scale bounce → color transition → XP pop-up → progress fill. Responsive mobile-first maintains clarity across all breakpoints.

## Color Palette

| Token      | OKLCH              | Role                                 |
| ---------- | ------------------ | ------------------------------------ |
| primary    | 0.55 0.22 280      | Button accents, active states        |
| accent     | 0.62 0.25 270      | Gradient overlays, highlights        |
| success    | 0.65 0.18 142      | Completed nodes, progress success   |
| warning    | 0.72 0.20 70       | Streak badge, achievement glow      |
| muted      | 0.22 0.015 260     | Locked nodes, inactive states        |
| card       | 0.19 0.015 260     | Node backgrounds, stat cards         |
| background | 0.14 0.015 260     | Dark page background                 |

## Typography

- **Display**: Space Grotesk — journey title "Today's Journey", node titles
- **Body**: DM Sans — node times, stat labels, descriptions
- **Scale**: Journey title `text-3xl md:text-4xl font-bold`, node title `text-sm md:text-base font-semibold`, stat label `text-xs uppercase tracking-wide`

## Elevation & Depth

Node circles use `shadow-node-active` (glow + inset) for active state. Stat badges and progress wrapper use `shadow-subtle` for depth. Gradient borders on node backgrounds create visual layering. No harsh shadows; all depth from layered OKLCH color.

## Structural Zones

| Zone      | Background               | Border              | Notes                                |
| --------- | ------------------------ | ------------------- | ------------------------------------ |
| Journey Header | bg-background        | —                   | "Today's Journey" title, subtitle    |
| Stats Bar | flex gap-4 stat-badges   | border-border       | Progress %, streak 🔥, XP display   |
| Progress Bar | bg-muted filled gradient | border-border       | Animated smooth fill 0.5s            |
| Path Canvas | flex flex-col items-center | —                  | Vertical curved connectors between nodes |
| Node (Locked) | bg-muted/40 opacity-60   | border-muted-fg/30  | Desaturated, dimmed for future tasks |
| Node (Active) | bg-primary/10 pulse-glow | border-primary      | Bright, pulsing 2s cycle            |
| Node (Completed) | bg-success/20        | border-success      | Green checkmark, confirms progress  |

## Spacing & Rhythm

Journey header `mb-8`, stats bar `mb-8`, progress wrapper `mb-8`. Path nodes spaced `gap-0` (connectors handle visual separation). Node circles `w-16 md:w-20` with `px-4 py-6 md:px-6 md:py-8`. Stat badges `gap-4 md:gap-6`. Mobile-first padding ensures breathing room on small screens.

## Component Patterns

- **Form Card**: `.form-card` — elevated card with semi-transparent bg, gradient border accent, backdrop blur, max-w-md, rounded-xl p-8 md:p-10
- **Form Container**: `.form-container` — min-h-screen flex center, dark gradient background (0.12 0.03 280 → 0.14 0.05 240)
- **Form Input**: `.form-input` — bg-card/50 with border-2, purple focus glow (focus:ring-accent), focus:ring-offset-card, inset shadow for depth
- **Form Group**: `.form-group` — mb-6 wrapper for label + input pair
- **Form Label**: `.form-label` — text-sm font-semibold uppercase, tracking-wider, mb-2
- **Form Link**: `.form-link` — text-accent with hover state, for "Already have an account?" navigation
- **Stat Badge**: `.stat-badge` — inline-flex, rounded-full, bg-card/border, text-sm font-semibold. Value uses `.stat-value` (text-lg font-bold text-primary)
- **Progress Bar**: `.progress-bar` + `.progress-fill` — h-3 md:h-4, gradient-primary fill, transition-all duration-500
- **Node Base**: `.node-base` + `.node-locked/active/completed` — flex flex-col items-center, state-specific styling (color, opacity, animations)
- **XP Popup**: `.xp-popup` — fixed positioning, `animate-xp-float` (1s ease-out, translateY -40px + fade)
- **Streak Badge**: `.streak-badge` — indicator with 🔥 emoji, .active modifier triggers `animate-streak-bounce` (0.5s)

## Motion

- **Node Completion**: `node-complete` 0.5s (scale 0.8→1.15→1, bounce easing) + color transition primary→success
- **XP Pop-up**: `xp-float` 1s ease-out, floats up from node center (-40px), fades out. Triggered per completion
- **Progress Fill**: `transition-all duration-500`, animated width change on task completion
- **Streak Bounce**: `streak-bounce` 0.5s on new day/milestone (scale 1→1.1→1)
- **Active Node Pulse**: `pulse-glow` 2s infinite (0.55 0.22 280 shadow cycling)
- **Entrance**: Nodes fade-in with `slide-up` 0.6s staggered per node

## Constraints

- No animations in dark mode if `prefers-reduced-motion` is set; fallback to instant state changes
- Node circles maintain minimum `w-16 h-16` (mobile `md:w-20 md:h-20`) for touch targets
- Path connectors scale with node spacing; responsive heights `h-12 md:h-16`
- XP pop-ups trigger from node center absolute position; parent must be `relative`

## Signature Detail

**Auth Forms**: Semi-transparent elevated card with gradient border accent rejects invisible inputs — purple focus glow on every field ensures clarity and confidence. Light inputs on dark gradient create immediate visual hierarchy and trust.

**Dashboard Journey**: Gamified progression path transforms diet tracking into rewarding level system. Active node glows with pulsing accent shadow (2s infinite cycle), creating visual "heartbeat" of current task. On completion: node scales to 1.15x (bounce), transitions to success green, XP floats up and fades, progress bar fills smoothly, streak badge bounces. Entire sequence 0.5–1.5s maintains engagement through micro-interactions. Mobile-first responsive scaling preserves gamification across all devices.
