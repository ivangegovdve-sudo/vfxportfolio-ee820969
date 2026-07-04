# REDESIGN COMPLETE — Ivan Gegov VFX Portfolio

Branch: `redesign-fable` (local only — never pushed). Design direction: [REDESIGN_BRIEF.md](REDESIGN_BRIEF.md).

## Design System

- **Palette** — near-black cool base (`220 13% 6%`), warm off-white type, single **Cinema Gold** accent (`42 88% 56%`) used with restraint: markers, timeline, bars, hovers. No purple, no second accent, no pure white.
- **Typography** — `Syne` (display, 700/800), `DM Sans` (body), `Space Mono` (labels, metadata, dates, nav). Editorial micro-labels at 10–11px with 0.14–0.24em tracking.
- **Motion** — unified token system in [src/lib/motion.ts](src/lib/motion.ts) (durations, easings, springs, reveal variants, shadow/glow tokens) mirrored as CSS custom properties in [src/index.css](src/index.css). Premium personality: 350–1000ms, `cubic-bezier(0.16,1,0.3,1)` reveals, zero overshoot, stagger budgets capped ≤ 420ms. Full `prefers-reduced-motion` fallbacks throughout.
- **Atmosphere** — fixed film-grain overlay, drifting gold ambient motes (CSS-only, parallax-aware), radial gold glows bookending hero and contact.

## Sections

- **Navigation** — typographic minimal: mono name left, uppercase mono links right, transparent → glass blur on scroll, gold underline active indicator (shared `layoutId` spring), avatar appears when past hero.
- **Hero** — split screen: eyebrow (`ANIMATION · COMPOSITING · VFX`), massive Syne name with word-by-word reveal, subtitle, CTAs, first bio paragraph under a hairline; portrait right with cinematic vignette, gold ring, breathing animation, particle field; scroll indicator.
- **Work (01)** — full-width 21:9 featured showreel card, asymmetric project grid, shine-sweep + glow hover choreography, play badge; Red Tiger collection as a horizontal poster rail with 3D perspective hover.
- **Skills (02)** — editorial two-column table: 220px Syne title rail, hairline rules between rows; gold-tinted mono chips (featured row enlarged), gold em-dash line items; personal skills as a prose line with gold separators; languages as animated gold gradient bars (replacing dot pips).
- **Experience (03)** — gold timeline that draws in on scroll with pulsing dots, Syne bold roles, Space Mono dates, gold company names, em-dash highlights, hairline separators between entries.
- **Education (04)** — editorial date-rail rows matching the skills grid; icon circles removed.
- **Contact (05)** — typographic statement ("Let's work together" at display scale with a gold period), email as a display-size link with arrow, mono location line, uppercase mono text links with border-b hover (pills removed), ambient gold glow.
- **Footer** — hairline rule, mono micro-type, two-column layout; all legal text preserved.
- **Shared** — `SectionMarker` component: mono index `01–05`, gold tick, small-caps title, used by every section.

## Sacred content — verified unchanged

45-point rendered-text check confirmed every fact intact: all portfolio titles/years/categories and video URLs, Ivan's photo, all skill strings, personal skills, languages and proficiencies, both education entries, all experience roles/companies/dates/highlights, email, location, YouTube/Vimeo links, JSON Resume export, trademark notices. Editor mode (`?edit=true`), Supabase integration, and reduced-motion support untouched.

## Verification

- `tsc --noEmit` clean; ESLint clean (pre-commit hook); vitest 3/3 pass.
- Live-verified in embedded preview at desktop and 375px mobile: zero horizontal overflow, correct clamps, single-column collapse, all sections render without console errors.
- Note: dev server ran on **port 8090** for verification (8080 was held by another project's server); `vite.config.ts` still defaults to 8080. The preview screenshot pipeline was non-functional in this environment (timeouts regardless of page state), so visual verification used accessibility snapshots + computed-style inspection (fonts, sizes, colors, layout boxes) instead of pixels.
