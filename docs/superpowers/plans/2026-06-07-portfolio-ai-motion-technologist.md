# Portfolio AI Motion Technologist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved portfolio-only AI Motion Technologist redesign while preserving all displayed portfolio content from `src/data/cvData.ts`.

**Architecture:** Keep the existing React/Vite/CV-data architecture. Replace presentation through focused component/CSS edits: hero canvas and layout, portfolio plate cards, Red Tiger rail polish, section surfaces, and verification artifacts. Treat `src/data/cvData.ts` as immutable content source.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Canvas 2D, Vitest, ESLint, Playwright/browser screenshots for visual QA.

---

## File Structure

Modify:

- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\HeroParticles.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\HeroSection.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\PortfolioSection.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\RedTigerPosterRail.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\ExperienceSection.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\SkillsSection.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\ContactSection.tsx`
- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

Create:

- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\artifacts\qa\portfolio-ai-motion-qa-2026-06-07.md`

Do not modify:

- `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\data\cvData.ts`

## Task 1: Safety Baseline And Existing Title Preservation Fix

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\HeroSection.tsx`
- Create: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\artifacts\qa\portfolio-ai-motion-qa-2026-06-07.md`

- [ ] **Step 1: Verify content data is unchanged**

Run:

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab diff main -- src/data/cvData.ts
```

Expected:

```text
```

- [ ] **Step 2: Keep hero title sourced from CV data**

In `HeroSection.tsx`, ensure hero destructuring includes `title`:

```tsx
const { name, title, subtitle, photoUrl } = data.hero;
```

Ensure the hero title line renders:

```tsx
{title}
```

Do not render hardcoded replacement text such as:

```tsx
{"Animation \u00B7 Compositing \u00B7 VFX"}
```

- [ ] **Step 3: Run focused checks**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
```

Expected:

```text
typecheck passes
lint passes
3 tests pass
```

- [ ] **Step 4: Record baseline QA**

Create `artifacts\qa\portfolio-ai-motion-qa-2026-06-07.md`:

```markdown
# Portfolio AI Motion QA - 2026-06-07

## Content Preservation

`git diff main -- src/data/cvData.ts`: empty.

## Local Checks

- typecheck:
- lint:
- test:
- build:

## Visual Checks

- desktop hero:
- mobile hero:
- portfolio cards:
- Red Tiger rail:
- reduced motion:

## Deployment Boundary

No deploy, alias, Lovable live edit, or merge performed.
```

- [ ] **Step 5: Commit Task 1**

Run:

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/HeroSection.tsx artifacts/qa/portfolio-ai-motion-qa-2026-06-07.md
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "fix: preserve hero title from cv data"
```

Expected:

```text
[feature/portfolio-modern-motion-redesign <hash>] fix: preserve hero title from cv data
```

## Task 2: Hero Canvas Reliability And AI Motion Centerpiece

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\HeroParticles.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

- [ ] **Step 1: Add page-visibility pause state**

In `HeroParticles.tsx`, inside the effect, add:

```tsx
let isVisible = document.visibilityState !== "hidden";

const onVisibilityChange = () => {
  isVisible = document.visibilityState !== "hidden";
  if (isVisible && !reduceMotion) {
    start = performance.now();
    frameId = window.requestAnimationFrame(draw);
  }
};
```

Register cleanup:

```tsx
document.addEventListener("visibilitychange", onVisibilityChange);
```

```tsx
document.removeEventListener("visibilitychange", onVisibilityChange);
```

At the top of `draw`, guard hidden tabs:

```tsx
if (!isVisible) {
  return;
}
```

- [ ] **Step 2: Add mobile particle density cap**

Replace fixed dot/ring usage with canvas-size-aware slices:

```tsx
const visibleDots = width < 640 ? dots.slice(0, 220) : dots;
const visibleRingCount = width < 640 ? 12 : RING_COUNT;
```

Use `visibleRingCount` in the ring loop and `visibleDots.forEach` for dots.

- [ ] **Step 3: Strengthen hybrid light field**

In `HeroParticles.tsx`, keep radial light but tune stops:

```tsx
light.addColorStop(0, "rgba(255,255,255,0.38)");
light.addColorStop(0.14, "rgba(255,199,92,0.22)");
light.addColorStop(0.42, "rgba(88,166,255,0.11)");
light.addColorStop(1, "rgba(2,6,18,0)");
```

- [ ] **Step 4: Add CSS constraints for nonblank hero**

In `index.css`, ensure:

```css
.hero-particle-stage {
  min-height: 100%;
  background:
    radial-gradient(circle at 68% 42%, rgba(251, 191, 36, 0.08), transparent 28rem),
    radial-gradient(circle at 18% 24%, rgba(34, 211, 238, 0.06), transparent 24rem);
}

