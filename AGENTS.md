# Portfolio Guardrails

## Environment And Safety Rules
- Dual Node policy:
  - This portfolio repo uses Node 20 for runtime/build/test tasks.
  - Other work repos can remain on Node 16.
  - Switching must stay explicit and repo-scoped.
- Windows reality:
  - Assume `nvm-windows`, not Unix shell behavior.
  - Do not assume automatic `.nvmrc` switching in PowerShell or Git Bash.
- Hard stop on environment mutation unless the user explicitly asks:
  - no global PATH edits
  - no uninstalling Node 16
  - no global `npm -g` installs

## Commit And Push Gates
- `pre-commit` must remain lightweight and lint-only.
- `pre-commit` must not require the user to switch away from Node 16.
- `pre-push` is the strict gate and must enforce:
  - production build
  - preview-based smoke tests

## Runtime Guard Requirements
- `dev`, `build`, `preview`, `test`, and smoke commands must fail fast on Node < 20 with a helpful message.
- The guard must never block lint.
- The guard must never prevent committing from Node 16.

## Asset And Build Reliability Rules
- Never change image format/path without updating all references.
- For portfolio thumbnails:
  - do not use runtime `/src/...` URLs
  - prefer imported assets (bundler-managed) or `/assets/...` from `public`
- Keep file-name casing exact between file system and import path.
- Post-optimization checks are mandatory:
  - `build` + `preview` + Playwright smoke
  - all portfolio thumbnails must load (no broken images)
- Missing image diagnosis must include network evidence:
  - requested vs not requested
  - HTTP status (200 vs 404/other)
  - request failures

## UX And Animation Governance
- Use shared motion tokens for durations/easing.
- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Restraint standard:
  - micro-interactions only
  - no over-produced "demo reel" motion patterns
- Timing guide:
  - typical transitions: 120-240ms
  - avatar reveal: 180-250ms
- Mobile navigation requirements:
  - icon-first on mobile
  - evenly distributed
  - touch targets >= 44px
  - no overlap at 320px width
  - "Home" avatar appears only when hero is out of view
  - rearrangement stays smooth (no snap)
- Regressions in nav animation/usability are blockers and must be refined or reverted.

## Agent Process Rules
- Do not guess. If an assumption fails twice, switch to diagnostics mode.
- Diagnostics mode uses minimal probes first (targeted Playwright checks, missing-asset checks, etc.).
- Verify after each fix:
  - console clean
  - build/preview pass
  - smoke tests pass
  - targeted checks pass
- Stop gate:
  - if prerequisites are missing, stop and report safe next steps
  - do not force risky environment changes
