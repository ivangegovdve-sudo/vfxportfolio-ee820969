# Test Matrix

## A) Runtime / blank screen checks

| Check | How to run | Expected result | Status |
| --- | --- | --- | --- |
| Confirm app loads (no context/provider crash) | Start dev server (`npm run dev`) and open app root | App renders without runtime errors or blank screen | ☐ |
| Confirm `HeroSection` renders with placeholder if image fails | Set an invalid `photoUrl` and refresh | Hero image swaps to placeholder (`/placeholder.svg`) and page keeps rendering | ☐ |

## B) Asset delivery checks

| Environment | Check | Expected result | Status |
| --- | --- | --- | --- |
| Dev | Open app in development (`npm run dev`) | Hero image resolves and displays | ☐ |
| Prod build | Build + preview (`npm run build && npm run preview`) | Hero image resolves and displays in preview | ☐ |
| Deployed URL | Open deployed site URL in browser | Hero image resolves and displays | ☐ |
