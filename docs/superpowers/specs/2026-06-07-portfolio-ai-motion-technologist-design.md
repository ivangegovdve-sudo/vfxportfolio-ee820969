# Portfolio AI Motion Technologist Redesign - Design Spec

## Status

Draft based on current planning assumptions; awaiting user review:

- Scope: portfolio site only.
- sdforest.site: out of scope for this spec.
- Deployment: out of scope.
- Merge: out of scope.
- Content changes: out of scope.

## Goal

Redesign Ivan Gegov's portfolio into a modern, interactive, AI-motion-forward web experience inspired by Antigravity-style dynamic dot spheres, twin.io-level premium motion, and Onlook-style light-through-cloud atmosphere, while preserving every displayed personal/professional content item from the existing portfolio source.

## Non-Destructive Boundary

Work happens only in:

`D:\projects\ivan-websites\worktrees\portfolio-redesign-lab`

Branch:

`feature/portfolio-modern-motion-redesign`

PR:

https://github.com/ivangegovdve-sudo/vfxportfolio-ee820969/pull/26

Protected content file:

`src\data\cvData.ts`

Hard rules:

- Do not edit `main`.
- Do not change `src\data\cvData.ts`.
- Do not add, remove, hide, or rewrite displayed portfolio content.
- Do not deploy.
- Do not change Lovable/live portfolio.
- Do not merge PR.
- Do not include sdforest implementation in this spec.

## Chosen Direction

Primary impression:

`AI Motion Technologist`

Current planning basis:

- Hybrid dot sphere + luminous field hero.
- Single-page portfolio scroll.
- High motion budget with reduced-motion fallback.
- Professional VFX structure underneath the experimental first impression.

## Plugin Roles

Superpowers:

- Enforce design-first workflow.
- Keep implementation blocked until spec review.
- Convert approved spec into implementation plan later.

Build Web Data Visualization:

- Treat visual systems as meaning-bearing interaction, not generic decoration.
- Ensure motion clarifies identity, orientation, or interactivity.
- Require mobile and accessibility states.

Remotion:

- Optional future motion study/export pipeline.
- Can generate hero timing studies or shareable motion reels.
- Not required for initial website implementation.

HeyGen:

- Optional future avatar/video intro exploration.
- Not part of initial portfolio redesign because it could distract from portfolio content and add production dependency.

Lovable:

- Existing portfolio origin/reference.
- No direct Lovable edit in this spec.

## User Experience Structure

The portfolio remains a single-page site with stronger cinematic transitions:

1. Hero
2. Portfolio projects
3. Red Tiger collection
4. Experience
5. Skills
6. Contact

Rationale:

- Preserves existing content order and discoverability.
- Avoids hiding career/resume content behind experimental app navigation.
- Supports recruiters, collaborators, and creative reviewers.
- Keeps mobile reading path straightforward.

## Hero Design

Hero is the primary "wow" surface.

Elements:

- Existing name from `data.hero.name`.
- Existing title from `data.hero.title`.
- Existing subtitle from `data.hero.subtitle`.
- Existing portrait from `data.hero.photoUrl`.
- Primary CTAs to existing page sections.
- Canvas-based deterministic dot sphere.
- Luminous cloud/light field reacting to pointer.

Motion:

- Pointer subtly rotates sphere.
- Nearby dots brighten or repel.
- Light source shifts with cursor.
- Ambient orbit continues at low speed.
- Mobile uses lower density and calmer movement.
- Reduced-motion mode renders static composition.

Accessibility:

- Canvas is decorative and `aria-hidden`.
- DOM text remains primary.
- Text contrast must pass on all hero states.
- Hero CTAs are keyboard reachable.
- No required information appears only inside canvas.

## Portfolio Work Area

Project cards become image-first production plates.

Preserved fields:

- title
- descriptor
- year
- category
- URL
- CTA label
- thumbnail

Motion:

