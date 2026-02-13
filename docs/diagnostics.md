# Diagnostics Matrix

## Runtime and environment checks

| Check | How to run | Expected result |
| --- | --- | --- |
| Node guard blocks runtime on Node 16 | `npm run dev` under Node 16 | Command fails fast with Node 20 guidance |
| Lint still works from Node 16 workflow | `npm run lint` | Lint runs without requiring global Node switch |
| Push gate is strict | `git push` | Runs `npm run guardian` (`build` + smoke) |

## Asset delivery checks

| Check | How to run | Expected result |
| --- | --- | --- |
| Production preview smoke | `npm run guardian` | Build succeeds, Playwright smoke passes on preview server |
| Portfolio thumbnails requested | Playwright smoke (`tests/smoke.spec.ts`) | Every `#portfolio img` has a browser image request |
| Portfolio thumbnails respond | Playwright smoke (`tests/smoke.spec.ts`) | Every thumbnail response status is 2xx or 3xx |
| No broken thumbnails | Playwright smoke (`tests/smoke.spec.ts`) | Every thumbnail has `naturalWidth > 0` |

## Mobile nav checks

| Check | How to run | Expected result |
| --- | --- | --- |
| Touch target minimum | Playwright smoke at 320px | Nav links are at least 44px x 44px |
| No overlap at 320px | Playwright smoke at 320px | Nav items do not overlap and stay in bounds |
| Avatar Home behavior | Playwright smoke after scroll | Home avatar appears once hero is out of view |
