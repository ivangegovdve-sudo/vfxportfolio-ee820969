# Portfolio AI Motion QA - 2026-06-07

## Content Preservation

`git diff main -- src/data/cvData.ts`: empty.

## Local Checks

- typecheck: passed
- lint: passed
- test: passed, 2 files / 3 tests
- build: passed

## Visual Checks

- desktop hero: passed; `artifacts/qa/portfolio-desktop-hero-2026-06-07.png`
- mobile hero: passed; `artifacts/qa/portfolio-mobile-hero-2026-06-07.png`
- portfolio cards: passed; `artifacts/qa/portfolio-desktop-work-scrolled-2026-06-07.png`
- Red Tiger rail: passed; `artifacts/qa/portfolio-red-tiger-2026-06-07.png`
- reduced motion: passed; `artifacts/qa/portfolio-reduced-motion-hero-2026-06-07.png`

## Notes

- Desktop hero canvas rendered nonblank.
- Portrait visible on desktop and mobile.
- Hero title uses `data.hero.title`.
- Portfolio cards readable after scroll-triggered reveal.
- Red Tiger rail shows posters, game list, year filter, and collection CTA.
- Reduced-motion hero renders static composition.

## Deployment Boundary

No deploy, alias, Lovable live edit, or merge performed.