.hero-particle-canvas {
  display: block;
}
```

- [ ] **Step 5: Run checks**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected:

```text
typecheck passes
lint passes
build passes
```

- [ ] **Step 6: Commit Task 2**

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/HeroParticles.tsx src/index.css
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "feat: harden AI motion hero canvas"
```

## Task 3: Hero Layout And First-Viewport Polish

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\HeroSection.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

- [ ] **Step 1: Preserve existing content bindings**

Confirm these exact data bindings remain:

```tsx
const { name, title, subtitle, photoUrl } = data.hero;
```

Hero text must render:

```tsx
{name}
{title}
{subtitle}
```

- [ ] **Step 2: Add AI-motion framing without new personal copy**

Use decorative labels only when they do not replace personal content. If adding a small UI label, use non-personal system text:

```tsx
<span aria-hidden="true" className="hero-system-label">
  Motion field
</span>
```

Do not add biographical claims or new role descriptions.

- [ ] **Step 3: Tighten mobile hero stack**

In `index.css`, add:

```css
@media (max-width: 767px) {
  .hero-command-panel {
    max-height: none;
    text-align: center;
  }

  .hero-title {
    overflow-wrap: anywhere;
  }
}
```

- [ ] **Step 4: Add focus-visible parity**

In `index.css`, ensure hero controls have visible focus:

```css
.hero-command-panel a:focus-visible,
.hero-command-panel button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 4px;
}
```

- [ ] **Step 5: Run checks and commit**

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/HeroSection.tsx src/index.css
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "feat: polish AI motion hero layout"
```

## Task 4: Portfolio Project Plate Cards

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\PortfolioSection.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

- [ ] **Step 1: Verify project fields stay source-bound**

In `PortfolioSection.tsx`, cards must continue using:

```tsx
item.url
item.thumbnail
item.title
item.category
item.year
item.descriptor
item.ctaLabel
```

- [ ] **Step 2: Add production-plate metadata shell**

Use existing values only:

```tsx
{(item.year || item.category) && (
  <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
    {[item.year, item.category].filter(Boolean).join(" | ")}
  </p>
)}
```

- [ ] **Step 3: Improve CSS plate depth**

In `index.css`, add or tune:

```css
.portfolio-card {
  transform-style: preserve-3d;
  will-change: transform, box-shadow;
}

.portfolio-card-media {
  isolation: isolate;
}

.portfolio-card:focus-visible {
  border-color: hsl(var(--primary) / 0.65);
  box-shadow: var(--shadow-hover);
}
```

- [ ] **Step 4: Reduced motion fallback**

```css
@media (prefers-reduced-motion: reduce) {
  .portfolio-card,
  .portfolio-card img {
    transition: none !important;
    transform: none !important;
  }
}
```

- [ ] **Step 5: Run checks and commit**

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/PortfolioSection.tsx src/index.css
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "feat: refine portfolio project plates"
```

## Task 5: Red Tiger Rail Accessibility And Motion

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\RedTigerPosterRail.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

- [ ] **Step 1: Preserve collection source fields**

Confirm rail renders existing:

```tsx
item.title
item.descriptor
item.url
item.ctaLabel
item.games
game.name
game.url
game.year
game.posterUrl
```

- [ ] **Step 2: Ensure keyboard/touch usability**

Poster links must be anchors when a URL exists:

```tsx
<a href={game.url} target="_blank" rel="noopener noreferrer">
  {game.name}
</a>
```

If no URL exists, render non-link text:

```tsx
<span>{game.name}</span>
```

- [ ] **Step 3: Add rail fallback CSS**

```css
.rail-scroll-trap {
  scroll-snap-type: x proximity;
}

.rail-scroll-trap > * {
  scroll-snap-align: start;
}

@media (prefers-reduced-motion: reduce) {
  .rail-scroll-trap {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 4: Run checks and commit**

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/RedTigerPosterRail.tsx src/index.css
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "feat: improve Red Tiger rail accessibility"
```

## Task 6: Experience, Skills, And Contact Surfaces

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\ExperienceSection.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\SkillsSection.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\components\cv\ContactSection.tsx`
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\src\index.css`

