# Ivan Gegov — Portfolio & CV

Personal portfolio website and CV for Ivan Gegov (Senior Animator / Animation Lead), focused on animation, compositing, and VFX work.

## Tech stack

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn/ui

## Local development

Node.js 20+ is required (`.nvmrc` included).

```sh
npm install
npm run dev
```

### Windows Node switching (dual-repo workflow)

This repo is Node 20 runtime/build/test, while your other work repo can remain Node 16.
Switch explicitly per repo with `nvm-windows`:

```powershell
nvm use 20
# run portfolio commands
nvm use 16
# switch back for your other repo
```

No global PATH edits, Node uninstalls, or global npm installs are needed for this repo.

## CI install policy

Use `npm ci` in CI **only when** `package-lock.json` is in sync with `package.json`.

```sh
npm ci
```

If `npm ci` reports lockfile drift (missing packages, invalid/mismatched entries), regenerate the lockfile locally with:

```sh
npm install
git add package-lock.json
git commit -m "chore: sync package-lock with package.json"
```

## Registry fallback (403 / restricted network)

If your environment blocks the default registry (for example 403 errors while resolving packages):

```sh
npm config set registry https://registry.npmjs.org/
# or set an internal mirror allowed by your network policy
```

Then retry install. In fully offline environments, use the npm cache when available:

```sh
npm install --offline
```

## Build

```sh
npm run build
npm run preview
```

## Quality gates

- `pre-commit`: lint only (kept lightweight).
- `pre-push`: `build` + preview-based Playwright smoke checks.

## Notes

All portfolio and CV content is stored in `src/data/cvData.ts`.