- Hover/focus light sweep.
- Subtle card depth and lift.
- Media scale within card bounds.
- Clear external-link affordance.

Constraints:

- No project hidden behind hover-only controls.
- Mobile tap target remains full card.
- Existing ordering from `cvData.portfolio.order` remains source of truth.

## Red Tiger Collection

Red Tiger remains distinct from normal project cards.

Design:

- Larger feature rail or stacked showcase.
- Poster/media-first treatment.
- Existing collection descriptor preserved.
- Existing game names, years, URLs, poster URLs preserved.

Motion:

- Horizontal poster rail or staged carousel effect.
- Keyboard/touch usable.
- Reduced-motion fallback keeps plain scroll/list.

## Experience

Experience becomes structured motion-control surface, not rewritten resume.

Preserved fields:

- role
- company
- location
- startDate
- endDate
- description
- highlights
- tags
- links

Design:

- Timeline or production-stack panels.
- Strong section hierarchy.
- Highlight tags visible without hover.
- Links remain visible and reachable.

## Skills

Skills become compact capability matrix.

Preserved fields:

- section titles
- category labels
- skill names
- personal skills

Design:

- Grouped modules.
- Motion accents on hover/focus only.
- No skill reclassification unless data source changes later.

## Contact

Contact remains simple and direct.

Preserved fields:

- email
- location
- links

Design:

- High-contrast final panel.
- Existing links only.
- Clear focus states.

## Visual System

Palette:

- Deep black/blue base.
- Warm gold focal light.
- Cyan technical rim light.
- Small pink/magenta accents only if useful for depth.

Avoid:

- one-hue purple-blue dominance
- vague gradient wallpaper
- decorative blobs
- low-contrast fog
- hover-only information

Typography:

- Existing font system unless a stronger type choice is already locally available.
- Large hero type only in hero.
- Compact type in cards and dense sections.

Layout:

- Full-width atmospheric bands.
- Cards only for repeated content items.
- No cards inside cards.
- Stable dimensions for hero canvas, cards, buttons, and poster rail.

## Motion System

Core primitives:

- deterministic dot sphere
- luminous field/pointer light
- card plate hover/focus sweep
- section reveal
- ambient motes only when they reinforce depth

Performance targets:

- cap device pixel ratio
- cap particle counts on mobile
- pause or reduce animation when reduced-motion is active
- avoid heavy dependencies unless needed

## Accessibility And Mobile

Required:

- `prefers-reduced-motion` support.
- Keyboard focus states equivalent to hover emphasis.
- No hidden essential content.
- Tap targets large enough on mobile.
- Text does not overlap UI or canvas.
- Hero text readable over light field.
- Cards readable in grayscale/color-deficiency review.

Mobile:

- Same content order.
- Hero canvas reframed rather than cropped into blank area.
- Portfolio cards stack naturally.
- Red Tiger rail supports touch scroll or list fallback.

## Testing And Verification

Before implementation claim:

```powershell
git -C D:\projects\ivan-websites\worktrees\portfolio-redesign-lab diff main -- src/data/cvData.ts
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test
```

Visual QA:

- desktop screenshot
- mobile screenshot
- hero canvas nonblank
- portrait visible
- cards readable
- no overlapping text
- reduced-motion state checked

Deployment QA:

- No deployment in this spec.
- No Vercel alias.
- No Lovable live edit.
- No PR merge.

## Out Of Scope

- sdforest redesign
- Railway backend
- Vercel project/domain changes
- live portfolio deployment
- content rewriting
- new portfolio projects
- HeyGen avatar intro
- Remotion-rendered video assets
- graph/timeline constellation as whole-site navigation

## Future Optional Enhancements

After initial portfolio redesign:

- Remotion hero motion study.
- Spatial timeline constellation as one section.
- HeyGen intro video if it supports, not replaces, portfolio content.
- sdforest visual-system adaptation as separate spec.

## Approval Needed Before Implementation Plan

User must review this spec and approve before writing implementation plan.
