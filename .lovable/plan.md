# 3D / Shader Layer + Portfolio "Version Two" — Portfolio VFX Upgrade

Two coordinated efforts. Part A refines the existing site into a VFX-artist showcase using three.js. Part B introduces a parallel scroll-driven video experience at `/v2` (link exposed inside the site).

---

## PART A — Site-Wide 3D Layer (refined)

### Strategy

Rather than sprinkle three.js everywhere, add **two purposeful WebGL layers**:

1. **Site-wide ambient shader background** — a very slow-moving dark atmospheric noise/gradient field behind everything at extremely low intensity. Mouse-reactive. Changes the "feel" of every section without touching any component.
2. **Hero centerpiece** — replaces the current CSS motes with a proper three.js particle field around the avatar, featuring the connection/merge behavior described below.

Red Tiger poster tilt stays as-is.

### Hero particle behavior (refined per feedback)

Particles do more than glow — they form a living organism:

- Each frame, for every pair of particles within a `linkRadius` (~normalized 0.08), compute their distance `d`.
- Draw a thin line between them whose thickness = `mix(0, particleRadius, 1 - d / linkRadius)` — closer pairs get thicker links.
- When line thickness reaches `particleRadius` (i.e. `d < mergeRadius ≈ 0.015`), the two particles **merge** into a single larger particle:
  - New position = weighted midpoint by original mass (start mass = 1).
  - New mass = sum of both masses; new radius = `baseRadius * sqrt(mass)` so bigger particles feel heavier.
  - Merged particle inherits average velocity.
- To keep the population alive, merged particles decay: their mass slowly returns to 1 over ~8s, and new small particles spawn at hero edges to replace lost count.
- Mouse cursor acts as a soft attractor (~0.3 radius) making merges more likely under the pointer — this is the interactive payoff.
- Rendered via a single `THREE.LineSegments` (for links) + `THREE.Points` (for particles) with a custom shader driving per-vertex `gl_PointSize` from mass.
- Desktop: ~120 particles. Mobile: ~35 particles + link/merge disabled (too dense on small screens, falls back to simple point drift).
- Reduced-motion: everything freezes to a static snapshot.

### Ambient shader background

- Full-viewport fixed `<Canvas>` at `z-index: -1`, `aria-hidden`.
- Fragment shader: slow drifting fbm noise + radial gradient tinted by `--primary`, opacity ≤ 0.06.
- Hue shifts by `scrollY / documentHeight` so sections feel subtly distinct.
- Mouse position feeds a soft radial warp.
- `dpr = min(devicePixelRatio, 1.5)`, `frameloop="demand"`.

### Technical notes

- `three@^0.160.0` + `@react-three/fiber@^8.18` (React 18 compatible).
- No `@react-three/drei` — keep bundle lean.
- Lazy-loaded via `React.lazy` behind `<Suspense>` with existing CSS motes as fallback.
- WebGL detection → silent fallback to current CSS components.
- Mobile: skip ambient background entirely; reduced hero particle count.
- `prefers-reduced-motion` → freeze all uniforms.

### New files (Part A)

```text
src/components/three/
  AmbientShaderBackground.tsx
  HeroSceneR3F.tsx
  shaders/
    ambient.frag.glsl.ts
    hero-particles.vert.glsl.ts
    hero-particles.frag.glsl.ts
    hero-links.frag.glsl.ts
src/hooks/useMouseNormalized.ts
```

### Integration points (Part A)

- `src/pages/Index.tsx`: mount `<AmbientShaderBackground />` once.
- `src/components/cv/HeroSection.tsx`: swap `<HeroParticles />` for lazy `<HeroSceneR3F />` with existing component as Suspense fallback.
- No other component touched.

---

## PART B — Portfolio Version Two (`/v2`)

### Concept

An alternate portfolio experience where scroll position drives a single continuous video timeline. The video is stitched from many short AI-generated point-to-point animation clips where **each clip's last frame equals the next clip's first frame**, producing one seamless morphing reel. Scrolling forward plays forward; scrolling backward plays reverse. Sections of the portfolio (and optionally Skills) are anchored to specific timestamps in the reel — reaching a timestamp reveals its overlay text/tags/link.

### Entry point

- A small, restrained "Version Two" link added to the Portfolio section header (and optionally the site footer).
- Route: `/v2` — new page, does not replace the main site.
- Back link in `/v2` returns to `/`.

### Reference

- The user mentioned a personal GitHub repo (approximately "skill scroll world") as the reference implementation.
- **No GitHub connector is linked in this workspace**, so I cannot inspect the repo directly.
- **Action required from user**: paste the repo URL (or a raw README / demo link) before implementation of Part B begins. I will treat their repo as the source of truth for scroll-video mechanics, project structure, and any shader/canvas techniques it uses.

### Implementation approach (dependent on repo review)

Assuming a conventional scroll-driven video pattern (subject to change after seeing the reference):

- Single `<video>` element, `preload="auto"`, `playsInline`, `muted`, no autoplay.
- The video is the stitched reel — one file, encoded with fast-decode settings (H.264 baseline or HEVC/AV1 with progressive keyframes every ~0.5s to make scrubbing smooth).
- Scroll handler maps `scrollY` → `currentTime` linearly with a small lerp for smoothing.
- Portfolio entries defined as `{ id, tStart, tEnd, title, ... }`; the currently active entry (based on `currentTime`) reveals a text overlay with fade in/out.
- Optional skills phase at the end of the reel (or beginning) — same mechanic.
- Pinned layout: viewport-height container that maps N × viewport-heights of scroll to full video duration.

### AI-generated clip pipeline (out of scope for first pass)

- Producing the actual stitched reel is a content task, not a code task.
- Part B's first pass ships the **scroll-video framework** with a placeholder reel (or a still-image sequence stub) so the experience can be validated end-to-end.
- Once the user provides real clips, they drop in as a single encoded video file plus a JSON timestamp map.

### New files (Part B)

```text
src/pages/PortfolioV2.tsx
src/components/cv/v2/ScrollVideoReel.tsx
src/components/cv/v2/ReelOverlay.tsx
src/data/reelTimestamps.ts
public/reel/placeholder.mp4    # stub until real reel provided
```

### Integration points (Part B)

- `src/App.tsx`: new route `<Route path="/v2" element={<PortfolioV2 />} />`.
- `src/components/cv/PortfolioSection.tsx`: add restrained "Version Two →" link near the section header.

---

## Order Of Work

1. **Part A** (self-contained, ships this pass): ambient shader background, hero scene with link/merge behavior, fallbacks and reduced-motion. Deliverable = shippable improvement to the existing site.
2. **Await user's GitHub link** for the reference repo.
3. **Part B** (after link received): review the reference repo, then build `/v2` scaffold with placeholder reel and timestamp overlay system.

## Guardrails (both parts)

- No changes to Red Tiger, Portfolio card layouts, Skills interactions, Contact, or Experience.
- No 3D avatars. No morphing text. No canvas per section.
- All existing motion tokens (`src/lib/motion.ts`) remain the DOM motion source of truth.
- Type-check + build + Playwright smoke on desktop and mobile viewports before claiming done.

## Question For User

**Please paste the GitHub link for the "skill scroll world" reference repo.** I can't discover it — no GitHub connector is linked in this workspace. I'll start Part A immediately in parallel; Part B waits on that link.