- [ ] **Step 1: Preserve source-bound rendering**

Experience must keep existing fields:

```tsx
item.role
item.company
item.location
item.startDate
item.endDate
item.description
item.highlights
item.tags
item.links
```

Skills must keep:

```tsx
section.title
group.category
group.skills
data.skills.personal
```

Contact must keep:

```tsx
data.contact.email
data.contact.location
data.contact.links
```

- [ ] **Step 2: Add section surface classes**

Use classes, not content rewrites:

```tsx
className="cv-surface-panel"
```

For repeated items:

```tsx
className="cv-module-card"
```

- [ ] **Step 3: Add CSS surface system**

```css
.cv-surface-panel {
  border: 1px solid hsl(var(--border) / 0.7);
  background:
    linear-gradient(145deg, hsl(var(--card) / 0.82), hsl(var(--background) / 0.72)),
    radial-gradient(circle at 12% 0%, hsl(var(--primary) / 0.08), transparent 18rem);
  box-shadow: var(--shadow-rest);
}

.cv-module-card {
  border: 1px solid hsl(var(--border) / 0.65);
  background: hsl(var(--card) / 0.72);
}
```

- [ ] **Step 4: Run checks and commit**

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add src/components/cv/ExperienceSection.tsx src/components/cv/SkillsSection.tsx src/components/cv/ContactSection.tsx src/index.css
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "feat: unify CV section surfaces"
```

## Task 7: Full Verification And Visual QA

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\artifacts\qa\portfolio-ai-motion-qa-2026-06-07.md`

- [ ] **Step 1: Run full local checks**

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab diff main -- src/data/cvData.ts
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test
```

Expected:

```text
cvData diff empty
typecheck passes
lint passes
build passes
3 tests pass
```

- [ ] **Step 2: Run local browser QA**

Start local dev server only, no Vercel:

```powershell
npm.cmd run dev
```

Open local URL in browser. Capture:

- desktop hero
- desktop portfolio cards
- mobile hero
- mobile portfolio cards
- reduced-motion state when feasible

- [ ] **Step 3: Update QA artifact**

Fill `artifacts\qa\portfolio-ai-motion-qa-2026-06-07.md` with actual command results and screenshot paths.

- [ ] **Step 4: Commit QA**

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab add artifacts/qa/portfolio-ai-motion-qa-2026-06-07.md
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab commit -m "docs: record portfolio redesign QA"
```

## Task 8: PR-Ready Summary, No Deployment

**Files:**
- Modify: `D:\projects\ivan-websites\worktrees\portfolio-redesign-lab\docs\superpowers\plans\2026-06-07-portfolio-ai-motion-technologist.md`

- [ ] **Step 1: Inspect final branch**

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab status --short --branch
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab log --oneline -8
```

Expected:

```text
branch ahead of origin
working tree clean
recent commits show implementation tasks
```

- [ ] **Step 2: Confirm no deployment**

Do not run:

```powershell
npx.cmd vercel deploy
npx.cmd vercel --prod
npx.cmd vercel alias set
```

- [ ] **Step 3: Prepare PR note text**

Use this PR note draft:

```markdown
Portfolio-only AI Motion Technologist redesign pass.

Safety:
- `src/data/cvData.ts` unchanged.
- No deploy, alias, Lovable live edit, or merge.
- sdforest.site out of scope.

Verification:
- typecheck passed
- lint passed
- build passed
- test passed
- desktop/mobile visual QA recorded
```

- [ ] **Step 4: Stop before push/comment unless explicitly approved**

Ask Ivan before pushing or commenting on PR.

## Plan Self-Review

Spec coverage:

- Portfolio-only scope covered by all tasks.
- Hero hybrid dot sphere/luminous field covered by Tasks 2-3.
- Portfolio project plates covered by Task 4.
- Red Tiger collection covered by Task 5.
- Experience/skills/contact covered by Task 6.
- Content preservation covered by Tasks 1 and 7.
- No deployment boundary covered by Tasks 7-8.

Placeholder scan:

- No `TBD`.
- No `TODO`.
- No "implement later".
- No undefined task owner.

Type consistency:

- React components stay in `src/components/cv`.
- Protected data path consistently `src/data/cvData.ts`.
- QA artifact path consistently `artifacts/qa/portfolio-ai-motion-qa-2026-06-07.md`.
