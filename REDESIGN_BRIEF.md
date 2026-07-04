# REDESIGN BRIEF — Ivan Gegov VFX Portfolio

## Baseline Settings
- DESIGN_VARIANCE: 9 (asymmetric, editorial, unexpected)
- MOTION_INTENSITY: 7 (cinematic reveals, scroll parallax, magnetic hover)
- VISUAL_DENSITY: 5 (balanced — breathing room but substantial content presence)

## Target Aesthetic
Ash Thorp / Gmunk / Jayse Hansen level. Dark, cinematic, typographically driven.
This is a **senior VFX artist's portfolio** — not a developer site, not a startup landing page.
Every pixel must communicate craft, precision, and visual intelligence.

## Color System

### Background Hierarchy
- `--background`: `220 13% 6%` — near-black, slightly cool (like a DCP projector in a dark theater)
- `--card`: `220 13% 9%` — surface offset for sections
- `--secondary`: `220 13% 12%` — interactive surfaces

### Typography Colors  
- `--foreground`: `0 0% 94%` — warm off-white, not clinical
- `--muted-foreground`: `220 8% 52%` — mid-gray for secondary text

### Accent
- `--primary`: `42 88% 56%` — Cinema Gold. One accent, used with restraint.
  - NOT neon amber. Warm, refined, like tungsten on celluloid.
  - Used: timeline dots, links, CTAs, hover states

### Banned
- Purple gradients (AI purple aesthetic)
- Pure white backgrounds anywhere
- More than one accent hue
- Inter font

## Typography

### Font Stack
- **Display**: `Syne` — 400/700/800. Geometric, edgy, used in film/design portfolios
- **Body**: `DM Sans` — 300/400/500. Clean humanist, excellent readability
- **Mono**: `Space Mono` — 400/700. Labels, metadata, section markers

### Scale
- Hero display: `8vw` clamped to `text-7xl..9xl` — IVAN GEGOV fills the left panel
- Section titles: `text-[11px]` uppercase tracking-widest — minimal categorical markers
- Body: `text-base` / `18px` with `leading-relaxed`
- Metadata: `Space Mono text-xs` in muted

### Anti-patterns avoided
- Centered H1 (LAYOUT_VARIANCE=9 bans centered hero)
- Generic card overuse (use border-t, negative space, no box shadows on everything)
- 3-column equal-weight card grids

## Layout

### Hero — Split Screen
- Left panel (55%): Vertically centered text block
  - Eyebrow: "ANIMATION · COMPOSITING · VFX" in Space Mono caps
  - H1: "IVAN GEGOV" — massive Syne ExtraBold, almost full panel width
  - Subtitle: from cvData.hero.subtitle
  - CTA buttons: View Work / Get in Touch
- Right panel (45%): Portrait photo, cinematic treatment
  - Photo with subtle vignette overlay
  - Ambient particle field (existing HeroParticles repurposed)
- Full-height `min-h-[100dvh]`
- On mobile: stacks vertically, photo moves above

### Navigation — Typographic Minimal
- Fixed top, full-width
- Left: "IVAN GEGOV" in Space Mono small
- Right: section links as text, no icons
- Transparent → glass blur on scroll
- Active state: gold underline, no pill/background

### Portfolio — Editorial Grid
- Section marker: `01 — WORK` in Space Mono
- Featured item (Showreel or first item): Full-width hero card, tall aspect
- Row 2: Two cards, 60/40 split
- Row 3: Remaining items 3-across with stagger
- Red Tiger collection: Horizontal scroll rail (kept, restyled dark)

### Skills — Clean Panels
- Left column: Tool tags in premium chip style
- Right column: Languages as elegant bars (not dot pips)
- Personal skills as a simple prose list, not bullets

### Experience — Dark Timeline
- Gold timeline line and dots (existing mechanic, restyled)
- Role name: `text-xl Syne font-bold`
- Date: Space Mono text-xs, right-aligned
- Company: gold accent text
- Horizontal rule separators instead of spacing-only

### Contact — Typographic Statement
- Large display: "Let's create something extraordinary."
- Email as large clickable text, not a small link
- Links: border-b hover effect (not rounded pills)

## Motion Language
Personality: **Premium** (350-600ms, cubic-bezier(0.4,0,0.2,1), 0% overshoot)

### Choreography
1. Hero: Name reveals character by character (stagger 30ms), then subtitle fades in
2. Portfolio cards: Staggered fade-up from below, 80ms between cards
3. Experience entries: Timeline line draws from top, dot pulses in
4. Skills: Tags cascade in from left with 40ms stagger
5. Scroll-based: `whileInView` with `amount: 0.15`, reveal easing `[0.16, 1, 0.3, 1]`

### Three Motion Layers
- Primary: Card/section reveals (transform + opacity)
- Secondary: Inner content fades in 100ms after parent lands
- Ambient: Particle field in hero, subtle noise texture on backgrounds

## What Is SACRED (unchanged)
- Ivan's photo/portrait
- All portfolio video URLs and thumbnails
- All factual text: credits, titles, descriptions, skills, dates, company names
- All trademark symbols and legal notations
- JSON Resume export functionality
- Supabase integration structure
- Editor mode (edit=true) functionality
- Reduced-motion support
- Mobile responsiveness

## Implementation Stack
- React 18 + Vite + TypeScript (unchanged)
- Tailwind v3 (unchanged, just new tokens)
- Framer Motion v12 (already installed, use more aggressively)
- shadcn/ui (kept, just restyled via CSS vars)
- Fonts: Google Fonts CDN via index.html preload
