# Install

Source category: `Install`

Files included: 20

---

## File: `install/ansible.md`

Source URL: https://docs.openclaw.ai/install/ansible.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Ansible

# Ansible Installation

The recommended way to deploy OpenClaw to production servers is via **[openclaw-ansible](https://github.com/openclaw/openclaw-ansible)** â€” an automated installer with security-first architecture.

## Quick Start

One-command install:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://raw.githubusercontent.com/openclaw/openclaw-ansible/main/install.sh | bash
```

> **ðŸ“¦ Full guide: [github.com/openclaw/openclaw-ansible](https://github.com/openclaw/openclaw-ansible)**
>
> The openclaw-ansible repo is the source of truth for Ansible deployment. This page is a quick overview.

## What You Get

* ðŸ”’ **Firewall-first security**: UFW + Docker isolation (only SSH + Tailscale accessible)
* ðŸ” **Tailscale VPN**: Secure remote access without exposing services publicly
* ðŸ³ **Docker**: Isolated sandbox containers, localhost-only bindings
* ðŸ›¡ï¸ **Defense in depth**: 4-layer security architecture
* ðŸš€ **One-command setup**: Complete deployment in minutes
* ðŸ”§ **Systemd integration**: Auto-start on boot with hardening

## Requirements

* **OS**: Debian 11+ or Ubuntu 20.04+
* **Access**: Root or sudo privileges
* **Network**: Internet connection for package installation
* **Ansible**: 2.14+ (installed automatically by quick-start script)

## What Gets Installed

The Ansible playbook installs and configures:

1. **Tailscale** (mesh VPN for secure remote access)
2. **UFW firewall** (SSH + Tailscale ports only)
3. **Docker CE + Compose V2** (for agent sandboxes)
4. **Node.js 22.x + pnpm** (runtime dependencies)
5. **OpenClaw** (host-based, not containerized)
6. **Systemd service** (auto-start with security hardening)

Note: The gateway runs **directly on the host** (not in Docker), but agent sandboxes use Docker for isolation. See [Sandboxing](/gateway/sandboxing) for details.

## Post-Install Setup

After installation completes, switch to the openclaw user:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo -i -u openclaw
```

The post-install script will guide you through:

1. **Onboarding wizard**: Configure OpenClaw settings
2. **Provider login**: Connect WhatsApp/Telegram/Discord/Signal
3. **Gateway testing**: Verify the installation
4. **Tailscale setup**: Connect to your VPN mesh

### Quick commands

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check service status
sudo systemctl status openclaw

# View live logs
sudo journalctl -u openclaw -f

# Restart gateway
sudo systemctl restart openclaw

# Provider login (run as openclaw user)
sudo -i -u openclaw
openclaw channels login
```

## Security Architecture

### 4-Layer Defense

1. **Firewall (UFW)**: Only SSH (22) + Tailscale (41641/udp) exposed publicly
2. **VPN (Tailscale)**: Gateway accessible only via VPN mesh
3. **Docker Isolation**: DOCKER-USER iptables chain prevents external port exposure
4. **Systemd Hardening**: NoNewPrivileges, PrivateTmp, unprivileged user

### Verification

Test external attack surface:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
nmap -p- YOUR_SERVER_IP
```

Should show **only port 22** (SSH) open. All other services (gateway, Docker) are locked down.

### Docker Availability

Docker is installed for **agent sandboxes** (isolated tool execution), not for running the gateway itself. The gateway binds to localhost only and is accessible via Tailscale VPN.

See [Multi-Agent Sandbox & Tools](/tools/multi-agent-sandbox-tools) for sandbox configuration.

## Manual Installation

If you prefer manual control over the automation:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# 1. Install prerequisites
sudo apt update && sudo apt install -y ansible git

# 2. Clone repository
git clone https://github.com/openclaw/openclaw-ansible.git
cd openclaw-ansible

# 3. Install Ansible collections
ansible-galaxy collection install -r requirements.yml

# 4. Run playbook
./run-playbook.sh

# Or run directly (then manually execute /tmp/openclaw-setup.sh after)
# ansible-playbook playbook.yml --ask-become-pass
```

## Updating OpenClaw

The Ansible installer sets up OpenClaw for manual updates. See [Updating](/install/updating) for the standard update flow.

To re-run the Ansible playbook (e.g., for configuration changes):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cd openclaw-ansible
./run-playbook.sh
```

Note: This is idempotent and safe to run multiple times.

## Troubleshooting

### Firewall blocks my connection

If you're locked out:

* Ensure you can access via Tailscale VPN first
* SSH access (port 22) is always allowed
* The gateway is **only** accessible via Tailscale by design

### Service won't start

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check logs
sudo journalctl -u openclaw -n 100

# Verify permissions
sudo ls -la /opt/openclaw

# Test manual start
sudo -i -u openclaw
cd ~/openclaw
pnpm start
```

### Docker sandbox issues

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Verify Docker is running
sudo systemctl status docker

# Check sandbox image
sudo docker images | grep openclaw-sandbox

# Build sandbox image if missing
cd /opt/openclaw/openclaw
sudo -u openclaw ./scripts/sandbox-setup.sh
```

### Provider login fails

Make sure you're running as the `openclaw` user:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo -i -u openclaw
openclaw channels login
```

## Advanced Configuration

For detailed security architecture and troubleshooting:

* [Security Architecture](https://github.com/openclaw/openclaw-ansible/blob/main/docs/security.md)
* [Technical Details](https://github.com/openclaw/openclaw-ansible/blob/main/docs/architecture.md)
* [Troubleshooting Guide](https://github.com/openclaw/openclaw-ansible/blob/main/docs/troubleshooting.md)

## Related

* [openclaw-ansible](https://github.com/openclaw/openclaw-ansible) â€” full deployment guide
* [Docker](/install/docker) â€” containerized gateway setup
* [Sandboxing](/gateway/sandboxing) â€” agent sandbox configuration
* [Multi-Agent Sandbox & Tools](/tools/multi-agent-sandbox-tools) â€” per-agent isolation


Built with [Mintlify](https://mintlify.com).

---

## File: `install/bun.md`

Source URL: https://docs.openclaw.ai/install/bun.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Bun (Experimental)

# Bun (experimental)

Goal: run this repo with **Bun** (optional, not recommended for WhatsApp/Telegram)
without diverging from pnpm workflows.

âš ï¸ **Not recommended for Gateway runtime** (WhatsApp/Telegram bugs). Use Node for production.

## Status

* Bun is an optional local runtime for running TypeScript directly (`bun run â€¦`, `bun --watch â€¦`).
* `pnpm` is the default for builds and remains fully supported (and used by some docs tooling).
* Bun cannot use `pnpm-lock.yaml` and will ignore it.

## Install

Default:

```sh  theme={"theme":{"light":"min-light","dark":"min-dark"}}
bun install
```

Note: `bun.lock`/`bun.lockb` are gitignored, so thereâ€™s no repo churn either way. If you want *no lockfile writes*:

```sh  theme={"theme":{"light":"min-light","dark":"min-dark"}}
bun install --no-save
```

## Build / Test (Bun)

```sh  theme={"theme":{"light":"min-light","dark":"min-dark"}}
bun run build
bun run vitest run
```

## Bun lifecycle scripts (blocked by default)

Bun may block dependency lifecycle scripts unless explicitly trusted (`bun pm untrusted` / `bun pm trust`).
For this repo, the commonly blocked scripts are not required:

* `@whiskeysockets/baileys` `preinstall`: checks Node major >= 20 (we run Node 22+).
* `protobufjs` `postinstall`: emits warnings about incompatible version schemes (no build artifacts).

If you hit a real runtime issue that requires these scripts, trust them explicitly:

```sh  theme={"theme":{"light":"min-light","dark":"min-dark"}}
bun pm trust @whiskeysockets/baileys protobufjs
```

## Caveats

* Some scripts still hardcode pnpm (e.g. `docs:build`, `ui:*`, `protocol:check`). Run those via pnpm for now.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/development-channels.md`

Source URL: https://docs.openclaw.ai/install/development-channels.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Development Channels

# Development channels

Last updated: 2026-01-21

OpenClaw ships three update channels:

* **stable**: npm dist-tag `latest`.
* **beta**: npm dist-tag `beta` (builds under test).
* **dev**: moving head of `main` (git). npm dist-tag: `dev` (when published).

We ship builds to **beta**, test them, then **promote a vetted build to `latest`**
without changing the version number â€” dist-tags are the source of truth for npm installs.

## Switching channels

Git checkout:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw update --channel stable
openclaw update --channel beta
openclaw update --channel dev
```

* `stable`/`beta` check out the latest matching tag (often the same tag).
* `dev` switches to `main` and rebases on the upstream.

npm/pnpm global install:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw update --channel stable
openclaw update --channel beta
openclaw update --channel dev
```

This updates via the corresponding npm dist-tag (`latest`, `beta`, `dev`).

When you **explicitly** switch channels with `--channel`, OpenClaw also aligns
the install method:

* `dev` ensures a git checkout (default `~/openclaw`, override with `OPENCLAW_GIT_DIR`),
  updates it, and installs the global CLI from that checkout.
* `stable`/`beta` installs from npm using the matching dist-tag.

Tip: if you want stable + dev in parallel, keep two clones and point your gateway at the stable one.

## Plugins and channels

When you switch channels with `openclaw update`, OpenClaw also syncs plugin sources:

* `dev` prefers bundled plugins from the git checkout.
* `stable` and `beta` restore npm-installed plugin packages.

## Tagging best practices

* Tag releases you want git checkouts to land on (`vYYYY.M.D` for stable, `vYYYY.M.D-beta.N` for beta).
* `vYYYY.M.D.beta.N` is also recognized for compatibility, but prefer `-beta.N`.
* Legacy `vYYYY.M.D-<patch>` tags are still recognized as stable (non-beta).
* Keep tags immutable: never move or reuse a tag.
* npm dist-tags remain the source of truth for npm installs:
  * `latest` â†’ stable
  * `beta` â†’ candidate build
  * `dev` â†’ main snapshot (optional)

## macOS app availability

Beta and dev builds may **not** include a macOS app release. Thatâ€™s OK:

* The git tag and npm dist-tag can still be published.
* Call out â€œno macOS build for this betaâ€ in release notes or changelog.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/docker.md`

Source URL: https://docs.openclaw.ai/install/docker.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Docker

# Docker (optional)

Docker is **optional**. Use it only if you want a containerized gateway or to validate the Docker flow.

## Is Docker right for me?

* **Yes**: you want an isolated, throwaway gateway environment or to run OpenClaw on a host without local installs.
* **No**: youâ€™re running on your own machine and just want the fastest dev loop. Use the normal install flow instead.
* **Sandboxing note**: agent sandboxing uses Docker too, but it does **not** require the full gateway to run in Docker. See [Sandboxing](/gateway/sandboxing).

This guide covers:

* Containerized Gateway (full OpenClaw in Docker)
* Per-session Agent Sandbox (host gateway + Docker-isolated agent tools)

Sandboxing details: [Sandboxing](/gateway/sandboxing)

## Requirements

* Docker Desktop (or Docker Engine) + Docker Compose v2
* At least 2 GB RAM for image build (`pnpm install` may be OOM-killed on 1 GB hosts with exit 137)
* Enough disk for images + logs
* If running on a VPS/public host, review
  [Security hardening for network exposure](/gateway/security#04-network-exposure-bind--port--firewall),
  especially Docker `DOCKER-USER` firewall policy.

## Containerized Gateway (Docker Compose)

### Quick start (recommended)

<Note>
  Docker defaults here assume bind modes (`lan`/`loopback`), not host aliases. Use bind
  mode values in `gateway.bind` (for example `lan` or `loopback`), not host aliases like
  `0.0.0.0` or `localhost`.
</Note>

From repo root:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./docker-setup.sh
```

This script:

* builds the gateway image locally (or pulls a remote image if `OPENCLAW_IMAGE` is set)
* runs the onboarding wizard
* prints optional provider setup hints
* starts the gateway via Docker Compose
* generates a gateway token and writes it to `.env`

Optional env vars:

* `OPENCLAW_IMAGE` â€” use a remote image instead of building locally (e.g. `ghcr.io/openclaw/openclaw:latest`)
* `OPENCLAW_DOCKER_APT_PACKAGES` â€” install extra apt packages during build
* `OPENCLAW_EXTENSIONS` â€” pre-install extension dependencies at build time (space-separated extension names, e.g. `diagnostics-otel matrix`)
* `OPENCLAW_EXTRA_MOUNTS` â€” add extra host bind mounts
* `OPENCLAW_HOME_VOLUME` â€” persist `/home/node` in a named volume
* `OPENCLAW_SANDBOX` â€” opt in to Docker gateway sandbox bootstrap. Only explicit truthy values enable it: `1`, `true`, `yes`, `on`
* `OPENCLAW_INSTALL_DOCKER_CLI` â€” build arg passthrough for local image builds (`1` installs Docker CLI in the image). `docker-setup.sh` sets this automatically when `OPENCLAW_SANDBOX=1` for local builds.
* `OPENCLAW_DOCKER_SOCKET` â€” override Docker socket path (default: `DOCKER_HOST=unix://...` path, else `/var/run/docker.sock`)
* `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1` â€” break-glass: allow trusted private-network
  `ws://` targets for CLI/onboarding client paths (default is loopback-only)
* `OPENCLAW_BROWSER_DISABLE_GRAPHICS_FLAGS=0` â€” disable container browser hardening flags
  `--disable-3d-apis`, `--disable-software-rasterizer`, `--disable-gpu` when you need
  WebGL/3D compatibility.
* `OPENCLAW_BROWSER_DISABLE_EXTENSIONS=0` â€” keep extensions enabled when browser
  flows require them (default keeps extensions disabled in sandbox browser).
* `OPENCLAW_BROWSER_RENDERER_PROCESS_LIMIT=<N>` â€” set Chromium renderer process
  limit; set to `0` to skip the flag and use Chromium default behavior.

After it finishes:

* Open `http://127.0.0.1:18789/` in your browser.
* Paste the token into the Control UI (Settings â†’ token).
* Need the URL again? Run `docker compose run --rm openclaw-cli dashboard --no-open`.

### Enable agent sandbox for Docker gateway (opt-in)

`docker-setup.sh` can also bootstrap `agents.defaults.sandbox.*` for Docker
deployments.

Enable with:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_SANDBOX=1
./docker-setup.sh
```

Custom socket path (for example rootless Docker):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_SANDBOX=1
export OPENCLAW_DOCKER_SOCKET=/run/user/1000/docker.sock
./docker-setup.sh
```

Notes:

* The script mounts `docker.sock` only after sandbox prerequisites pass.
* If sandbox setup cannot be completed, the script resets
  `agents.defaults.sandbox.mode` to `off` to avoid stale/broken sandbox config
  on reruns.
* If `Dockerfile.sandbox` is missing, the script prints a warning and continues;
  build `openclaw-sandbox:bookworm-slim` with `scripts/sandbox-setup.sh` if
  needed.
* For non-local `OPENCLAW_IMAGE` values, the image must already contain Docker
  CLI support for sandbox execution.

### Automation/CI (non-interactive, no TTY noise)

For scripts and CI, disable Compose pseudo-TTY allocation with `-T`:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run -T --rm openclaw-cli gateway probe
docker compose run -T --rm openclaw-cli devices list --json
```

If your automation exports no Claude session vars, leaving them unset now resolves to
empty values by default in `docker-compose.yml` to avoid repeated "variable is not set"
warnings.

### Shared-network security note (CLI + gateway)

`openclaw-cli` uses `network_mode: "service:openclaw-gateway"` so CLI commands can
reliably reach the gateway over `127.0.0.1` in Docker.

Treat this as a shared trust boundary: loopback binding is not isolation between these two
containers. If you need stronger separation, run commands from a separate container/host
network path instead of the bundled `openclaw-cli` service.

To reduce impact if the CLI process is compromised, the compose config drops
`NET_RAW`/`NET_ADMIN` and enables `no-new-privileges` on `openclaw-cli`.

It writes config/workspace on the host:

* `~/.openclaw/`
* `~/.openclaw/workspace`

Running on a VPS? See [Hetzner (Docker VPS)](/install/hetzner).

### Use a remote image (skip local build)

Official pre-built images are published at:

* [GitHub Container Registry package](https://github.com/openclaw/openclaw/pkgs/container/openclaw)

Use image name `ghcr.io/openclaw/openclaw` (not similarly named Docker Hub
images).

Common tags:

* `main` â€” latest build from `main`
* `<version>` â€” release tag builds (for example `2026.2.26`)
* `latest` â€” latest stable release tag

### Base image metadata

The main Docker image currently uses:

* `node:22-bookworm`

The docker image now publishes OCI base-image annotations (sha256 is an example,
and points at the pinned multi-arch manifest list for that tag):

* `org.opencontainers.image.base.name=docker.io/library/node:22-bookworm`
* `org.opencontainers.image.base.digest=sha256:b501c082306a4f528bc4038cbf2fbb58095d583d0419a259b2114b5ac53d12e9`
* `org.opencontainers.image.source=https://github.com/openclaw/openclaw`
* `org.opencontainers.image.url=https://openclaw.ai`
* `org.opencontainers.image.documentation=https://docs.openclaw.ai/install/docker`
* `org.opencontainers.image.licenses=MIT`
* `org.opencontainers.image.title=OpenClaw`
* `org.opencontainers.image.description=OpenClaw gateway and CLI runtime container image`
* `org.opencontainers.image.revision=<git-sha>`
* `org.opencontainers.image.version=<tag-or-main>`
* `org.opencontainers.image.created=<rfc3339 timestamp>`

Reference: [OCI image annotations](https://github.com/opencontainers/image-spec/blob/main/annotations.md)

Release context: this repository's tagged history already uses Bookworm in
`v2026.2.22` and earlier 2026 tags (for example `v2026.2.21`, `v2026.2.9`).

By default the setup script builds the image from source. To pull a pre-built
image instead, set `OPENCLAW_IMAGE` before running the script:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
./docker-setup.sh
```

The script detects that `OPENCLAW_IMAGE` is not the default `openclaw:local` and
runs `docker pull` instead of `docker build`. Everything else (onboarding,
gateway start, token generation) works the same way.

`docker-setup.sh` still runs from the repository root because it uses the local
`docker-compose.yml` and helper files. `OPENCLAW_IMAGE` skips local image build
time; it does not replace the compose/setup workflow.

### Shell Helpers (optional)

For easier day-to-day Docker management, install `ClawDock`:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p ~/.clawdock && curl -sL https://raw.githubusercontent.com/openclaw/openclaw/main/scripts/shell-helpers/clawdock-helpers.sh -o ~/.clawdock/clawdock-helpers.sh
```

**Add to your shell config (zsh):**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
echo 'source ~/.clawdock/clawdock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

Then use `clawdock-start`, `clawdock-stop`, `clawdock-dashboard`, etc. Run `clawdock-help` for all commands.

See [`ClawDock` Helper README](https://github.com/openclaw/openclaw/blob/main/scripts/shell-helpers/README.md) for details.

### Manual flow (compose)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker build -t openclaw:local -f Dockerfile .
docker compose run --rm openclaw-cli onboard
docker compose up -d openclaw-gateway
```

Note: run `docker compose ...` from the repo root. If you enabled
`OPENCLAW_EXTRA_MOUNTS` or `OPENCLAW_HOME_VOLUME`, the setup script writes
`docker-compose.extra.yml`; include it when running Compose elsewhere:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose -f docker-compose.yml -f docker-compose.extra.yml <command>
```

### Control UI token + pairing (Docker)

If you see â€œunauthorizedâ€ or â€œdisconnected (1008): pairing requiredâ€, fetch a
fresh dashboard link and approve the browser device:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli dashboard --no-open
docker compose run --rm openclaw-cli devices list
docker compose run --rm openclaw-cli devices approve <requestId>
```

More detail: [Dashboard](/web/dashboard), [Devices](/cli/devices).

### Extra mounts (optional)

If you want to mount additional host directories into the containers, set
`OPENCLAW_EXTRA_MOUNTS` before running `docker-setup.sh`. This accepts a
comma-separated list of Docker bind mounts and applies them to both
`openclaw-gateway` and `openclaw-cli` by generating `docker-compose.extra.yml`.

Example:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
```

Notes:

* Paths must be shared with Docker Desktop on macOS/Windows.
* Each entry must be `source:target[:options]` with no spaces, tabs, or newlines.
* If you edit `OPENCLAW_EXTRA_MOUNTS`, rerun `docker-setup.sh` to regenerate the
  extra compose file.
* `docker-compose.extra.yml` is generated. Donâ€™t hand-edit it.

### Persist the entire container home (optional)

If you want `/home/node` to persist across container recreation, set a named
volume via `OPENCLAW_HOME_VOLUME`. This creates a Docker volume and mounts it at
`/home/node`, while keeping the standard config/workspace bind mounts. Use a
named volume here (not a bind path); for bind mounts, use
`OPENCLAW_EXTRA_MOUNTS`.

Example:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_HOME_VOLUME="openclaw_home"
./docker-setup.sh
```

You can combine this with extra mounts:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_HOME_VOLUME="openclaw_home"
export OPENCLAW_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
```

Notes:

* Named volumes must match `^[A-Za-z0-9][A-Za-z0-9_.-]*$`.
* If you change `OPENCLAW_HOME_VOLUME`, rerun `docker-setup.sh` to regenerate the
  extra compose file.
* The named volume persists until removed with `docker volume rm <name>`.

### Install extra apt packages (optional)

If you need system packages inside the image (for example, build tools or media
libraries), set `OPENCLAW_DOCKER_APT_PACKAGES` before running `docker-setup.sh`.
This installs the packages during the image build, so they persist even if the
container is deleted.

Example:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_DOCKER_APT_PACKAGES="ffmpeg build-essential"
./docker-setup.sh
```

Notes:

* This accepts a space-separated list of apt package names.
* If you change `OPENCLAW_DOCKER_APT_PACKAGES`, rerun `docker-setup.sh` to rebuild
  the image.

### Pre-install extension dependencies (optional)

Extensions with their own `package.json` (e.g. `diagnostics-otel`, `matrix`,
`msteams`) install their npm dependencies on first load. To bake those
dependencies into the image instead, set `OPENCLAW_EXTENSIONS` before
running `docker-setup.sh`:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_EXTENSIONS="diagnostics-otel matrix"
./docker-setup.sh
```

Or when building directly:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker build --build-arg OPENCLAW_EXTENSIONS="diagnostics-otel matrix" .
```

Notes:

* This accepts a space-separated list of extension directory names (under `extensions/`).
* Only extensions with a `package.json` are affected; lightweight plugins without one are ignored.
* If you change `OPENCLAW_EXTENSIONS`, rerun `docker-setup.sh` to rebuild
  the image.

### Power-user / full-featured container (opt-in)

The default Docker image is **security-first** and runs as the non-root `node`
user. This keeps the attack surface small, but it means:

* no system package installs at runtime
* no Homebrew by default
* no bundled Chromium/Playwright browsers

If you want a more full-featured container, use these opt-in knobs:

1. **Persist `/home/node`** so browser downloads and tool caches survive:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_HOME_VOLUME="openclaw_home"
./docker-setup.sh
```

2. **Bake system deps into the image** (repeatable + persistent):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export OPENCLAW_DOCKER_APT_PACKAGES="git curl jq"
./docker-setup.sh
```

3. **Install Playwright browsers without `npx`** (avoids npm override conflicts):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

If you need Playwright to install system deps, rebuild the image with
`OPENCLAW_DOCKER_APT_PACKAGES` instead of using `--with-deps` at runtime.

4. **Persist Playwright browser downloads**:

* Set `PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright` in
  `docker-compose.yml`.
* Ensure `/home/node` persists via `OPENCLAW_HOME_VOLUME`, or mount
  `/home/node/.cache/ms-playwright` via `OPENCLAW_EXTRA_MOUNTS`.

### Permissions + EACCES

The image runs as `node` (uid 1000). If you see permission errors on
`/home/node/.openclaw`, make sure your host bind mounts are owned by uid 1000.

Example (Linux host):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo chown -R 1000:1000 /path/to/openclaw-config /path/to/openclaw-workspace
```

If you choose to run as root for convenience, you accept the security tradeoff.

### Faster rebuilds (recommended)

To speed up rebuilds, order your Dockerfile so dependency layers are cached.
This avoids re-running `pnpm install` unless lockfiles change:

```dockerfile  theme={"theme":{"light":"min-light","dark":"min-dark"}}
FROM node:22-bookworm

# Install Bun (required for build scripts)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN corepack enable

WORKDIR /app

# Cache dependencies unless package metadata changes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

### Channel setup (optional)

Use the CLI container to configure channels, then restart the gateway if needed.

WhatsApp (QR):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli channels login
```

Telegram (bot token):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli channels add --channel telegram --token "<token>"
```

Discord (bot token):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli channels add --channel discord --token "<token>"
```

Docs: [WhatsApp](/channels/whatsapp), [Telegram](/channels/telegram), [Discord](/channels/discord)

### OpenAI Codex OAuth (headless Docker)

If you pick OpenAI Codex OAuth in the wizard, it opens a browser URL and tries
to capture a callback on `http://127.0.0.1:1455/auth/callback`. In Docker or
headless setups that callback can show a browser error. Copy the full redirect
URL you land on and paste it back into the wizard to finish auth.

### Health checks

Container probe endpoints (no auth required):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsS http://127.0.0.1:18789/healthz
curl -fsS http://127.0.0.1:18789/readyz
```

Aliases: `/health` and `/ready`.

`/healthz` is a shallow liveness probe for "the gateway process is up".
`/readyz` stays ready during startup grace, then becomes `503` only if required
managed channels are still disconnected after grace or disconnect later.

The Docker image includes a built-in `HEALTHCHECK` that pings `/healthz` in the
background. In plain terms: Docker keeps checking if OpenClaw is still
responsive. If checks keep failing, Docker marks the container as `unhealthy`,
and orchestration systems (Docker Compose restart policy, Swarm, Kubernetes,
etc.) can automatically restart or replace it.

Authenticated deep health snapshot (gateway + channels):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose exec openclaw-gateway node dist/index.js health --token "$OPENCLAW_GATEWAY_TOKEN"
```

### E2E smoke test (Docker)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
scripts/e2e/onboard-docker.sh
```

### QR import smoke test (Docker)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
pnpm test:docker:qr
```

### LAN vs loopback (Docker Compose)

`docker-setup.sh` defaults `OPENCLAW_GATEWAY_BIND=lan` so host access to
`http://127.0.0.1:18789` works with Docker port publishing.

* `lan` (default): host browser + host CLI can reach the published gateway port.
* `loopback`: only processes inside the container network namespace can reach
  the gateway directly; host-published port access may fail.

The setup script also pins `gateway.mode=local` after onboarding so Docker CLI
commands default to local loopback targeting.

Legacy config note: use bind mode values in `gateway.bind` (`lan` / `loopback` /
`custom` / `tailnet` / `auto`), not host aliases (`0.0.0.0`, `127.0.0.1`,
`localhost`, `::`, `::1`).

If you see `Gateway target: ws://172.x.x.x:18789` or repeated `pairing required`
errors from Docker CLI commands, run:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli config set gateway.mode local
docker compose run --rm openclaw-cli config set gateway.bind lan
docker compose run --rm openclaw-cli devices list --url ws://127.0.0.1:18789
```

### Notes

* Gateway bind defaults to `lan` for container use (`OPENCLAW_GATEWAY_BIND`).
* Dockerfile CMD uses `--allow-unconfigured`; mounted config with `gateway.mode` not `local` will still start. Override CMD to enforce the guard.
* The gateway container is the source of truth for sessions (`~/.openclaw/agents/<agentId>/sessions/`).

### Storage model

* **Persistent host data:** Docker Compose bind-mounts `OPENCLAW_CONFIG_DIR` to `/home/node/.openclaw` and `OPENCLAW_WORKSPACE_DIR` to `/home/node/.openclaw/workspace`, so those paths survive container replacement.
* **Ephemeral sandbox tmpfs:** when `agents.defaults.sandbox` is enabled, the sandbox containers use `tmpfs` for `/tmp`, `/var/tmp`, and `/run`. Those mounts are separate from the top-level Compose stack and disappear with the sandbox container.
* **Disk growth hotspots:** watch `media/`, `agents/<agentId>/sessions/sessions.json`, transcript JSONL files, `cron/runs/*.jsonl`, and rolling file logs under `/tmp/openclaw/` (or your configured `logging.file`). If you also run the macOS app outside Docker, its service logs are separate again: `~/.openclaw/logs/gateway.log`, `~/.openclaw/logs/gateway.err.log`, and `/tmp/openclaw/openclaw-gateway.log`.

## Agent Sandbox (host gateway + Docker tools)

Deep dive: [Sandboxing](/gateway/sandboxing)

### What it does

When `agents.defaults.sandbox` is enabled, **non-main sessions** run tools inside a Docker
container. The gateway stays on your host, but the tool execution is isolated:

* scope: `"agent"` by default (one container + workspace per agent)
* scope: `"session"` for per-session isolation
* per-scope workspace folder mounted at `/workspace`
* optional agent workspace access (`agents.defaults.sandbox.workspaceAccess`)
* allow/deny tool policy (deny wins)
* inbound media is copied into the active sandbox workspace (`media/inbound/*`) so tools can read it (with `workspaceAccess: "rw"`, this lands in the agent workspace)

Warning: `scope: "shared"` disables cross-session isolation. All sessions share
one container and one workspace.

### Per-agent sandbox profiles (multi-agent)

If you use multi-agent routing, each agent can override sandbox + tool settings:
`agents.list[].sandbox` and `agents.list[].tools` (plus `agents.list[].tools.sandbox.tools`). This lets you run
mixed access levels in one gateway:

* Full access (personal agent)
* Read-only tools + read-only workspace (family/work agent)
* No filesystem/shell tools (public agent)

See [Multi-Agent Sandbox & Tools](/tools/multi-agent-sandbox-tools) for examples,
precedence, and troubleshooting.

### Default behavior

* Image: `openclaw-sandbox:bookworm-slim`
* One container per agent
* Agent workspace access: `workspaceAccess: "none"` (default) uses `~/.openclaw/sandboxes`
  * `"ro"` keeps the sandbox workspace at `/workspace` and mounts the agent workspace read-only at `/agent` (disables `write`/`edit`/`apply_patch`)
  * `"rw"` mounts the agent workspace read/write at `/workspace`
* Auto-prune: idle > 24h OR age > 7d
* Network: `none` by default (explicitly opt-in if you need egress)
  * `host` is blocked.
  * `container:<id>` is blocked by default (namespace-join risk).
* Default allow: `exec`, `process`, `read`, `write`, `edit`, `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
* Default deny: `browser`, `canvas`, `nodes`, `cron`, `discord`, `gateway`

### Enable sandboxing

If you plan to install packages in `setupCommand`, note:

* Default `docker.network` is `"none"` (no egress).
* `docker.network: "host"` is blocked.
* `docker.network: "container:<id>"` is blocked by default.
* Break-glass override: `agents.defaults.sandbox.docker.dangerouslyAllowContainerNamespaceJoin: true`.
* `readOnlyRoot: true` blocks package installs.
* `user` must be root for `apt-get` (omit `user` or set `user: "0:0"`).
  OpenClaw auto-recreates containers when `setupCommand` (or docker config) changes
  unless the container was **recently used** (within \~5 minutes). Hot containers
  log a warning with the exact `openclaw sandbox recreate ...` command.

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        scope: "agent", // session | agent | shared (agent is default)
        workspaceAccess: "none", // none | ro | rw
        workspaceRoot: "~/.openclaw/sandboxes",
        docker: {
          image: "openclaw-sandbox:bookworm-slim",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000",
          capDrop: ["ALL"],
          env: { LANG: "C.UTF-8" },
          setupCommand: "apt-get update && apt-get install -y git curl jq",
          pidsLimit: 256,
          memory: "1g",
          memorySwap: "2g",
          cpus: 1,
          ulimits: {
            nofile: { soft: 1024, hard: 2048 },
            nproc: 256,
          },
          seccompProfile: "/path/to/seccomp.json",
          apparmorProfile: "openclaw-sandbox",
          dns: ["1.1.1.1", "8.8.8.8"],
          extraHosts: ["internal.service:10.0.0.5"],
        },
        prune: {
          idleHours: 24, // 0 disables idle pruning
          maxAgeDays: 7, // 0 disables max-age pruning
        },
      },
    },
  },
  tools: {
    sandbox: {
      tools: {
        allow: [
          "exec",
          "process",
          "read",
          "write",
          "edit",
          "sessions_list",
          "sessions_history",
          "sessions_send",
          "sessions_spawn",
          "session_status",
        ],
        deny: ["browser", "canvas", "nodes", "cron", "discord", "gateway"],
      },
    },
  },
}
```

Hardening knobs live under `agents.defaults.sandbox.docker`:
`network`, `user`, `pidsLimit`, `memory`, `memorySwap`, `cpus`, `ulimits`,
`seccompProfile`, `apparmorProfile`, `dns`, `extraHosts`,
`dangerouslyAllowContainerNamespaceJoin` (break-glass only).

Multi-agent: override `agents.defaults.sandbox.{docker,browser,prune}.*` per agent via `agents.list[].sandbox.{docker,browser,prune}.*`
(ignored when `agents.defaults.sandbox.scope` / `agents.list[].sandbox.scope` is `"shared"`).

### Build the default sandbox image

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
scripts/sandbox-setup.sh
```

This builds `openclaw-sandbox:bookworm-slim` using `Dockerfile.sandbox`.

### Sandbox common image (optional)

If you want a sandbox image with common build tooling (Node, Go, Rust, etc.), build the common image:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
scripts/sandbox-common-setup.sh
```

This builds `openclaw-sandbox-common:bookworm-slim`. To use it:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      sandbox: { docker: { image: "openclaw-sandbox-common:bookworm-slim" } },
    },
  },
}
```

### Sandbox browser image

To run the browser tool inside the sandbox, build the browser image:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
scripts/sandbox-browser-setup.sh
```

This builds `openclaw-sandbox-browser:bookworm-slim` using
`Dockerfile.sandbox-browser`. The container runs Chromium with CDP enabled and
an optional noVNC observer (headful via Xvfb).

Notes:

* Headful (Xvfb) reduces bot blocking vs headless.
* Headless can still be used by setting `agents.defaults.sandbox.browser.headless=true`.
* No full desktop environment (GNOME) is needed; Xvfb provides the display.
* Browser containers default to a dedicated Docker network (`openclaw-sandbox-browser`) instead of global `bridge`.
* Optional `agents.defaults.sandbox.browser.cdpSourceRange` restricts container-edge CDP ingress by CIDR (for example `172.21.0.1/32`).
* noVNC observer access is password-protected by default; OpenClaw provides a short-lived observer token URL that serves a local bootstrap page and keeps the password in URL fragment (instead of URL query).
* Browser container startup defaults are conservative for shared/container workloads, including:
  * `--remote-debugging-address=127.0.0.1`
  * `--remote-debugging-port=<derived from OPENCLAW_BROWSER_CDP_PORT>`
  * `--user-data-dir=${HOME}/.chrome`
  * `--no-first-run`
  * `--no-default-browser-check`
  * `--disable-3d-apis`
  * `--disable-software-rasterizer`
  * `--disable-gpu`
  * `--disable-dev-shm-usage`
  * `--disable-background-networking`
  * `--disable-features=TranslateUI`
  * `--disable-breakpad`
  * `--disable-crash-reporter`
  * `--metrics-recording-only`
  * `--renderer-process-limit=2`
  * `--no-zygote`
  * `--disable-extensions`
  * If `agents.defaults.sandbox.browser.noSandbox` is set, `--no-sandbox` and
    `--disable-setuid-sandbox` are also appended.
  * The three graphics hardening flags above are optional. If your workload needs
    WebGL/3D, set `OPENCLAW_BROWSER_DISABLE_GRAPHICS_FLAGS=0` to run without
    `--disable-3d-apis`, `--disable-software-rasterizer`, and `--disable-gpu`.
  * Extension behavior is controlled by `--disable-extensions` and can be disabled
    (enables extensions) via `OPENCLAW_BROWSER_DISABLE_EXTENSIONS=0` for
    extension-dependent pages or extensions-heavy workflows.
  * `--renderer-process-limit=2` is also configurable with
    `OPENCLAW_BROWSER_RENDERER_PROCESS_LIMIT`; set `0` to let Chromium choose its
    default process limit when browser concurrency needs tuning.

Defaults are applied by default in the bundled image. If you need different
Chromium flags, use a custom browser image and provide your own entrypoint.

Use config:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      sandbox: {
        browser: { enabled: true },
      },
    },
  },
}
```

Custom browser image:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      sandbox: { browser: { image: "my-openclaw-browser" } },
    },
  },
}
```

When enabled, the agent receives:

* a sandbox browser control URL (for the `browser` tool)
* a noVNC URL (if enabled and headless=false)

Remember: if you use an allowlist for tools, add `browser` (and remove it from
deny) or the tool remains blocked.
Prune rules (`agents.defaults.sandbox.prune`) apply to browser containers too.

### Custom sandbox image

Build your own image and point config to it:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker build -t my-openclaw-sbx -f Dockerfile.sandbox .
```

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      sandbox: { docker: { image: "my-openclaw-sbx" } },
    },
  },
}
```

### Tool policy (allow/deny)

* `deny` wins over `allow`.
* If `allow` is empty: all tools (except deny) are available.
* If `allow` is non-empty: only tools in `allow` are available (minus deny).

### Pruning strategy

Two knobs:

* `prune.idleHours`: remove containers not used in X hours (0 = disable)
* `prune.maxAgeDays`: remove containers older than X days (0 = disable)

Example:

* Keep busy sessions but cap lifetime:
  `idleHours: 24`, `maxAgeDays: 7`
* Never prune:
  `idleHours: 0`, `maxAgeDays: 0`

### Security notes

* Hard wall only applies to **tools** (exec/read/write/edit/apply\_patch).
* Host-only tools like browser/camera/canvas are blocked by default.
* Allowing `browser` in sandbox **breaks isolation** (browser runs on host).

## Troubleshooting

* Image missing: build with [`scripts/sandbox-setup.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/sandbox-setup.sh) or set `agents.defaults.sandbox.docker.image`.
* Container not running: it will auto-create per session on demand.
* Permission errors in sandbox: set `docker.user` to a UID:GID that matches your
  mounted workspace ownership (or chown the workspace folder).
* Custom tools not found: OpenClaw runs commands with `sh -lc` (login shell), which
  sources `/etc/profile` and may reset PATH. Set `docker.env.PATH` to prepend your
  custom tool paths (e.g., `/custom/bin:/usr/local/share/npm-global/bin`), or add
  a script under `/etc/profile.d/` in your Dockerfile.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/exe-dev.md`

Source URL: https://docs.openclaw.ai/install/exe-dev.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# exe.dev

# exe.dev

Goal: OpenClaw Gateway running on an exe.dev VM, reachable from your laptop via: `https://<vm-name>.exe.xyz`

This page assumes exe.dev's default **exeuntu** image. If you picked a different distro, map packages accordingly.

## Beginner quick path

1. [https://exe.new/openclaw](https://exe.new/openclaw)
2. Fill in your auth key/token as needed
3. Click on "Agent" next to your VM, and wait...
4. ???
5. Profit

## What you need

* exe.dev account
* `ssh exe.dev` access to [exe.dev](https://exe.dev) virtual machines (optional)

## Automated Install with Shelley

Shelley, [exe.dev](https://exe.dev)'s agent, can install OpenClaw instantly with our
prompt. The prompt used is as below:

```
Set up OpenClaw (https://docs.openclaw.ai/install) on this VM. Use the non-interactive and accept-risk flags for openclaw onboarding. Add the supplied auth or token as needed. Configure nginx to forward from the default port 18789 to the root location on the default enabled site config, making sure to enable Websocket support. Pairing is done by "openclaw devices list" and "openclaw devices approve <request id>". Make sure the dashboard shows that OpenClaw's health is OK. exe.dev handles forwarding from port 8000 to port 80/443 and HTTPS for us, so the final "reachable" should be <vm-name>.exe.xyz, without port specification.
```

## Manual installation

## 1) Create the VM

From your device:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh exe.dev new
```

Then connect:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh <vm-name>.exe.xyz
```

Tip: keep this VM **stateful**. OpenClaw stores state under `~/.openclaw/` and `~/.openclaw/workspace/`.

## 2) Install prerequisites (on the VM)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo apt-get update
sudo apt-get install -y git curl jq ca-certificates openssl
```

## 3) Install OpenClaw

Run the OpenClaw install script:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://openclaw.ai/install.sh | bash
```

## 4) Setup nginx to proxy OpenClaw to port 8000

Edit `/etc/nginx/sites-enabled/default` with

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 8000;
    listen [::]:8000;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings for long-lived connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

## 5) Access OpenClaw and grant privileges

Access `https://<vm-name>.exe.xyz/` (see the Control UI output from onboarding). If it prompts for auth, paste the
token from `gateway.auth.token` on the VM (retrieve with `openclaw config get gateway.auth.token`, or generate one
with `openclaw doctor --generate-gateway-token`). Approve devices with `openclaw devices list` and
`openclaw devices approve <requestId>`. When in doubt, use Shelley from your browser!

## Remote Access

Remote access is handled by [exe.dev](https://exe.dev)'s authentication. By
default, HTTP traffic from port 8000 is forwarded to `https://<vm-name>.exe.xyz`
with email auth.

## Updating

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm i -g openclaw@latest
openclaw doctor
openclaw gateway restart
openclaw health
```

Guide: [Updating](/install/updating)


Built with [Mintlify](https://mintlify.com).

---

## File: `install/fly.md`

Source URL: https://docs.openclaw.ai/install/fly.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Fly.io

> Deploy OpenClaw on Fly.io

# Fly.io Deployment

**Goal:** OpenClaw Gateway running on a [Fly.io](https://fly.io) machine with persistent storage, automatic HTTPS, and Discord/channel access.

## What you need

* [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
* Fly.io account (free tier works)
* Model auth: API key for your chosen model provider
* Channel credentials: Discord bot token, Telegram token, etc.

## Beginner quick path

1. Clone repo â†’ customize `fly.toml`
2. Create app + volume â†’ set secrets
3. Deploy with `fly deploy`
4. SSH in to create config or use Control UI

## 1) Create the Fly app

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Clone the repo
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Create a new Fly app (pick your own name)
fly apps create my-openclaw

# Create a persistent volume (1GB is usually enough)
fly volumes create openclaw_data --size 1 --region iad
```

**Tip:** Choose a region close to you. Common options: `lhr` (London), `iad` (Virginia), `sjc` (San Jose).

## 2) Configure fly.toml

Edit `fly.toml` to match your app name and requirements.

**Security note:** The default config exposes a public URL. For a hardened deployment with no public IP, see [Private Deployment](#private-deployment-hardened) or use `fly.private.toml`.

```toml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
app = "my-openclaw"  # Your app name
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  OPENCLAW_PREFER_PNPM = "1"
  OPENCLAW_STATE_DIR = "/data"
  NODE_OPTIONS = "--max-old-space-size=1536"

[processes]
  app = "node dist/index.js gateway --allow-unconfigured --port 3000 --bind lan"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  size = "shared-cpu-2x"
  memory = "2048mb"

[mounts]
  source = "openclaw_data"
  destination = "/data"
```

**Key settings:**

| Setting                        | Why                                                                         |
| ------------------------------ | --------------------------------------------------------------------------- |
| `--bind lan`                   | Binds to `0.0.0.0` so Fly's proxy can reach the gateway                     |
| `--allow-unconfigured`         | Starts without a config file (you'll create one after)                      |
| `internal_port = 3000`         | Must match `--port 3000` (or `OPENCLAW_GATEWAY_PORT`) for Fly health checks |
| `memory = "2048mb"`            | 512MB is too small; 2GB recommended                                         |
| `OPENCLAW_STATE_DIR = "/data"` | Persists state on the volume                                                |

## 3) Set secrets

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Required: Gateway token (for non-loopback binding)
fly secrets set OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)

# Model provider API keys
fly secrets set ANTHROPIC_API_KEY=sk-ant-...

# Optional: Other providers
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set GOOGLE_API_KEY=...

# Channel tokens
fly secrets set DISCORD_BOT_TOKEN=MTQ...
```

**Notes:**

* Non-loopback binds (`--bind lan`) require `OPENCLAW_GATEWAY_TOKEN` for security.
* Treat these tokens like passwords.
* **Prefer env vars over config file** for all API keys and tokens. This keeps secrets out of `openclaw.json` where they could be accidentally exposed or logged.

## 4) Deploy

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly deploy
```

First deploy builds the Docker image (\~2-3 minutes). Subsequent deploys are faster.

After deployment, verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly status
fly logs
```

You should see:

```
[gateway] listening on ws://0.0.0.0:3000 (PID xxx)
[discord] logged in to discord as xxx
```

## 5) Create config file

SSH into the machine to create a proper config:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console
```

Create the config directory and file:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p /data
cat > /data/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-6",
        "fallbacks": ["anthropic/claude-sonnet-4-5", "openai/gpt-4o"]
      },
      "maxConcurrent": 4
    },
    "list": [
      {
        "id": "main",
        "default": true
      }
    ]
  },
  "auth": {
    "profiles": {
      "anthropic:default": { "mode": "token", "provider": "anthropic" },
      "openai:default": { "mode": "token", "provider": "openai" }
    }
  },
  "bindings": [
    {
      "agentId": "main",
      "match": { "channel": "discord" }
    }
  ],
  "channels": {
    "discord": {
      "enabled": true,
      "groupPolicy": "allowlist",
      "guilds": {
        "YOUR_GUILD_ID": {
          "channels": { "general": { "allow": true } },
          "requireMention": false
        }
      }
    }
  },
  "gateway": {
    "mode": "local",
    "bind": "auto"
  },
  "meta": {
    "lastTouchedVersion": "2026.1.29"
  }
}
EOF
```

**Note:** With `OPENCLAW_STATE_DIR=/data`, the config path is `/data/openclaw.json`.

**Note:** The Discord token can come from either:

* Environment variable: `DISCORD_BOT_TOKEN` (recommended for secrets)
* Config file: `channels.discord.token`

If using env var, no need to add token to config. The gateway reads `DISCORD_BOT_TOKEN` automatically.

Restart to apply:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
exit
fly machine restart <machine-id>
```

## 6) Access the Gateway

### Control UI

Open in browser:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly open
```

Or visit `https://my-openclaw.fly.dev/`

Paste your gateway token (the one from `OPENCLAW_GATEWAY_TOKEN`) to authenticate.

### Logs

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly logs              # Live logs
fly logs --no-tail    # Recent logs
```

### SSH Console

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console
```

## Troubleshooting

### "App is not listening on expected address"

The gateway is binding to `127.0.0.1` instead of `0.0.0.0`.

**Fix:** Add `--bind lan` to your process command in `fly.toml`.

### Health checks failing / connection refused

Fly can't reach the gateway on the configured port.

**Fix:** Ensure `internal_port` matches the gateway port (set `--port 3000` or `OPENCLAW_GATEWAY_PORT=3000`).

### OOM / Memory Issues

Container keeps restarting or getting killed. Signs: `SIGABRT`, `v8::internal::Runtime_AllocateInYoungGeneration`, or silent restarts.

**Fix:** Increase memory in `fly.toml`:

```toml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
[[vm]]
  memory = "2048mb"
```

Or update an existing machine:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly machine update <machine-id> --vm-memory 2048 -y
```

**Note:** 512MB is too small. 1GB may work but can OOM under load or with verbose logging. **2GB is recommended.**

### Gateway Lock Issues

Gateway refuses to start with "already running" errors.

This happens when the container restarts but the PID lock file persists on the volume.

**Fix:** Delete the lock file:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console --command "rm -f /data/gateway.*.lock"
fly machine restart <machine-id>
```

The lock file is at `/data/gateway.*.lock` (not in a subdirectory).

### Config Not Being Read

If using `--allow-unconfigured`, the gateway creates a minimal config. Your custom config at `/data/openclaw.json` should be read on restart.

Verify the config exists:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console --command "cat /data/openclaw.json"
```

### Writing Config via SSH

The `fly ssh console -C` command doesn't support shell redirection. To write a config file:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Use echo + tee (pipe from local to remote)
echo '{"your":"config"}' | fly ssh console -C "tee /data/openclaw.json"

# Or use sftp
fly sftp shell
> put /local/path/config.json /data/openclaw.json
```

**Note:** `fly sftp` may fail if the file already exists. Delete first:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console --command "rm /data/openclaw.json"
```

### State Not Persisting

If you lose credentials or sessions after a restart, the state dir is writing to the container filesystem.

**Fix:** Ensure `OPENCLAW_STATE_DIR=/data` is set in `fly.toml` and redeploy.

## Updates

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Pull latest changes
git pull

# Redeploy
fly deploy

# Check health
fly status
fly logs
```

### Updating Machine Command

If you need to change the startup command without a full redeploy:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Get machine ID
fly machines list

# Update command
fly machine update <machine-id> --command "node dist/index.js gateway --port 3000 --bind lan" -y

# Or with memory increase
fly machine update <machine-id> --vm-memory 2048 --command "node dist/index.js gateway --port 3000 --bind lan" -y
```

**Note:** After `fly deploy`, the machine command may reset to what's in `fly.toml`. If you made manual changes, re-apply them after deploy.

## Private Deployment (Hardened)

By default, Fly allocates public IPs, making your gateway accessible at `https://your-app.fly.dev`. This is convenient but means your deployment is discoverable by internet scanners (Shodan, Censys, etc.).

For a hardened deployment with **no public exposure**, use the private template.

### When to use private deployment

* You only make **outbound** calls/messages (no inbound webhooks)
* You use **ngrok or Tailscale** tunnels for any webhook callbacks
* You access the gateway via **SSH, proxy, or WireGuard** instead of browser
* You want the deployment **hidden from internet scanners**

### Setup

Use `fly.private.toml` instead of the standard config:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Deploy with private config
fly deploy -c fly.private.toml
```

Or convert an existing deployment:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# List current IPs
fly ips list -a my-openclaw

# Release public IPs
fly ips release <public-ipv4> -a my-openclaw
fly ips release <public-ipv6> -a my-openclaw

# Switch to private config so future deploys don't re-allocate public IPs
# (remove [http_service] or deploy with the private template)
fly deploy -c fly.private.toml

# Allocate private-only IPv6
fly ips allocate-v6 --private -a my-openclaw
```

After this, `fly ips list` should show only a `private` type IP:

```
VERSION  IP                   TYPE             REGION
v6       fdaa:x:x:x:x::x      private          global
```

### Accessing a private deployment

Since there's no public URL, use one of these methods:

**Option 1: Local proxy (simplest)**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Forward local port 3000 to the app
fly proxy 3000:3000 -a my-openclaw

# Then open http://localhost:3000 in browser
```

**Option 2: WireGuard VPN**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Create WireGuard config (one-time)
fly wireguard create

# Import to WireGuard client, then access via internal IPv6
# Example: http://[fdaa:x:x:x:x::x]:3000
```

**Option 3: SSH only**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fly ssh console -a my-openclaw
```

### Webhooks with private deployment

If you need webhook callbacks (Twilio, Telnyx, etc.) without public exposure:

1. **ngrok tunnel** - Run ngrok inside the container or as a sidecar
2. **Tailscale Funnel** - Expose specific paths via Tailscale
3. **Outbound-only** - Some providers (Twilio) work fine for outbound calls without webhooks

Example voice-call config with ngrok:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "plugins": {
    "entries": {
      "voice-call": {
        "enabled": true,
        "config": {
          "provider": "twilio",
          "tunnel": { "provider": "ngrok" },
          "webhookSecurity": {
            "allowedHosts": ["example.ngrok.app"]
          }
        }
      }
    }
  }
}
```

The ngrok tunnel runs inside the container and provides a public webhook URL without exposing the Fly app itself. Set `webhookSecurity.allowedHosts` to the public tunnel hostname so forwarded host headers are accepted.

### Security benefits

| Aspect            | Public       | Private    |
| ----------------- | ------------ | ---------- |
| Internet scanners | Discoverable | Hidden     |
| Direct attacks    | Possible     | Blocked    |
| Control UI access | Browser      | Proxy/VPN  |
| Webhook delivery  | Direct       | Via tunnel |

## Notes

* Fly.io uses **x86 architecture** (not ARM)
* The Dockerfile is compatible with both architectures
* For WhatsApp/Telegram onboarding, use `fly ssh console`
* Persistent data lives on the volume at `/data`
* Signal requires Java + signal-cli; use a custom image and keep memory at 2GB+.

## Cost

With the recommended config (`shared-cpu-2x`, 2GB RAM):

* \~\$10-15/month depending on usage
* Free tier includes some allowance

See [Fly.io pricing](https://fly.io/docs/about/pricing/) for details.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/gcp.md`

Source URL: https://docs.openclaw.ai/install/gcp.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# GCP

# OpenClaw on GCP Compute Engine (Docker, Production VPS Guide)

## Goal

Run a persistent OpenClaw Gateway on a GCP Compute Engine VM using Docker, with durable state, baked-in binaries, and safe restart behavior.

If you want "OpenClaw 24/7 for \~\$5-12/mo", this is a reliable setup on Google Cloud.
Pricing varies by machine type and region; pick the smallest VM that fits your workload and scale up if you hit OOMs.

## What are we doing (simple terms)?

* Create a GCP project and enable billing
* Create a Compute Engine VM
* Install Docker (isolated app runtime)
* Start the OpenClaw Gateway in Docker
* Persist `~/.openclaw` + `~/.openclaw/workspace` on the host (survives restarts/rebuilds)
* Access the Control UI from your laptop via an SSH tunnel

The Gateway can be accessed via:

* SSH port forwarding from your laptop
* Direct port exposure if you manage firewalling and tokens yourself

This guide uses Debian on GCP Compute Engine.
Ubuntu also works; map packages accordingly.
For the generic Docker flow, see [Docker](/install/docker).

***

## Quick path (experienced operators)

1. Create GCP project + enable Compute Engine API
2. Create Compute Engine VM (e2-small, Debian 12, 20GB)
3. SSH into the VM
4. Install Docker
5. Clone OpenClaw repository
6. Create persistent host directories
7. Configure `.env` and `docker-compose.yml`
8. Bake required binaries, build, and launch

***

## What you need

* GCP account (free tier eligible for e2-micro)
* gcloud CLI installed (or use Cloud Console)
* SSH access from your laptop
* Basic comfort with SSH + copy/paste
* \~20-30 minutes
* Docker and Docker Compose
* Model auth credentials
* Optional provider credentials
  * WhatsApp QR
  * Telegram bot token
  * Gmail OAuth

***

## 1) Install gcloud CLI (or use Console)

**Option A: gcloud CLI** (recommended for automation)

Install from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)

Initialize and authenticate:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud init
gcloud auth login
```

**Option B: Cloud Console**

All steps can be done via the web UI at [https://console.cloud.google.com](https://console.cloud.google.com)

***

## 2) Create a GCP project

**CLI:**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud projects create my-openclaw-project --name="OpenClaw Gateway"
gcloud config set project my-openclaw-project
```

Enable billing at [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing) (required for Compute Engine).

Enable the Compute Engine API:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud services enable compute.googleapis.com
```

**Console:**

1. Go to IAM & Admin > Create Project
2. Name it and create
3. Enable billing for the project
4. Navigate to APIs & Services > Enable APIs > search "Compute Engine API" > Enable

***

## 3) Create the VM

**Machine types:**

| Type      | Specs                    | Cost               | Notes                                        |
| --------- | ------------------------ | ------------------ | -------------------------------------------- |
| e2-medium | 2 vCPU, 4GB RAM          | \~\$25/mo          | Most reliable for local Docker builds        |
| e2-small  | 2 vCPU, 2GB RAM          | \~\$12/mo          | Minimum recommended for Docker build         |
| e2-micro  | 2 vCPU (shared), 1GB RAM | Free tier eligible | Often fails with Docker build OOM (exit 137) |

**CLI:**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud compute instances create openclaw-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small \
  --boot-disk-size=20GB \
  --image-family=debian-12 \
  --image-project=debian-cloud
```

**Console:**

1. Go to Compute Engine > VM instances > Create instance
2. Name: `openclaw-gateway`
3. Region: `us-central1`, Zone: `us-central1-a`
4. Machine type: `e2-small`
5. Boot disk: Debian 12, 20GB
6. Create

***

## 4) SSH into the VM

**CLI:**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud compute ssh openclaw-gateway --zone=us-central1-a
```

**Console:**

Click the "SSH" button next to your VM in the Compute Engine dashboard.

Note: SSH key propagation can take 1-2 minutes after VM creation. If connection is refused, wait and retry.

***

## 5) Install Docker (on the VM)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo apt-get update
sudo apt-get install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in for the group change to take effect:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
exit
```

Then SSH back in:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud compute ssh openclaw-gateway --zone=us-central1-a
```

Verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker --version
docker compose version
```

***

## 6) Clone the OpenClaw repository

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

This guide assumes you will build a custom image to guarantee binary persistence.

***

## 7) Create persistent host directories

Docker containers are ephemeral.
All long-lived state must live on the host.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p ~/.openclaw
mkdir -p ~/.openclaw/workspace
```

***

## 8) Configure environment variables

Create `.env` in the repository root.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
OPENCLAW_IMAGE=openclaw:latest
OPENCLAW_GATEWAY_TOKEN=change-me-now
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_PORT=18789

OPENCLAW_CONFIG_DIR=/home/$USER/.openclaw
OPENCLAW_WORKSPACE_DIR=/home/$USER/.openclaw/workspace

GOG_KEYRING_PASSWORD=change-me-now
XDG_CONFIG_HOME=/home/node/.openclaw
```

Generate strong secrets:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openssl rand -hex 32
```

**Do not commit this file.**

***

## 9) Docker Compose configuration

Create or update `docker-compose.yml`.

```yaml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
services:
  openclaw-gateway:
    image: ${OPENCLAW_IMAGE}
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - OPENCLAW_GATEWAY_BIND=${OPENCLAW_GATEWAY_BIND}
      - OPENCLAW_GATEWAY_PORT=${OPENCLAW_GATEWAY_PORT}
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
      - GOG_KEYRING_PASSWORD=${GOG_KEYRING_PASSWORD}
      - XDG_CONFIG_HOME=${XDG_CONFIG_HOME}
      - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    volumes:
      - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    ports:
      # Recommended: keep the Gateway loopback-only on the VM; access via SSH tunnel.
      # To expose it publicly, remove the `127.0.0.1:` prefix and firewall accordingly.
      - "127.0.0.1:${OPENCLAW_GATEWAY_PORT}:18789"
    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "${OPENCLAW_GATEWAY_BIND}",
        "--port",
        "${OPENCLAW_GATEWAY_PORT}",
      ]
```

***

## 10) Bake required binaries into the image (critical)

Installing binaries inside a running container is a trap.
Anything installed at runtime will be lost on restart.

All external binaries required by skills must be installed at image build time.

The examples below show three common binaries only:

* `gog` for Gmail access
* `goplaces` for Google Places
* `wacli` for WhatsApp

These are examples, not a complete list.
You may install as many binaries as needed using the same pattern.

If you add new skills later that depend on additional binaries, you must:

1. Update the Dockerfile
2. Rebuild the image
3. Restart the containers

**Example Dockerfile**

```dockerfile  theme={"theme":{"light":"min-light","dark":"min-dark"}}
FROM node:22-bookworm

RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# Example binary 1: Gmail CLI
RUN curl -L https://github.com/steipete/gog/releases/latest/download/gog_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/gog

# Example binary 2: Google Places CLI
RUN curl -L https://github.com/steipete/goplaces/releases/latest/download/goplaces_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/goplaces

# Example binary 3: WhatsApp CLI
RUN curl -L https://github.com/steipete/wacli/releases/latest/download/wacli_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/wacli

# Add more binaries below using the same pattern

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

***

## 11) Build and launch

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose build
docker compose up -d openclaw-gateway
```

If build fails with `Killed` / `exit code 137` during `pnpm install --frozen-lockfile`, the VM is out of memory. Use `e2-small` minimum, or `e2-medium` for more reliable first builds.

When binding to LAN (`OPENCLAW_GATEWAY_BIND=lan`), configure a trusted browser origin before continuing:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli config set gateway.controlUi.allowedOrigins '["http://127.0.0.1:18789"]' --strict-json
```

If you changed the gateway port, replace `18789` with your configured port.

Verify binaries:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose exec openclaw-gateway which gog
docker compose exec openclaw-gateway which goplaces
docker compose exec openclaw-gateway which wacli
```

Expected output:

```
/usr/local/bin/gog
/usr/local/bin/goplaces
/usr/local/bin/wacli
```

***

## 12) Verify Gateway

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose logs -f openclaw-gateway
```

Success:

```
[gateway] listening on ws://0.0.0.0:18789
```

***

## 13) Access from your laptop

Create an SSH tunnel to forward the Gateway port:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud compute ssh openclaw-gateway --zone=us-central1-a -- -L 18789:127.0.0.1:18789
```

Open in your browser:

`http://127.0.0.1:18789/`

Fetch a fresh tokenized dashboard link:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli dashboard --no-open
```

Paste the token from that URL.

If Control UI shows `unauthorized` or `disconnected (1008): pairing required`, approve the browser device:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose run --rm openclaw-cli devices list
docker compose run --rm openclaw-cli devices approve <requestId>
```

***

## What persists where (source of truth)

OpenClaw runs in Docker, but Docker is not the source of truth.
All long-lived state must survive restarts, rebuilds, and reboots.

| Component           | Location                          | Persistence mechanism  | Notes                            |
| ------------------- | --------------------------------- | ---------------------- | -------------------------------- |
| Gateway config      | `/home/node/.openclaw/`           | Host volume mount      | Includes `openclaw.json`, tokens |
| Model auth profiles | `/home/node/.openclaw/`           | Host volume mount      | OAuth tokens, API keys           |
| Skill configs       | `/home/node/.openclaw/skills/`    | Host volume mount      | Skill-level state                |
| Agent workspace     | `/home/node/.openclaw/workspace/` | Host volume mount      | Code and agent artifacts         |
| WhatsApp session    | `/home/node/.openclaw/`           | Host volume mount      | Preserves QR login               |
| Gmail keyring       | `/home/node/.openclaw/`           | Host volume + password | Requires `GOG_KEYRING_PASSWORD`  |
| External binaries   | `/usr/local/bin/`                 | Docker image           | Must be baked at build time      |
| Node runtime        | Container filesystem              | Docker image           | Rebuilt every image build        |
| OS packages         | Container filesystem              | Docker image           | Do not install at runtime        |
| Docker container    | Ephemeral                         | Restartable            | Safe to destroy                  |

***

## Updates

To update OpenClaw on the VM:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cd ~/openclaw
git pull
docker compose build
docker compose up -d
```

***

## Troubleshooting

**SSH connection refused**

SSH key propagation can take 1-2 minutes after VM creation. Wait and retry.

**OS Login issues**

Check your OS Login profile:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud compute os-login describe-profile
```

Ensure your account has the required IAM permissions (Compute OS Login or Compute OS Admin Login).

**Out of memory (OOM)**

If Docker build fails with `Killed` and `exit code 137`, the VM was OOM-killed. Upgrade to e2-small (minimum) or e2-medium (recommended for reliable local builds):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Stop the VM first
gcloud compute instances stop openclaw-gateway --zone=us-central1-a

# Change machine type
gcloud compute instances set-machine-type openclaw-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small

# Start the VM
gcloud compute instances start openclaw-gateway --zone=us-central1-a
```

***

## Service accounts (security best practice)

For personal use, your default user account works fine.

For automation or CI/CD pipelines, create a dedicated service account with minimal permissions:

1. Create a service account:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   gcloud iam service-accounts create openclaw-deploy \
     --display-name="OpenClaw Deployment"
   ```

2. Grant Compute Instance Admin role (or narrower custom role):

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   gcloud projects add-iam-policy-binding my-openclaw-project \
     --member="serviceAccount:openclaw-deploy@my-openclaw-project.iam.gserviceaccount.com" \
     --role="roles/compute.instanceAdmin.v1"
   ```

Avoid using the Owner role for automation. Use the principle of least privilege.

See [https://cloud.google.com/iam/docs/understanding-roles](https://cloud.google.com/iam/docs/understanding-roles) for IAM role details.

***

## Next steps

* Set up messaging channels: [Channels](/channels)
* Pair local devices as nodes: [Nodes](/nodes)
* Configure the Gateway: [Gateway configuration](/gateway/configuration)


Built with [Mintlify](https://mintlify.com).

---

## File: `install/hetzner.md`

Source URL: https://docs.openclaw.ai/install/hetzner.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Hetzner

# OpenClaw on Hetzner (Docker, Production VPS Guide)

## Goal

Run a persistent OpenClaw Gateway on a Hetzner VPS using Docker, with durable state, baked-in binaries, and safe restart behavior.

If you want â€œOpenClaw 24/7 for \~\$5â€, this is the simplest reliable setup.
Hetzner pricing changes; pick the smallest Debian/Ubuntu VPS and scale up if you hit OOMs.

Security model reminder:

* Company-shared agents are fine when everyone is in the same trust boundary and the runtime is business-only.
* Keep strict separation: dedicated VPS/runtime + dedicated accounts; no personal Apple/Google/browser/password-manager profiles on that host.
* If users are adversarial to each other, split by gateway/host/OS user.

See [Security](/gateway/security) and [VPS hosting](/vps).

## What are we doing (simple terms)?

* Rent a small Linux server (Hetzner VPS)
* Install Docker (isolated app runtime)
* Start the OpenClaw Gateway in Docker
* Persist `~/.openclaw` + `~/.openclaw/workspace` on the host (survives restarts/rebuilds)
* Access the Control UI from your laptop via an SSH tunnel

The Gateway can be accessed via:

* SSH port forwarding from your laptop
* Direct port exposure if you manage firewalling and tokens yourself

This guide assumes Ubuntu or Debian on Hetzner.\
If you are on another Linux VPS, map packages accordingly.
For the generic Docker flow, see [Docker](/install/docker).

***

## Quick path (experienced operators)

1. Provision Hetzner VPS
2. Install Docker
3. Clone OpenClaw repository
4. Create persistent host directories
5. Configure `.env` and `docker-compose.yml`
6. Bake required binaries into the image
7. `docker compose up -d`
8. Verify persistence and Gateway access

***

## What you need

* Hetzner VPS with root access
* SSH access from your laptop
* Basic comfort with SSH + copy/paste
* \~20 minutes
* Docker and Docker Compose
* Model auth credentials
* Optional provider credentials
  * WhatsApp QR
  * Telegram bot token
  * Gmail OAuth

***

## 1) Provision the VPS

Create an Ubuntu or Debian VPS in Hetzner.

Connect as root:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh root@YOUR_VPS_IP
```

This guide assumes the VPS is stateful.
Do not treat it as disposable infrastructure.

***

## 2) Install Docker (on the VPS)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
apt-get update
apt-get install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sh
```

Verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker --version
docker compose version
```

***

## 3) Clone the OpenClaw repository

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

This guide assumes you will build a custom image to guarantee binary persistence.

***

## 4) Create persistent host directories

Docker containers are ephemeral.
All long-lived state must live on the host.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p /root/.openclaw/workspace

# Set ownership to the container user (uid 1000):
chown -R 1000:1000 /root/.openclaw
```

***

## 5) Configure environment variables

Create `.env` in the repository root.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
OPENCLAW_IMAGE=openclaw:latest
OPENCLAW_GATEWAY_TOKEN=change-me-now
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_PORT=18789

OPENCLAW_CONFIG_DIR=/root/.openclaw
OPENCLAW_WORKSPACE_DIR=/root/.openclaw/workspace

GOG_KEYRING_PASSWORD=change-me-now
XDG_CONFIG_HOME=/home/node/.openclaw
```

Generate strong secrets:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openssl rand -hex 32
```

**Do not commit this file.**

***

## 6) Docker Compose configuration

Create or update `docker-compose.yml`.

```yaml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
services:
  openclaw-gateway:
    image: ${OPENCLAW_IMAGE}
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - OPENCLAW_GATEWAY_BIND=${OPENCLAW_GATEWAY_BIND}
      - OPENCLAW_GATEWAY_PORT=${OPENCLAW_GATEWAY_PORT}
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
      - GOG_KEYRING_PASSWORD=${GOG_KEYRING_PASSWORD}
      - XDG_CONFIG_HOME=${XDG_CONFIG_HOME}
      - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    volumes:
      - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    ports:
      # Recommended: keep the Gateway loopback-only on the VPS; access via SSH tunnel.
      # To expose it publicly, remove the `127.0.0.1:` prefix and firewall accordingly.
      - "127.0.0.1:${OPENCLAW_GATEWAY_PORT}:18789"
    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "${OPENCLAW_GATEWAY_BIND}",
        "--port",
        "${OPENCLAW_GATEWAY_PORT}",
        "--allow-unconfigured",
      ]
```

`--allow-unconfigured` is only for bootstrap convenience, it is not a replacement for a proper gateway configuration. Still set auth (`gateway.auth.token` or password) and use safe bind settings for your deployment.

***

## 7) Bake required binaries into the image (critical)

Installing binaries inside a running container is a trap.
Anything installed at runtime will be lost on restart.

All external binaries required by skills must be installed at image build time.

The examples below show three common binaries only:

* `gog` for Gmail access
* `goplaces` for Google Places
* `wacli` for WhatsApp

These are examples, not a complete list.
You may install as many binaries as needed using the same pattern.

If you add new skills later that depend on additional binaries, you must:

1. Update the Dockerfile
2. Rebuild the image
3. Restart the containers

**Example Dockerfile**

```dockerfile  theme={"theme":{"light":"min-light","dark":"min-dark"}}
FROM node:22-bookworm

RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# Example binary 1: Gmail CLI
RUN curl -L https://github.com/steipete/gog/releases/latest/download/gog_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/gog

# Example binary 2: Google Places CLI
RUN curl -L https://github.com/steipete/goplaces/releases/latest/download/goplaces_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/goplaces

# Example binary 3: WhatsApp CLI
RUN curl -L https://github.com/steipete/wacli/releases/latest/download/wacli_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/wacli

# Add more binaries below using the same pattern

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

***

## 8) Build and launch

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose build
docker compose up -d openclaw-gateway
```

Verify binaries:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose exec openclaw-gateway which gog
docker compose exec openclaw-gateway which goplaces
docker compose exec openclaw-gateway which wacli
```

Expected output:

```
/usr/local/bin/gog
/usr/local/bin/goplaces
/usr/local/bin/wacli
```

***

## 9) Verify Gateway

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
docker compose logs -f openclaw-gateway
```

Success:

```
[gateway] listening on ws://0.0.0.0:18789
```

From your laptop:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh -N -L 18789:127.0.0.1:18789 root@YOUR_VPS_IP
```

Open:

`http://127.0.0.1:18789/`

Paste your gateway token.

***

## What persists where (source of truth)

OpenClaw runs in Docker, but Docker is not the source of truth.
All long-lived state must survive restarts, rebuilds, and reboots.

| Component           | Location                          | Persistence mechanism  | Notes                            |
| ------------------- | --------------------------------- | ---------------------- | -------------------------------- |
| Gateway config      | `/home/node/.openclaw/`           | Host volume mount      | Includes `openclaw.json`, tokens |
| Model auth profiles | `/home/node/.openclaw/`           | Host volume mount      | OAuth tokens, API keys           |
| Skill configs       | `/home/node/.openclaw/skills/`    | Host volume mount      | Skill-level state                |
| Agent workspace     | `/home/node/.openclaw/workspace/` | Host volume mount      | Code and agent artifacts         |
| WhatsApp session    | `/home/node/.openclaw/`           | Host volume mount      | Preserves QR login               |
| Gmail keyring       | `/home/node/.openclaw/`           | Host volume + password | Requires `GOG_KEYRING_PASSWORD`  |
| External binaries   | `/usr/local/bin/`                 | Docker image           | Must be baked at build time      |
| Node runtime        | Container filesystem              | Docker image           | Rebuilt every image build        |
| OS packages         | Container filesystem              | Docker image           | Do not install at runtime        |
| Docker container    | Ephemeral                         | Restartable            | Safe to destroy                  |

***

## Infrastructure as Code (Terraform)

For teams preferring infrastructure-as-code workflows, a community-maintained Terraform setup provides:

* Modular Terraform configuration with remote state management
* Automated provisioning via cloud-init
* Deployment scripts (bootstrap, deploy, backup/restore)
* Security hardening (firewall, UFW, SSH-only access)
* SSH tunnel configuration for gateway access

**Repositories:**

* Infrastructure: [openclaw-terraform-hetzner](https://github.com/andreesg/openclaw-terraform-hetzner)
* Docker config: [openclaw-docker-config](https://github.com/andreesg/openclaw-docker-config)

This approach complements the Docker setup above with reproducible deployments, version-controlled infrastructure, and automated disaster recovery.

> **Note:** Community-maintained. For issues or contributions, see the repository links above.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/index.md`

Source URL: https://docs.openclaw.ai/install/index.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Install

# Install

Already followed [Getting Started](/start/getting-started)? You're all set â€” this page is for alternative install methods, platform-specific instructions, and maintenance.

## System requirements

* **[Node 22+](/install/node)** (the [installer script](#install-methods) will install it if missing)
* macOS, Linux, or Windows
* `pnpm` only if you build from source

<Note>
  On Windows, we strongly recommend running OpenClaw under [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install).
</Note>

## Install methods

<Tip>
  The **installer script** is the recommended way to install OpenClaw. It handles Node detection, installation, and onboarding in one step.
</Tip>

<Warning>
  For VPS/cloud hosts, avoid third-party "1-click" marketplace images when possible. Prefer a clean base OS image (for example Ubuntu LTS), then install OpenClaw yourself with the installer script.
</Warning>

<AccordionGroup>
  <Accordion title="Installer script" icon="rocket" defaultOpen>
    Downloads the CLI, installs it globally via npm, and launches the onboarding wizard.

    <Tabs>
      <Tab title="macOS / Linux / WSL2">
        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        curl -fsSL https://openclaw.ai/install.sh | bash
        ```
      </Tab>

      <Tab title="Windows (PowerShell)">
        ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        iwr -useb https://openclaw.ai/install.ps1 | iex
        ```
      </Tab>
    </Tabs>

    That's it â€” the script handles Node detection, installation, and onboarding.

    To skip onboarding and just install the binary:

    <Tabs>
      <Tab title="macOS / Linux / WSL2">
        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
        ```
      </Tab>

      <Tab title="Windows (PowerShell)">
        ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
        ```
      </Tab>
    </Tabs>

    For all flags, env vars, and CI/automation options, see [Installer internals](/install/installer).
  </Accordion>

  <Accordion title="npm / pnpm" icon="package">
    If you already have Node 22+ and prefer to manage the install yourself:

    <Tabs>
      <Tab title="npm">
        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        npm install -g openclaw@latest
        openclaw onboard --install-daemon
        ```

        <Accordion title="sharp build errors?">
          If you have libvips installed globally (common on macOS via Homebrew) and `sharp` fails, force prebuilt binaries:

          ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
          SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
          ```

          If you see `sharp: Please add node-gyp to your dependencies`, either install build tooling (macOS: Xcode CLT + `npm install -g node-gyp`) or use the env var above.
        </Accordion>
      </Tab>

      <Tab title="pnpm">
        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        pnpm add -g openclaw@latest
        pnpm approve-builds -g        # approve openclaw, node-llama-cpp, sharp, etc.
        openclaw onboard --install-daemon
        ```

        <Note>
          pnpm requires explicit approval for packages with build scripts. After the first install shows the "Ignored build scripts" warning, run `pnpm approve-builds -g` and select the listed packages.
        </Note>
      </Tab>
    </Tabs>
  </Accordion>

  <Accordion title="From source" icon="github">
    For contributors or anyone who wants to run from a local checkout.

    <Steps>
      <Step title="Clone and build">
        Clone the [OpenClaw repo](https://github.com/openclaw/openclaw) and build:

        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        git clone https://github.com/openclaw/openclaw.git
        cd openclaw
        pnpm install
        pnpm ui:build
        pnpm build
        ```
      </Step>

      <Step title="Link the CLI">
        Make the `openclaw` command available globally:

        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        pnpm link --global
        ```

        Alternatively, skip the link and run commands via `pnpm openclaw ...` from inside the repo.
      </Step>

      <Step title="Run onboarding">
        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        openclaw onboard --install-daemon
        ```
      </Step>
    </Steps>

    For deeper development workflows, see [Setup](/start/setup).
  </Accordion>
</AccordionGroup>

## Other install methods

<CardGroup cols={2}>
  <Card title="Docker" href="/install/docker" icon="container">
    Containerized or headless deployments.
  </Card>

  <Card title="Podman" href="/install/podman" icon="container">
    Rootless container: run `setup-podman.sh` once, then the launch script.
  </Card>

  <Card title="Nix" href="/install/nix" icon="snowflake">
    Declarative install via Nix.
  </Card>

  <Card title="Ansible" href="/install/ansible" icon="server">
    Automated fleet provisioning.
  </Card>

  <Card title="Bun" href="/install/bun" icon="zap">
    CLI-only usage via the Bun runtime.
  </Card>
</CardGroup>

## After install

Verify everything is working:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw doctor         # check for config issues
openclaw status         # gateway status
openclaw dashboard      # open the browser UI
```

If you need custom runtime paths, use:

* `OPENCLAW_HOME` for home-directory based internal paths
* `OPENCLAW_STATE_DIR` for mutable state location
* `OPENCLAW_CONFIG_PATH` for config file location

See [Environment vars](/help/environment) for precedence and full details.

## Troubleshooting: `openclaw` not found

<Accordion title="PATH diagnosis and fix">
  Quick diagnosis:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  node -v
  npm -v
  npm prefix -g
  echo "$PATH"
  ```

  If `$(npm prefix -g)/bin` (macOS/Linux) or `$(npm prefix -g)` (Windows) is **not** in your `$PATH`, your shell can't find global npm binaries (including `openclaw`).

  Fix â€” add it to your shell startup file (`~/.zshrc` or `~/.bashrc`):

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  export PATH="$(npm prefix -g)/bin:$PATH"
  ```

  On Windows, add the output of `npm prefix -g` to your PATH.

  Then open a new terminal (or `rehash` in zsh / `hash -r` in bash).
</Accordion>

## Update / uninstall

<CardGroup cols={3}>
  <Card title="Updating" href="/install/updating" icon="refresh-cw">
    Keep OpenClaw up to date.
  </Card>

  <Card title="Migrating" href="/install/migrating" icon="arrow-right">
    Move to a new machine.
  </Card>

  <Card title="Uninstall" href="/install/uninstall" icon="trash-2">
    Remove OpenClaw completely.
  </Card>
</CardGroup>


Built with [Mintlify](https://mintlify.com).

---

## File: `install/installer.md`

Source URL: https://docs.openclaw.ai/install/installer.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Installer Internals

# Installer internals

OpenClaw ships three installer scripts, served from `openclaw.ai`.

| Script                             | Platform             | What it does                                                                                 |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| [`install.sh`](#installsh)         | macOS / Linux / WSL  | Installs Node if needed, installs OpenClaw via npm (default) or git, and can run onboarding. |
| [`install-cli.sh`](#install-clish) | macOS / Linux / WSL  | Installs Node + OpenClaw into a local prefix (`~/.openclaw`). No root required.              |
| [`install.ps1`](#installps1)       | Windows (PowerShell) | Installs Node if needed, installs OpenClaw via npm (default) or git, and can run onboarding. |

## Quick commands

<Tabs>
  <Tab title="install.sh">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --help
    ```
  </Tab>

  <Tab title="install-cli.sh">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --help
    ```
  </Tab>

  <Tab title="install.ps1">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```

    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -Tag beta -NoOnboard -DryRun
    ```
  </Tab>
</Tabs>

<Note>
  If install succeeds but `openclaw` is not found in a new terminal, see [Node.js troubleshooting](/install/node#troubleshooting).
</Note>

***

## install.sh

<Tip>
  Recommended for most interactive installs on macOS/Linux/WSL.
</Tip>

### Flow (install.sh)

<Steps>
  <Step title="Detect OS">
    Supports macOS and Linux (including WSL). If macOS is detected, installs Homebrew if missing.
  </Step>

  <Step title="Ensure Node.js 22+">
    Checks Node version and installs Node 22 if needed (Homebrew on macOS, NodeSource setup scripts on Linux apt/dnf/yum).
  </Step>

  <Step title="Ensure Git">
    Installs Git if missing.
  </Step>

  <Step title="Install OpenClaw">
    * `npm` method (default): global npm install
    * `git` method: clone/update repo, install deps with pnpm, build, then install wrapper at `~/.local/bin/openclaw`
  </Step>

  <Step title="Post-install tasks">
    * Runs `openclaw doctor --non-interactive` on upgrades and git installs (best effort)
    * Attempts onboarding when appropriate (TTY available, onboarding not disabled, and bootstrap/config checks pass)
    * Defaults `SHARP_IGNORE_GLOBAL_LIBVIPS=1`
  </Step>
</Steps>

### Source checkout detection

If run inside an OpenClaw checkout (`package.json` + `pnpm-workspace.yaml`), the script offers:

* use checkout (`git`), or
* use global install (`npm`)

If no TTY is available and no install method is set, it defaults to `npm` and warns.

The script exits with code `2` for invalid method selection or invalid `--install-method` values.

### Examples (install.sh)

<Tabs>
  <Tab title="Default">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="Skip onboarding">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-onboard
    ```
  </Tab>

  <Tab title="Git install">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```
  </Tab>

  <Tab title="Dry run">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --dry-run
    ```
  </Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="Flags reference">
    | Flag                            | Description                                                |
    | ------------------------------- | ---------------------------------------------------------- |
    | `--install-method npm\|git`     | Choose install method (default: `npm`). Alias: `--method`  |
    | `--npm`                         | Shortcut for npm method                                    |
    | `--git`                         | Shortcut for git method. Alias: `--github`                 |
    | `--version <version\|dist-tag>` | npm version or dist-tag (default: `latest`)                |
    | `--beta`                        | Use beta dist-tag if available, else fallback to `latest`  |
    | `--git-dir <path>`              | Checkout directory (default: `~/openclaw`). Alias: `--dir` |
    | `--no-git-update`               | Skip `git pull` for existing checkout                      |
    | `--no-prompt`                   | Disable prompts                                            |
    | `--no-onboard`                  | Skip onboarding                                            |
    | `--onboard`                     | Enable onboarding                                          |
    | `--dry-run`                     | Print actions without applying changes                     |
    | `--verbose`                     | Enable debug output (`set -x`, npm notice-level logs)      |
    | `--help`                        | Show usage (`-h`)                                          |
  </Accordion>

  <Accordion title="Environment variables reference">
    | Variable                                    | Description                                   |
    | ------------------------------------------- | --------------------------------------------- |
    | `OPENCLAW_INSTALL_METHOD=git\|npm`          | Install method                                |
    | `OPENCLAW_VERSION=latest\|next\|<semver>`   | npm version or dist-tag                       |
    | `OPENCLAW_BETA=0\|1`                        | Use beta if available                         |
    | `OPENCLAW_GIT_DIR=<path>`                   | Checkout directory                            |
    | `OPENCLAW_GIT_UPDATE=0\|1`                  | Toggle git updates                            |
    | `OPENCLAW_NO_PROMPT=1`                      | Disable prompts                               |
    | `OPENCLAW_NO_ONBOARD=1`                     | Skip onboarding                               |
    | `OPENCLAW_DRY_RUN=1`                        | Dry run mode                                  |
    | `OPENCLAW_VERBOSE=1`                        | Debug mode                                    |
    | `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice` | npm log level                                 |
    | `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`          | Control sharp/libvips behavior (default: `1`) |
  </Accordion>
</AccordionGroup>

***

## install-cli.sh

<Info>
  Designed for environments where you want everything under a local prefix (default `~/.openclaw`) and no system Node dependency.
</Info>

### Flow (install-cli.sh)

<Steps>
  <Step title="Install local Node runtime">
    Downloads Node tarball (default `22.22.0`) to `<prefix>/tools/node-v<version>` and verifies SHA-256.
  </Step>

  <Step title="Ensure Git">
    If Git is missing, attempts install via apt/dnf/yum on Linux or Homebrew on macOS.
  </Step>

  <Step title="Install OpenClaw under prefix">
    Installs with npm using `--prefix <prefix>`, then writes wrapper to `<prefix>/bin/openclaw`.
  </Step>
</Steps>

### Examples (install-cli.sh)

<Tabs>
  <Tab title="Default">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```
  </Tab>

  <Tab title="Custom prefix + version">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --prefix /opt/openclaw --version latest
    ```
  </Tab>

  <Tab title="Automation JSON output">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --json --prefix /opt/openclaw
    ```
  </Tab>

  <Tab title="Run onboarding">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --onboard
    ```
  </Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="Flags reference">
    | Flag                   | Description                                                                     |
    | ---------------------- | ------------------------------------------------------------------------------- |
    | `--prefix <path>`      | Install prefix (default: `~/.openclaw`)                                         |
    | `--version <ver>`      | OpenClaw version or dist-tag (default: `latest`)                                |
    | `--node-version <ver>` | Node version (default: `22.22.0`)                                               |
    | `--json`               | Emit NDJSON events                                                              |
    | `--onboard`            | Run `openclaw onboard` after install                                            |
    | `--no-onboard`         | Skip onboarding (default)                                                       |
    | `--set-npm-prefix`     | On Linux, force npm prefix to `~/.npm-global` if current prefix is not writable |
    | `--help`               | Show usage (`-h`)                                                               |
  </Accordion>

  <Accordion title="Environment variables reference">
    | Variable                                    | Description                                                                       |
    | ------------------------------------------- | --------------------------------------------------------------------------------- |
    | `OPENCLAW_PREFIX=<path>`                    | Install prefix                                                                    |
    | `OPENCLAW_VERSION=<ver>`                    | OpenClaw version or dist-tag                                                      |
    | `OPENCLAW_NODE_VERSION=<ver>`               | Node version                                                                      |
    | `OPENCLAW_NO_ONBOARD=1`                     | Skip onboarding                                                                   |
    | `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice` | npm log level                                                                     |
    | `OPENCLAW_GIT_DIR=<path>`                   | Legacy cleanup lookup path (used when removing old `Peekaboo` submodule checkout) |
    | `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`          | Control sharp/libvips behavior (default: `1`)                                     |
  </Accordion>
</AccordionGroup>

***

## install.ps1

### Flow (install.ps1)

<Steps>
  <Step title="Ensure PowerShell + Windows environment">
    Requires PowerShell 5+.
  </Step>

  <Step title="Ensure Node.js 22+">
    If missing, attempts install via winget, then Chocolatey, then Scoop.
  </Step>

  <Step title="Install OpenClaw">
    * `npm` method (default): global npm install using selected `-Tag`
    * `git` method: clone/update repo, install/build with pnpm, and install wrapper at `%USERPROFILE%\.local\bin\openclaw.cmd`
  </Step>

  <Step title="Post-install tasks">
    Adds needed bin directory to user PATH when possible, then runs `openclaw doctor --non-interactive` on upgrades and git installs (best effort).
  </Step>
</Steps>

### Examples (install.ps1)

<Tabs>
  <Tab title="Default">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>

  <Tab title="Git install">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -InstallMethod git
    ```
  </Tab>

  <Tab title="Custom git directory">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -InstallMethod git -GitDir "C:\openclaw"
    ```
  </Tab>

  <Tab title="Dry run">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -DryRun
    ```
  </Tab>

  <Tab title="Debug trace">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    # install.ps1 has no dedicated -Verbose flag yet.
    Set-PSDebug -Trace 1
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    Set-PSDebug -Trace 0
    ```
  </Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="Flags reference">
    | Flag                      | Description                                            |
    | ------------------------- | ------------------------------------------------------ |
    | `-InstallMethod npm\|git` | Install method (default: `npm`)                        |
    | `-Tag <tag>`              | npm dist-tag (default: `latest`)                       |
    | `-GitDir <path>`          | Checkout directory (default: `%USERPROFILE%\openclaw`) |
    | `-NoOnboard`              | Skip onboarding                                        |
    | `-NoGitUpdate`            | Skip `git pull`                                        |
    | `-DryRun`                 | Print actions only                                     |
  </Accordion>

  <Accordion title="Environment variables reference">
    | Variable                           | Description        |
    | ---------------------------------- | ------------------ |
    | `OPENCLAW_INSTALL_METHOD=git\|npm` | Install method     |
    | `OPENCLAW_GIT_DIR=<path>`          | Checkout directory |
    | `OPENCLAW_NO_ONBOARD=1`            | Skip onboarding    |
    | `OPENCLAW_GIT_UPDATE=0`            | Disable git pull   |
    | `OPENCLAW_DRY_RUN=1`               | Dry run mode       |
  </Accordion>
</AccordionGroup>

<Note>
  If `-InstallMethod git` is used and Git is missing, the script exits and prints the Git for Windows link.
</Note>

***

## CI and automation

Use non-interactive flags/env vars for predictable runs.

<Tabs>
  <Tab title="install.sh (non-interactive npm)">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-prompt --no-onboard
    ```
  </Tab>

  <Tab title="install.sh (non-interactive git)">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    OPENCLAW_INSTALL_METHOD=git OPENCLAW_NO_PROMPT=1 \
      curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="install-cli.sh (JSON)">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --json --prefix /opt/openclaw
    ```
  </Tab>

  <Tab title="install.ps1 (skip onboarding)">
    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    ```
  </Tab>
</Tabs>

***

## Troubleshooting

<AccordionGroup>
  <Accordion title="Why is Git required?">
    Git is required for `git` install method. For `npm` installs, Git is still checked/installed to avoid `spawn git ENOENT` failures when dependencies use git URLs.
  </Accordion>

  <Accordion title="Why does npm hit EACCES on Linux?">
    Some Linux setups point npm global prefix to root-owned paths. `install.sh` can switch prefix to `~/.npm-global` and append PATH exports to shell rc files (when those files exist).
  </Accordion>

  <Accordion title="sharp/libvips issues">
    The scripts default `SHARP_IGNORE_GLOBAL_LIBVIPS=1` to avoid sharp building against system libvips. To override:

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    SHARP_IGNORE_GLOBAL_LIBVIPS=0 curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```
  </Accordion>

  <Accordion title="Windows: &#x22;npm error spawn git / ENOENT&#x22;">
    Install Git for Windows, reopen PowerShell, rerun installer.
  </Accordion>

  <Accordion title="Windows: &#x22;openclaw is not recognized&#x22;">
    Run `npm config get prefix` and add that directory to your user PATH (no `\bin` suffix needed on Windows), then reopen PowerShell.
  </Accordion>

  <Accordion title="Windows: how to get verbose installer output">
    `install.ps1` does not currently expose a `-Verbose` switch.
    Use PowerShell tracing for script-level diagnostics:

    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    Set-PSDebug -Trace 1
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    Set-PSDebug -Trace 0
    ```
  </Accordion>

  <Accordion title="openclaw not found after install">
    Usually a PATH issue. See [Node.js troubleshooting](/install/node#troubleshooting).
  </Accordion>
</AccordionGroup>


Built with [Mintlify](https://mintlify.com).

---

## File: `install/macos-vm.md`

Source URL: https://docs.openclaw.ai/install/macos-vm.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS VMs

# OpenClaw on macOS VMs (Sandboxing)

## Recommended default (most users)

* **Small Linux VPS** for an always-on Gateway and low cost. See [VPS hosting](/vps).
* **Dedicated hardware** (Mac mini or Linux box) if you want full control and a **residential IP** for browser automation. Many sites block data center IPs, so local browsing often works better.
* **Hybrid:** keep the Gateway on a cheap VPS, and connect your Mac as a **node** when you need browser/UI automation. See [Nodes](/nodes) and [Gateway remote](/gateway/remote).

Use a macOS VM when you specifically need macOS-only capabilities (iMessage/BlueBubbles) or want strict isolation from your daily Mac.

## macOS VM options

### Local VM on your Apple Silicon Mac (Lume)

Run OpenClaw in a sandboxed macOS VM on your existing Apple Silicon Mac using [Lume](https://cua.ai/docs/lume).

This gives you:

* Full macOS environment in isolation (your host stays clean)
* iMessage support via BlueBubbles (impossible on Linux/Windows)
* Instant reset by cloning VMs
* No extra hardware or cloud costs

### Hosted Mac providers (cloud)

If you want macOS in the cloud, hosted Mac providers work too:

* [MacStadium](https://www.macstadium.com/) (hosted Macs)
* Other hosted Mac vendors also work; follow their VM + SSH docs

Once you have SSH access to a macOS VM, continue at step 6 below.

***

## Quick path (Lume, experienced users)

1. Install Lume
2. `lume create openclaw --os macos --ipsw latest`
3. Complete Setup Assistant, enable Remote Login (SSH)
4. `lume run openclaw --no-display`
5. SSH in, install OpenClaw, configure channels
6. Done

***

## What you need (Lume)

* Apple Silicon Mac (M1/M2/M3/M4)
* macOS Sequoia or later on the host
* \~60 GB free disk space per VM
* \~20 minutes

***

## 1) Install Lume

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/trycua/cua/main/libs/lume/scripts/install.sh)"
```

If `~/.local/bin` isn't in your PATH:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.zshrc && source ~/.zshrc
```

Verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume --version
```

Docs: [Lume Installation](https://cua.ai/docs/lume/guide/getting-started/installation)

***

## 2) Create the macOS VM

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume create openclaw --os macos --ipsw latest
```

This downloads macOS and creates the VM. A VNC window opens automatically.

Note: The download can take a while depending on your connection.

***

## 3) Complete Setup Assistant

In the VNC window:

1. Select language and region
2. Skip Apple ID (or sign in if you want iMessage later)
3. Create a user account (remember the username and password)
4. Skip all optional features

After setup completes, enable SSH:

1. Open System Settings â†’ General â†’ Sharing
2. Enable "Remote Login"

***

## 4) Get the VM's IP address

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume get openclaw
```

Look for the IP address (usually `192.168.64.x`).

***

## 5) SSH into the VM

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh youruser@192.168.64.X
```

Replace `youruser` with the account you created, and the IP with your VM's IP.

***

## 6) Install OpenClaw

Inside the VM:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

Follow the onboarding prompts to set up your model provider (Anthropic, OpenAI, etc.).

***

## 7) Configure channels

Edit the config file:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
nano ~/.openclaw/openclaw.json
```

Add your channels:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+15551234567"]
    },
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN"
    }
  }
}
```

Then login to WhatsApp (scan QR):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw channels login
```

***

## 8) Run the VM headlessly

Stop the VM and restart without display:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume stop openclaw
lume run openclaw --no-display
```

The VM runs in the background. OpenClaw's daemon keeps the gateway running.

To check status:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh youruser@192.168.64.X "openclaw status"
```

***

## Bonus: iMessage integration

This is the killer feature of running on macOS. Use [BlueBubbles](https://bluebubbles.app) to add iMessage to OpenClaw.

Inside the VM:

1. Download BlueBubbles from bluebubbles.app
2. Sign in with your Apple ID
3. Enable the Web API and set a password
4. Point BlueBubbles webhooks at your gateway (example: `https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`)

Add to your OpenClaw config:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "channels": {
    "bluebubbles": {
      "serverUrl": "http://localhost:1234",
      "password": "your-api-password",
      "webhookPath": "/bluebubbles-webhook"
    }
  }
}
```

Restart the gateway. Now your agent can send and receive iMessages.

Full setup details: [BlueBubbles channel](/channels/bluebubbles)

***

## Save a golden image

Before customizing further, snapshot your clean state:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume stop openclaw
lume clone openclaw openclaw-golden
```

Reset anytime:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lume stop openclaw && lume delete openclaw
lume clone openclaw-golden openclaw
lume run openclaw --no-display
```

***

## Running 24/7

Keep the VM running by:

* Keeping your Mac plugged in
* Disabling sleep in System Settings â†’ Energy Saver
* Using `caffeinate` if needed

For true always-on, consider a dedicated Mac mini or a small VPS. See [VPS hosting](/vps).

***

## Troubleshooting

| Problem                  | Solution                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Can't SSH into VM        | Check "Remote Login" is enabled in VM's System Settings                            |
| VM IP not showing        | Wait for VM to fully boot, run `lume get openclaw` again                           |
| Lume command not found   | Add `~/.local/bin` to your PATH                                                    |
| WhatsApp QR not scanning | Ensure you're logged into the VM (not host) when running `openclaw channels login` |

***

## Related docs

* [VPS hosting](/vps)
* [Nodes](/nodes)
* [Gateway remote](/gateway/remote)
* [BlueBubbles channel](/channels/bluebubbles)
* [Lume Quickstart](https://cua.ai/docs/lume/guide/getting-started/quickstart)
* [Lume CLI Reference](https://cua.ai/docs/lume/reference/cli-reference)
* [Unattended VM Setup](https://cua.ai/docs/lume/guide/fundamentals/unattended-setup) (advanced)
* [Docker Sandboxing](/install/docker) (alternative isolation approach)


Built with [Mintlify](https://mintlify.com).

---

## File: `install/migrating.md`

Source URL: https://docs.openclaw.ai/install/migrating.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Migration Guide

# Migrating OpenClaw to a new machine

This guide migrates a OpenClaw Gateway from one machine to another **without redoing onboarding**.

The migration is simple conceptually:

* Copy the **state directory** (`$OPENCLAW_STATE_DIR`, default: `~/.openclaw/`) â€” this includes config, auth, sessions, and channel state.
* Copy your **workspace** (`~/.openclaw/workspace/` by default) â€” this includes your agent files (memory, prompts, etc.).

But there are common footguns around **profiles**, **permissions**, and **partial copies**.

## Before you start (what you are migrating)

### 1) Identify your state directory

Most installs use the default:

* **State dir:** `~/.openclaw/`

But it may be different if you use:

* `--profile <name>` (often becomes `~/.openclaw-<profile>/`)
* `OPENCLAW_STATE_DIR=/some/path`

If youâ€™re not sure, run on the **old** machine:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw status
```

Look for mentions of `OPENCLAW_STATE_DIR` / profile in the output. If you run multiple gateways, repeat for each profile.

### 2) Identify your workspace

Common defaults:

* `~/.openclaw/workspace/` (recommended workspace)
* a custom folder you created

Your workspace is where files like `MEMORY.md`, `USER.md`, and `memory/*.md` live.

### 3) Understand what you will preserve

If you copy **both** the state dir and workspace, you keep:

* Gateway configuration (`openclaw.json`)
* Auth profiles / API keys / OAuth tokens
* Session history + agent state
* Channel state (e.g. WhatsApp login/session)
* Your workspace files (memory, skills notes, etc.)

If you copy **only** the workspace (e.g., via Git), you do **not** preserve:

* sessions
* credentials
* channel logins

Those live under `$OPENCLAW_STATE_DIR`.

## Migration steps (recommended)

### Step 0 â€” Make a backup (old machine)

On the **old** machine, stop the gateway first so files arenâ€™t changing mid-copy:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway stop
```

(Optional but recommended) archive the state dir and workspace:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Adjust paths if you use a profile or custom locations
cd ~
tar -czf openclaw-state.tgz .openclaw

tar -czf openclaw-workspace.tgz .openclaw/workspace
```

If you have multiple profiles/state dirs (e.g. `~/.openclaw-main`, `~/.openclaw-work`), archive each.

### Step 1 â€” Install OpenClaw on the new machine

On the **new** machine, install the CLI (and Node if needed):

* See: [Install](/install)

At this stage, itâ€™s OK if onboarding creates a fresh `~/.openclaw/` â€” you will overwrite it in the next step.

### Step 2 â€” Copy the state dir + workspace to the new machine

Copy **both**:

* `$OPENCLAW_STATE_DIR` (default `~/.openclaw/`)
* your workspace (default `~/.openclaw/workspace/`)

Common approaches:

* `scp` the tarballs and extract
* `rsync -a` over SSH
* external drive

After copying, ensure:

* Hidden directories were included (e.g. `.openclaw/`)
* File ownership is correct for the user running the gateway

### Step 3 â€” Run Doctor (migrations + service repair)

On the **new** machine:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw doctor
```

Doctor is the â€œsafe boringâ€ command. It repairs services, applies config migrations, and warns about mismatches.

Then:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway restart
openclaw status
```

## Common footguns (and how to avoid them)

### Footgun: profile / state-dir mismatch

If you ran the old gateway with a profile (or `OPENCLAW_STATE_DIR`), and the new gateway uses a different one, youâ€™ll see symptoms like:

* config changes not taking effect
* channels missing / logged out
* empty session history

Fix: run the gateway/service using the **same** profile/state dir you migrated, then rerun:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw doctor
```

### Footgun: copying only `openclaw.json`

`openclaw.json` is not enough. Many providers store state under:

* `$OPENCLAW_STATE_DIR/credentials/`
* `$OPENCLAW_STATE_DIR/agents/<agentId>/...`

Always migrate the entire `$OPENCLAW_STATE_DIR` folder.

### Footgun: permissions / ownership

If you copied as root or changed users, the gateway may fail to read credentials/sessions.

Fix: ensure the state dir + workspace are owned by the user running the gateway.

### Footgun: migrating between remote/local modes

* If your UI (WebUI/TUI) points at a **remote** gateway, the remote host owns the session store + workspace.
* Migrating your laptop wonâ€™t move the remote gatewayâ€™s state.

If youâ€™re in remote mode, migrate the **gateway host**.

### Footgun: secrets in backups

`$OPENCLAW_STATE_DIR` contains secrets (API keys, OAuth tokens, WhatsApp creds). Treat backups like production secrets:

* store encrypted
* avoid sharing over insecure channels
* rotate keys if you suspect exposure

## Verification checklist

On the new machine, confirm:

* `openclaw status` shows the gateway running
* Your channels are still connected (e.g. WhatsApp doesnâ€™t require re-pair)
* The dashboard opens and shows existing sessions
* Your workspace files (memory, configs) are present

## Related

* [Doctor](/gateway/doctor)
* [Gateway troubleshooting](/gateway/troubleshooting)
* [Where does OpenClaw store its data?](/help/faq#where-does-openclaw-store-its-data)


Built with [Mintlify](https://mintlify.com).

---

## File: `install/nix.md`

Source URL: https://docs.openclaw.ai/install/nix.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Nix

# Nix Installation

The recommended way to run OpenClaw with Nix is via **[nix-openclaw](https://github.com/openclaw/nix-openclaw)** â€” a batteries-included Home Manager module.

## Quick Start

Paste this to your AI agent (Claude, Cursor, etc.):

```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
I want to set up nix-openclaw on my Mac.
Repository: github:openclaw/nix-openclaw

What I need you to do:
1. Check if Determinate Nix is installed (if not, install it)
2. Create a local flake at ~/code/openclaw-local using templates/agent-first/flake.nix
3. Help me create a Telegram bot (@BotFather) and get my chat ID (@userinfobot)
4. Set up secrets (bot token, model provider API key) - plain files at ~/.secrets/ is fine
5. Fill in the template placeholders and run home-manager switch
6. Verify: launchd running, bot responds to messages

Reference the nix-openclaw README for module options.
```

> **ðŸ“¦ Full guide: [github.com/openclaw/nix-openclaw](https://github.com/openclaw/nix-openclaw)**
>
> The nix-openclaw repo is the source of truth for Nix installation. This page is just a quick overview.

## What you get

* Gateway + macOS app + tools (whisper, spotify, cameras) â€” all pinned
* Launchd service that survives reboots
* Plugin system with declarative config
* Instant rollback: `home-manager switch --rollback`

***

## Nix Mode Runtime Behavior

When `OPENCLAW_NIX_MODE=1` is set (automatic with nix-openclaw):

OpenClaw supports a **Nix mode** that makes configuration deterministic and disables auto-install flows.
Enable it by exporting:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
OPENCLAW_NIX_MODE=1
```

On macOS, the GUI app does not automatically inherit shell env vars. You can
also enable Nix mode via defaults:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
defaults write ai.openclaw.mac openclaw.nixMode -bool true
```

### Config + state paths

OpenClaw reads JSON5 config from `OPENCLAW_CONFIG_PATH` and stores mutable data in `OPENCLAW_STATE_DIR`.
When needed, you can also set `OPENCLAW_HOME` to control the base home directory used for internal path resolution.

* `OPENCLAW_HOME` (default precedence: `HOME` / `USERPROFILE` / `os.homedir()`)
* `OPENCLAW_STATE_DIR` (default: `~/.openclaw`)
* `OPENCLAW_CONFIG_PATH` (default: `$OPENCLAW_STATE_DIR/openclaw.json`)

When running under Nix, set these explicitly to Nix-managed locations so runtime state and config
stay out of the immutable store.

### Runtime behavior in Nix mode

* Auto-install and self-mutation flows are disabled
* Missing dependencies surface Nix-specific remediation messages
* UI surfaces a read-only Nix mode banner when present

## Packaging note (macOS)

The macOS packaging flow expects a stable Info.plist template at:

```
apps/macos/Sources/OpenClaw/Resources/Info.plist
```

[`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh) copies this template into the app bundle and patches dynamic fields
(bundle ID, version/build, Git SHA, Sparkle keys). This keeps the plist deterministic for SwiftPM
packaging and Nix builds (which do not rely on a full Xcode toolchain).

## Related

* [nix-openclaw](https://github.com/openclaw/nix-openclaw) â€” full setup guide
* [Wizard](/start/wizard) â€” non-Nix CLI setup
* [Docker](/install/docker) â€” containerized setup


Built with [Mintlify](https://mintlify.com).

---

## File: `install/node.md`

Source URL: https://docs.openclaw.ai/install/node.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Node.js

# Node.js

OpenClaw requires **Node 22 or newer**. The [installer script](/install#install-methods) will detect and install Node automatically â€” this page is for when you want to set up Node yourself and make sure everything is wired up correctly (versions, PATH, global installs).

## Check your version

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
node -v
```

If this prints `v22.x.x` or higher, you're good. If Node isn't installed or the version is too old, pick an install method below.

## Install Node

<Tabs>
  <Tab title="macOS">
    **Homebrew** (recommended):

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    brew install node
    ```

    Or download the macOS installer from [nodejs.org](https://nodejs.org/).
  </Tab>

  <Tab title="Linux">
    **Ubuntu / Debian:**

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

    **Fedora / RHEL:**

    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    sudo dnf install nodejs
    ```

    Or use a version manager (see below).
  </Tab>

  <Tab title="Windows">
    **winget** (recommended):

    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    winget install OpenJS.NodeJS.LTS
    ```

    **Chocolatey:**

    ```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    choco install nodejs-lts
    ```

    Or download the Windows installer from [nodejs.org](https://nodejs.org/).
  </Tab>
</Tabs>

<Accordion title="Using a version manager (nvm, fnm, mise, asdf)">
  Version managers let you switch between Node versions easily. Popular options:

  * [**fnm**](https://github.com/Schniz/fnm) â€” fast, cross-platform
  * [**nvm**](https://github.com/nvm-sh/nvm) â€” widely used on macOS/Linux
  * [**mise**](https://mise.jdx.dev/) â€” polyglot (Node, Python, Ruby, etc.)

  Example with fnm:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  fnm install 22
  fnm use 22
  ```

  <Warning>
    Make sure your version manager is initialized in your shell startup file (`~/.zshrc` or `~/.bashrc`). If it isn't, `openclaw` may not be found in new terminal sessions because the PATH won't include Node's bin directory.
  </Warning>
</Accordion>

## Troubleshooting

### `openclaw: command not found`

This almost always means npm's global bin directory isn't on your PATH.

<Steps>
  <Step title="Find your global npm prefix">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    npm prefix -g
    ```
  </Step>

  <Step title="Check if it's on your PATH">
    ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
    echo "$PATH"
    ```

    Look for `<npm-prefix>/bin` (macOS/Linux) or `<npm-prefix>` (Windows) in the output.
  </Step>

  <Step title="Add it to your shell startup file">
    <Tabs>
      <Tab title="macOS / Linux">
        Add to `~/.zshrc` or `~/.bashrc`:

        ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
        export PATH="$(npm prefix -g)/bin:$PATH"
        ```

        Then open a new terminal (or run `rehash` in zsh / `hash -r` in bash).
      </Tab>

      <Tab title="Windows">
        Add the output of `npm prefix -g` to your system PATH via Settings â†’ System â†’ Environment Variables.
      </Tab>
    </Tabs>
  </Step>
</Steps>

### Permission errors on `npm install -g` (Linux)

If you see `EACCES` errors, switch npm's global prefix to a user-writable directory:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p "$HOME/.npm-global"
npm config set prefix "$HOME/.npm-global"
export PATH="$HOME/.npm-global/bin:$PATH"
```

Add the `export PATH=...` line to your `~/.bashrc` or `~/.zshrc` to make it permanent.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/northflank.md`

Source URL: https://docs.openclaw.ai/install/northflank.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy on Northflank

Deploy OpenClaw on Northflank with a one-click template and finish setup in your browser.
This is the easiest â€œno terminal on the serverâ€ path: Northflank runs the Gateway for you,
and you configure everything via the `/setup` web wizard.

## How to get started

1. Click [Deploy OpenClaw](https://northflank.com/stacks/deploy-openclaw) to open the template.
2. Create an [account on Northflank](https://app.northflank.com/signup) if you donâ€™t already have one.
3. Click **Deploy OpenClaw now**.
4. Set the required environment variable: `SETUP_PASSWORD`.
5. Click **Deploy stack** to build and run the OpenClaw template.
6. Wait for the deployment to complete, then click **View resources**.
7. Open the OpenClaw service.
8. Open the public OpenClaw URL and complete setup at `/setup`.
9. Open the Control UI at `/openclaw`.

## What you get

* Hosted OpenClaw Gateway + Control UI
* Web setup wizard at `/setup` (no terminal commands)
* Persistent storage via Northflank Volume (`/data`) so config/credentials/workspace survive redeploys

## Setup flow

1. Visit `https://<your-northflank-domain>/setup` and enter your `SETUP_PASSWORD`.
2. Choose a model/auth provider and paste your key.
3. (Optional) Add Telegram/Discord/Slack tokens.
4. Click **Run setup**.
5. Open the Control UI at `https://<your-northflank-domain>/openclaw`

If Telegram DMs are set to pairing, the setup wizard can approve the pairing code.

## Getting chat tokens

### Telegram bot token

1. Message `@BotFather` in Telegram
2. Run `/newbot`
3. Copy the token (looks like `123456789:AA...`)
4. Paste it into `/setup`

### Discord bot token

1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** â†’ choose a name
3. **Bot** â†’ **Add Bot**
4. **Enable MESSAGE CONTENT INTENT** under Bot â†’ Privileged Gateway Intents (required or the bot will crash on startup)
5. Copy the **Bot Token** and paste into `/setup`
6. Invite the bot to your server (OAuth2 URL Generator; scopes: `bot`, `applications.commands`)


Built with [Mintlify](https://mintlify.com).

---

## File: `install/podman.md`

Source URL: https://docs.openclaw.ai/install/podman.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Podman

# Podman

Run the OpenClaw gateway in a **rootless** Podman container. Uses the same image as Docker (build from the repo [Dockerfile](https://github.com/openclaw/openclaw/blob/main/Dockerfile)).

## Requirements

* Podman (rootless)
* Sudo for one-time setup (create user, build image)

## Quick start

**1. One-time setup** (from repo root; creates user, builds image, installs launch script):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./setup-podman.sh
```

This also creates a minimal `~openclaw/.openclaw/openclaw.json` (sets `gateway.mode="local"`) so the gateway can start without running the wizard.

By default the container is **not** installed as a systemd service, you start it manually (see below). For a production-style setup with auto-start and restarts, install it as a systemd Quadlet user service instead:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./setup-podman.sh --quadlet
```

(Or set `OPENCLAW_PODMAN_QUADLET=1`; use `--container` to install only the container and launch script.)

Optional build-time env vars (set before running `setup-podman.sh`):

* `OPENCLAW_DOCKER_APT_PACKAGES` â€” install extra apt packages during image build
* `OPENCLAW_EXTENSIONS` â€” pre-install extension dependencies (space-separated extension names, e.g. `diagnostics-otel matrix`)

**2. Start gateway** (manual, for quick smoke testing):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./scripts/run-openclaw-podman.sh launch
```

**3. Onboarding wizard** (e.g. to add channels or providers):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./scripts/run-openclaw-podman.sh launch setup
```

Then open `http://127.0.0.1:18789/` and use the token from `~openclaw/.openclaw/.env` (or the value printed by setup).

## Systemd (Quadlet, optional)

If you ran `./setup-podman.sh --quadlet` (or `OPENCLAW_PODMAN_QUADLET=1`), a [Podman Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) unit is installed so the gateway runs as a systemd user service for the openclaw user. The service is enabled and started at the end of setup.

* **Start:** `sudo systemctl --machine openclaw@ --user start openclaw.service`
* **Stop:** `sudo systemctl --machine openclaw@ --user stop openclaw.service`
* **Status:** `sudo systemctl --machine openclaw@ --user status openclaw.service`
* **Logs:** `sudo journalctl --machine openclaw@ --user -u openclaw.service -f`

The quadlet file lives at `~openclaw/.config/containers/systemd/openclaw.container`. To change ports or env, edit that file (or the `.env` it sources), then `sudo systemctl --machine openclaw@ --user daemon-reload` and restart the service. On boot, the service starts automatically if lingering is enabled for openclaw (setup does this when loginctl is available).

To add quadlet **after** an initial setup that did not use it, re-run: `./setup-podman.sh --quadlet`.

## The openclaw user (non-login)

`setup-podman.sh` creates a dedicated system user `openclaw`:

* **Shell:** `nologin` â€” no interactive login; reduces attack surface.

* **Home:** e.g. `/home/openclaw` â€” holds `~/.openclaw` (config, workspace) and the launch script `run-openclaw-podman.sh`.

* **Rootless Podman:** The user must have a **subuid** and **subgid** range. Many distros assign these automatically when the user is created. If setup prints a warning, add lines to `/etc/subuid` and `/etc/subgid`:

  ```text  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  openclaw:100000:65536
  ```

  Then start the gateway as that user (e.g. from cron or systemd):

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  sudo -u openclaw /home/openclaw/run-openclaw-podman.sh
  sudo -u openclaw /home/openclaw/run-openclaw-podman.sh setup
  ```

* **Config:** Only `openclaw` and root can access `/home/openclaw/.openclaw`. To edit config: use the Control UI once the gateway is running, or `sudo -u openclaw $EDITOR /home/openclaw/.openclaw/openclaw.json`.

## Environment and config

* **Token:** Stored in `~openclaw/.openclaw/.env` as `OPENCLAW_GATEWAY_TOKEN`. `setup-podman.sh` and `run-openclaw-podman.sh` generate it if missing (uses `openssl`, `python3`, or `od`).
* **Optional:** In that `.env` you can set provider keys (e.g. `GROQ_API_KEY`, `OLLAMA_API_KEY`) and other OpenClaw env vars.
* **Host ports:** By default the script maps `18789` (gateway) and `18790` (bridge). Override the **host** port mapping with `OPENCLAW_PODMAN_GATEWAY_HOST_PORT` and `OPENCLAW_PODMAN_BRIDGE_HOST_PORT` when launching.
* **Gateway bind:** By default, `run-openclaw-podman.sh` starts the gateway with `--bind loopback` for safe local access. To expose on LAN, set `OPENCLAW_GATEWAY_BIND=lan` and configure `gateway.controlUi.allowedOrigins` (or explicitly enable host-header fallback) in `openclaw.json`.
* **Paths:** Host config and workspace default to `~openclaw/.openclaw` and `~openclaw/.openclaw/workspace`. Override the host paths used by the launch script with `OPENCLAW_CONFIG_DIR` and `OPENCLAW_WORKSPACE_DIR`.

## Storage model

* **Persistent host data:** `OPENCLAW_CONFIG_DIR` and `OPENCLAW_WORKSPACE_DIR` are bind-mounted into the container and retain state on the host.
* **Ephemeral sandbox tmpfs:** if you enable `agents.defaults.sandbox`, the tool sandbox containers mount `tmpfs` at `/tmp`, `/var/tmp`, and `/run`. Those paths are memory-backed and disappear with the sandbox container; the top-level Podman container setup does not add its own tmpfs mounts.
* **Disk growth hotspots:** the main paths to watch are `media/`, `agents/<agentId>/sessions/sessions.json`, transcript JSONL files, `cron/runs/*.jsonl`, and rolling file logs under `/tmp/openclaw/` (or your configured `logging.file`).

`setup-podman.sh` now stages the image tar in a private temp directory and prints the chosen base dir during setup. For non-root runs it accepts `TMPDIR` only when that base is safe to use; otherwise it falls back to `/var/tmp`, then `/tmp`. The saved tar stays owner-only and is streamed into the target userâ€™s `podman load`, so private caller temp dirs do not block setup.

## Useful commands

* **Logs:** With quadlet: `sudo journalctl --machine openclaw@ --user -u openclaw.service -f`. With script: `sudo -u openclaw podman logs -f openclaw`
* **Stop:** With quadlet: `sudo systemctl --machine openclaw@ --user stop openclaw.service`. With script: `sudo -u openclaw podman stop openclaw`
* **Start again:** With quadlet: `sudo systemctl --machine openclaw@ --user start openclaw.service`. With script: re-run the launch script or `podman start openclaw`
* **Remove container:** `sudo -u openclaw podman rm -f openclaw` â€” config and workspace on the host are kept

## Troubleshooting

* **Permission denied (EACCES) on config or auth-profiles:** The container defaults to `--userns=keep-id` and runs as the same uid/gid as the host user running the script. Ensure your host `OPENCLAW_CONFIG_DIR` and `OPENCLAW_WORKSPACE_DIR` are owned by that user.
* **Gateway start blocked (missing `gateway.mode=local`):** Ensure `~openclaw/.openclaw/openclaw.json` exists and sets `gateway.mode="local"`. `setup-podman.sh` creates this file if missing.
* **Rootless Podman fails for user openclaw:** Check `/etc/subuid` and `/etc/subgid` contain a line for `openclaw` (e.g. `openclaw:100000:65536`). Add it if missing and restart.
* **Container name in use:** The launch script uses `podman run --replace`, so the existing container is replaced when you start again. To clean up manually: `podman rm -f openclaw`.
* **Script not found when running as openclaw:** Ensure `setup-podman.sh` was run so that `run-openclaw-podman.sh` is copied to openclawâ€™s home (e.g. `/home/openclaw/run-openclaw-podman.sh`).
* **Quadlet service not found or fails to start:** Run `sudo systemctl --machine openclaw@ --user daemon-reload` after editing the `.container` file. Quadlet requires cgroups v2: `podman info --format '{{.Host.CgroupsVersion}}'` should show `2`.

## Optional: run as your own user

To run the gateway as your normal user (no dedicated openclaw user): build the image, create `~/.openclaw/.env` with `OPENCLAW_GATEWAY_TOKEN`, and run the container with `--userns=keep-id` and mounts to your `~/.openclaw`. The launch script is designed for the openclaw-user flow; for a single-user setup you can instead run the `podman run` command from the script manually, pointing config and workspace to your home. Recommended for most users: use `setup-podman.sh` and run as the openclaw user so config and process are isolated.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/railway.md`

Source URL: https://docs.openclaw.ai/install/railway.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy on Railway

Deploy OpenClaw on Railway with a one-click template and finish setup in your browser.
This is the easiest â€œno terminal on the serverâ€ path: Railway runs the Gateway for you,
and you configure everything via the `/setup` web wizard.

## Quick checklist (new users)

1. Click **Deploy on Railway** (below).
2. Add a **Volume** mounted at `/data`.
3. Set the required **Variables** (at least `SETUP_PASSWORD`).
4. Enable **HTTP Proxy** on port `8080`.
5. Open `https://<your-railway-domain>/setup` and finish the wizard.

## One-click deploy

<a href="https://railway.com/deploy/clawdbot-railway-template" target="_blank" rel="noreferrer">
  Deploy on Railway
</a>

After deploy, find your public URL in **Railway â†’ your service â†’ Settings â†’ Domains**.

Railway will either:

* give you a generated domain (often `https://<something>.up.railway.app`), or
* use your custom domain if you attached one.

Then open:

* `https://<your-railway-domain>/setup` â€” setup wizard (password protected)
* `https://<your-railway-domain>/openclaw` â€” Control UI

## What you get

* Hosted OpenClaw Gateway + Control UI
* Web setup wizard at `/setup` (no terminal commands)
* Persistent storage via Railway Volume (`/data`) so config/credentials/workspace survive redeploys
* Backup export at `/setup/export` to migrate off Railway later

## Required Railway settings

### Public Networking

Enable **HTTP Proxy** for the service.

* Port: `8080`

### Volume (required)

Attach a volume mounted at:

* `/data`

### Variables

Set these variables on the service:

* `SETUP_PASSWORD` (required)
* `PORT=8080` (required â€” must match the port in Public Networking)
* `OPENCLAW_STATE_DIR=/data/.openclaw` (recommended)
* `OPENCLAW_WORKSPACE_DIR=/data/workspace` (recommended)
* `OPENCLAW_GATEWAY_TOKEN` (recommended; treat as an admin secret)

## Setup flow

1. Visit `https://<your-railway-domain>/setup` and enter your `SETUP_PASSWORD`.
2. Choose a model/auth provider and paste your key.
3. (Optional) Add Telegram/Discord/Slack tokens.
4. Click **Run setup**.

If Telegram DMs are set to pairing, the setup wizard can approve the pairing code.

## Getting chat tokens

### Telegram bot token

1. Message `@BotFather` in Telegram
2. Run `/newbot`
3. Copy the token (looks like `123456789:AA...`)
4. Paste it into `/setup`

### Discord bot token

1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** â†’ choose a name
3. **Bot** â†’ **Add Bot**
4. **Enable MESSAGE CONTENT INTENT** under Bot â†’ Privileged Gateway Intents (required or the bot will crash on startup)
5. Copy the **Bot Token** and paste into `/setup`
6. Invite the bot to your server (OAuth2 URL Generator; scopes: `bot`, `applications.commands`)

## Backups & migration

Download a backup at:

* `https://<your-railway-domain>/setup/export`

This exports your OpenClaw state + workspace so you can migrate to another host without losing config or memory.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/render.md`

Source URL: https://docs.openclaw.ai/install/render.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy on Render

Deploy OpenClaw on Render using Infrastructure as Code. The included `render.yaml` Blueprint defines your entire stack declaratively, service, disk, environment variables, so you can deploy with a single click and version your infrastructure alongside your code.

## Prerequisites

* A [Render account](https://render.com) (free tier available)
* An API key from your preferred [model provider](/providers)

## Deploy with a Render Blueprint

[Deploy to Render](https://render.com/deploy?repo=https://github.com/openclaw/openclaw)

Clicking this link will:

1. Create a new Render service from the `render.yaml` Blueprint at the root of this repo.
2. Prompt you to set `SETUP_PASSWORD`
3. Build the Docker image and deploy

Once deployed, your service URL follows the pattern `https://<service-name>.onrender.com`.

## Understanding the Blueprint

Render Blueprints are YAML files that define your infrastructure. The `render.yaml` in this
repository configures everything needed to run OpenClaw:

```yaml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
services:
  - type: web
    name: openclaw
    runtime: docker
    plan: starter
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: "8080"
      - key: SETUP_PASSWORD
        sync: false # prompts during deploy
      - key: OPENCLAW_STATE_DIR
        value: /data/.openclaw
      - key: OPENCLAW_WORKSPACE_DIR
        value: /data/workspace
      - key: OPENCLAW_GATEWAY_TOKEN
        generateValue: true # auto-generates a secure token
    disk:
      name: openclaw-data
      mountPath: /data
      sizeGB: 1
```

Key Blueprint features used:

| Feature               | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `runtime: docker`     | Builds from the repo's Dockerfile                          |
| `healthCheckPath`     | Render monitors `/health` and restarts unhealthy instances |
| `sync: false`         | Prompts for value during deploy (secrets)                  |
| `generateValue: true` | Auto-generates a cryptographically secure value            |
| `disk`                | Persistent storage that survives redeploys                 |

## Choosing a plan

| Plan      | Spin-down         | Disk          | Best for                      |
| --------- | ----------------- | ------------- | ----------------------------- |
| Free      | After 15 min idle | Not available | Testing, demos                |
| Starter   | Never             | 1GB+          | Personal use, small teams     |
| Standard+ | Never             | 1GB+          | Production, multiple channels |

The Blueprint defaults to `starter`. To use free tier, change `plan: free` in your fork's
`render.yaml` (but note: no persistent disk means config resets on each deploy).

## After deployment

### Complete the setup wizard

1. Navigate to `https://<your-service>.onrender.com/setup`
2. Enter your `SETUP_PASSWORD`
3. Select a model provider and paste your API key
4. Optionally configure messaging channels (Telegram, Discord, Slack)
5. Click **Run setup**

### Access the Control UI

The web dashboard is available at `https://<your-service>.onrender.com/openclaw`.

## Render Dashboard features

### Logs

View real-time logs in **Dashboard â†’ your service â†’ Logs**. Filter by:

* Build logs (Docker image creation)
* Deploy logs (service startup)
* Runtime logs (application output)

### Shell access

For debugging, open a shell session via **Dashboard â†’ your service â†’ Shell**. The persistent disk is mounted at `/data`.

### Environment variables

Modify variables in **Dashboard â†’ your service â†’ Environment**. Changes trigger an automatic redeploy.

### Auto-deploy

If you use the original OpenClaw repository, Render will not auto-deploy your OpenClaw. To update it, run a manual Blueprint sync from the dashboard.

## Custom domain

1. Go to **Dashboard â†’ your service â†’ Settings â†’ Custom Domains**
2. Add your domain
3. Configure DNS as instructed (CNAME to `*.onrender.com`)
4. Render provisions a TLS certificate automatically

## Scaling

Render supports horizontal and vertical scaling:

* **Vertical**: Change the plan to get more CPU/RAM
* **Horizontal**: Increase instance count (Standard plan and above)

For OpenClaw, vertical scaling is usually sufficient. Horizontal scaling requires sticky sessions or external state management.

## Backups and migration

Export your configuration and workspace at any time:

```
https://<your-service>.onrender.com/setup/export
```

This downloads a portable backup you can restore on any OpenClaw host.

## Troubleshooting

### Service won't start

Check the deploy logs in the Render Dashboard. Common issues:

* Missing `SETUP_PASSWORD` â€” the Blueprint prompts for this, but verify it's set
* Port mismatch â€” ensure `PORT=8080` matches the Dockerfile's exposed port

### Slow cold starts (free tier)

Free tier services spin down after 15 minutes of inactivity. The first request after spin-down takes a few seconds while the container starts. Upgrade to Starter plan for always-on.

### Data loss after redeploy

This happens on free tier (no persistent disk). Upgrade to a paid plan, or
regularly export your config via `/setup/export`.

### Health check failures

Render expects a 200 response from `/health` within 30 seconds. If builds succeed but deploys fail, the service may be taking too long to start. Check:

* Build logs for errors
* Whether the container runs locally with `docker build && docker run`


Built with [Mintlify](https://mintlify.com).

---

## File: `install/uninstall.md`

Source URL: https://docs.openclaw.ai/install/uninstall.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Uninstall

# Uninstall

Two paths:

* **Easy path** if `openclaw` is still installed.
* **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw uninstall
```

Non-interactive (automation / npx):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw uninstall --all --yes --non-interactive
npx -y openclaw uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway uninstall
```

3. Delete state + config:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
```

If you set `OPENCLAW_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
rm -rf ~/.openclaw/workspace
```

5. Remove the CLI install (pick the one you used):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm rm -g openclaw
pnpm remove -g openclaw
bun remove -g openclaw
```

6. If you installed the macOS app:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
rm -rf /Applications/OpenClaw.app
```

Notes:

* If you used profiles (`--profile` / `OPENCLAW_PROFILE`), repeat step 3 for each state dir (defaults are `~/.openclaw-<profile>`).
* In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `openclaw` is missing.

### macOS (launchd)

Default label is `ai.openclaw.gateway` (or `ai.openclaw.<profile>`; legacy `com.openclaw.*` may still exist):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
launchctl bootout gui/$UID/ai.openclaw.gateway
rm -f ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.openclaw.<profile>`. Remove any legacy `com.openclaw.*` plists if present.

### Linux (systemd user unit)

Default unit name is `openclaw-gateway.service` (or `openclaw-gateway-<profile>.service`):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
systemctl --user disable --now openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `OpenClaw Gateway` (or `OpenClaw Gateway (<profile>)`).
The task script lives under your state dir.

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
schtasks /Delete /F /TN "OpenClaw Gateway"
Remove-Item -Force "$env:USERPROFILE\.openclaw\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.openclaw-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://openclaw.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g openclaw@latest`.
Remove it with `npm rm -g openclaw` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `openclaw ...` / `bun run openclaw ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.


Built with [Mintlify](https://mintlify.com).

---

## File: `install/updating.md`

Source URL: https://docs.openclaw.ai/install/updating.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Updating

# Updating

OpenClaw is moving fast (pre â€œ1.0â€). Treat updates like shipping infra: update â†’ run checks â†’ restart (or use `openclaw update`, which restarts) â†’ verify.

## Recommended: re-run the website installer (upgrade in place)

The **preferred** update path is to re-run the installer from the website. It
detects existing installs, upgrades in place, and runs `openclaw doctor` when
needed.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://openclaw.ai/install.sh | bash
```

Notes:

* Add `--no-onboard` if you donâ€™t want the onboarding wizard to run again.

* For **source installs**, use:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git --no-onboard
  ```

  The installer will `git pull --rebase` **only** if the repo is clean.

* For **global installs**, the script uses `npm install -g openclaw@latest` under the hood.

* Legacy note: `clawdbot` remains available as a compatibility shim.

## Before you update

* Know how you installed: **global** (npm/pnpm) vs **from source** (git clone).
* Know how your Gateway is running: **foreground terminal** vs **supervised service** (launchd/systemd).
* Snapshot your tailoring:
  * Config: `~/.openclaw/openclaw.json`
  * Credentials: `~/.openclaw/credentials/`
  * Workspace: `~/.openclaw/workspace`

## Update (global install)

Global install (pick one):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm i -g openclaw@latest
```

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
pnpm add -g openclaw@latest
```

We do **not** recommend Bun for the Gateway runtime (WhatsApp/Telegram bugs).

To switch update channels (git + npm installs):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw update --channel beta
openclaw update --channel dev
openclaw update --channel stable
```

Use `--tag <dist-tag|version>` for a one-off install tag/version.

See [Development channels](/install/development-channels) for channel semantics and release notes.

Note: on npm installs, the gateway logs an update hint on startup (checks the current channel tag). Disable via `update.checkOnStart: false`.

### Core auto-updater (optional)

Auto-updater is **off by default** and is a core Gateway feature (not a plugin).

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "update": {
    "channel": "stable",
    "auto": {
      "enabled": true,
      "stableDelayHours": 6,
      "stableJitterHours": 12,
      "betaCheckIntervalHours": 1
    }
  }
}
```

Behavior:

* `stable`: when a new version is seen, OpenClaw waits `stableDelayHours` and then applies a deterministic per-install jitter in `stableJitterHours` (spread rollout).
* `beta`: checks on `betaCheckIntervalHours` cadence (default: hourly) and applies when an update is available.
* `dev`: no automatic apply; use manual `openclaw update`.

Use `openclaw update --dry-run` to preview update actions before enabling automation.

Then:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw doctor
openclaw gateway restart
openclaw health
```

Notes:

* If your Gateway runs as a service, `openclaw gateway restart` is preferred over killing PIDs.
* If youâ€™re pinned to a specific version, see â€œRollback / pinningâ€ below.

## Update (`openclaw update`)

For **source installs** (git checkout), prefer:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw update
```

It runs a safe-ish update flow:

* Requires a clean worktree.
* Switches to the selected channel (tag or branch).
* Fetches + rebases against the configured upstream (dev channel).
* Installs deps, builds, builds the Control UI, and runs `openclaw doctor`.
* Restarts the gateway by default (use `--no-restart` to skip).

If you installed via **npm/pnpm** (no git metadata), `openclaw update` will try to update via your package manager. If it canâ€™t detect the install, use â€œUpdate (global install)â€ instead.

## Update (Control UI / RPC)

The Control UI has **Update & Restart** (RPC: `update.run`). It:

1. Runs the same source-update flow as `openclaw update` (git checkout only).
2. Writes a restart sentinel with a structured report (stdout/stderr tail).
3. Restarts the gateway and pings the last active session with the report.

If the rebase fails, the gateway aborts and restarts without applying the update.

## Update (from source)

From the repo checkout:

Preferred:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw update
```

Manual (equivalent-ish):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git pull
pnpm install
pnpm build
pnpm ui:build # auto-installs UI deps on first run
openclaw doctor
openclaw health
```

Notes:

* `pnpm build` matters when you run the packaged `openclaw` binary ([`openclaw.mjs`](https://github.com/openclaw/openclaw/blob/main/openclaw.mjs)) or use Node to run `dist/`.
* If you run from a repo checkout without a global install, use `pnpm openclaw ...` for CLI commands.
* If you run directly from TypeScript (`pnpm openclaw ...`), a rebuild is usually unnecessary, but **config migrations still apply** â†’ run doctor.
* Switching between global and git installs is easy: install the other flavor, then run `openclaw doctor` so the gateway service entrypoint is rewritten to the current install.

## Always Run: `openclaw doctor`

Doctor is the â€œsafe updateâ€ command. Itâ€™s intentionally boring: repair + migrate + warn.

Note: if youâ€™re on a **source install** (git checkout), `openclaw doctor` will offer to run `openclaw update` first.

Typical things it does:

* Migrate deprecated config keys / legacy config file locations.
* Audit DM policies and warn on risky â€œopenâ€ settings.
* Check Gateway health and can offer to restart.
* Detect and migrate older gateway services (launchd/systemd; legacy schtasks) to current OpenClaw services.
* On Linux, ensure systemd user lingering (so the Gateway survives logout).

Details: [Doctor](/gateway/doctor)

## Start / stop / restart the Gateway

CLI (works regardless of OS):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway status
openclaw gateway stop
openclaw gateway restart
openclaw gateway --port 18789
openclaw logs --follow
```

If youâ€™re supervised:

* macOS launchd (app-bundled LaunchAgent): `launchctl kickstart -k gui/$UID/ai.openclaw.gateway` (use `ai.openclaw.<profile>`; legacy `com.openclaw.*` still works)
* Linux systemd user service: `systemctl --user restart openclaw-gateway[-<profile>].service`
* Windows (WSL2): `systemctl --user restart openclaw-gateway[-<profile>].service`
  * `launchctl`/`systemctl` only work if the service is installed; otherwise run `openclaw gateway install`.

Runbook + exact service labels: [Gateway runbook](/gateway)

## Rollback / pinning (when something breaks)

### Pin (global install)

Install a known-good version (replace `<version>` with the last working one):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm i -g openclaw@<version>
```

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
pnpm add -g openclaw@<version>
```

Tip: to see the current published version, run `npm view openclaw version`.

Then restart + re-run doctor:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw doctor
openclaw gateway restart
```

### Pin (source) by date

Pick a commit from a date (example: â€œstate of main as of 2026-01-01â€):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
```

Then reinstall deps + restart:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
pnpm install
pnpm build
openclaw gateway restart
```

If you want to go back to latest later:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git checkout main
git pull
```

## If youâ€™re stuck

* Run `openclaw doctor` again and read the output carefully (it often tells you the fix).
* Check: [Troubleshooting](/gateway/troubleshooting)
* Ask in Discord: [https://discord.gg/clawd](https://discord.gg/clawd)


Built with [Mintlify](https://mintlify.com).

---

