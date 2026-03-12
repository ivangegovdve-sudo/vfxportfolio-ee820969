# Platforms

Source category: `Platforms`

Files included: 27

---

## File: `platforms/android.md`

Source URL: https://docs.openclaw.ai/platforms/android.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Android App

# Android App (Node)

## Support snapshot

* Role: companion node app (Android does not host the Gateway).
* Gateway required: yes (run it on macOS, Linux, or Windows via WSL2).
* Install: [Getting Started](/start/getting-started) + [Pairing](/channels/pairing).
* Gateway: [Runbook](/gateway) + [Configuration](/gateway/configuration).
  * Protocols: [Gateway protocol](/gateway/protocol) (nodes + control plane).

## System control

System control (launchd/systemd) lives on the Gateway host. See [Gateway](/gateway).

## Connection Runbook

Android node app â‡„ (mDNS/NSD + WebSocket) â‡„ **Gateway**

Android connects directly to the Gateway WebSocket (default `ws://<host>:18789`) and uses device pairing (`role: node`).

### Prerequisites

* You can run the Gateway on the â€œmasterâ€ machine.
* Android device/emulator can reach the gateway WebSocket:
  * Same LAN with mDNS/NSD, **or**
  * Same Tailscale tailnet using Wide-Area Bonjour / unicast DNS-SD (see below), **or**
  * Manual gateway host/port (fallback)
* You can run the CLI (`openclaw`) on the gateway machine (or via SSH).

### 1) Start the Gateway

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway --port 18789 --verbose
```

Confirm in logs you see something like:

* `listening on ws://0.0.0.0:18789`

For tailnet-only setups (recommended for Vienna â‡„ London), bind the gateway to the tailnet IP:

* Set `gateway.bind: "tailnet"` in `~/.openclaw/openclaw.json` on the gateway host.
* Restart the Gateway / macOS menubar app.

### 2) Verify discovery (optional)

From the gateway machine:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
dns-sd -B _openclaw-gw._tcp local.
```

More debugging notes: [Bonjour](/gateway/bonjour).

#### Tailnet (Vienna â‡„ London) discovery via unicast DNS-SD

Android NSD/mDNS discovery wonâ€™t cross networks. If your Android node and the gateway are on different networks but connected via Tailscale, use Wide-Area Bonjour / unicast DNS-SD instead:

1. Set up a DNS-SD zone (example `openclaw.internal.`) on the gateway host and publish `_openclaw-gw._tcp` records.
2. Configure Tailscale split DNS for your chosen domain pointing at that DNS server.

Details and example CoreDNS config: [Bonjour](/gateway/bonjour).

### 3) Connect from Android

In the Android app:

* The app keeps its gateway connection alive via a **foreground service** (persistent notification).
* Open the **Connect** tab.
* Use **Setup Code** or **Manual** mode.
* If discovery is blocked, use manual host/port (and TLS/token/password when required) in **Advanced controls**.

After the first successful pairing, Android auto-reconnects on launch:

* Manual endpoint (if enabled), otherwise
* The last discovered gateway (best-effort).

### 4) Approve pairing (CLI)

On the gateway machine:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
```

Pairing details: [Pairing](/channels/pairing).

### 5) Verify the node is connected

* Via nodes status:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  openclaw nodes status
  ```

* Via Gateway:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  openclaw gateway call node.list --params "{}"
  ```

### 6) Chat + history

The Android Chat tab supports session selection (default `main`, plus other existing sessions):

* History: `chat.history`
* Send: `chat.send`
* Push updates (best-effort): `chat.subscribe` â†’ `event:"chat"`

### 7) Canvas + camera

#### Gateway Canvas Host (recommended for web content)

If you want the node to show real HTML/CSS/JS that the agent can edit on disk, point the node at the Gateway canvas host.

Note: nodes load canvas from the Gateway HTTP server (same port as `gateway.port`, default `18789`).

1. Create `~/.openclaw/workspace/canvas/index.html` on the gateway host.

2. Navigate the node to it (LAN):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes invoke --node "<Android Node>" --command canvas.navigate --params '{"url":"http://<gateway-hostname>.local:18789/__openclaw__/canvas/"}'
```

Tailnet (optional): if both devices are on Tailscale, use a MagicDNS name or tailnet IP instead of `.local`, e.g. `http://<gateway-magicdns>:18789/__openclaw__/canvas/`.

This server injects a live-reload client into HTML and reloads on file changes.
The A2UI host lives at `http://<gateway-host>:18789/__openclaw__/a2ui/`.

Canvas commands (foreground only):

* `canvas.eval`, `canvas.snapshot`, `canvas.navigate` (use `{"url":""}` or `{"url":"/"}` to return to the default scaffold). `canvas.snapshot` returns `{ format, base64 }` (default `format="jpeg"`).
* A2UI: `canvas.a2ui.push`, `canvas.a2ui.reset` (`canvas.a2ui.pushJSONL` legacy alias)

Camera commands (foreground only; permission-gated):

* `camera.snap` (jpg)
* `camera.clip` (mp4)

See [Camera node](/nodes/camera) for parameters and CLI helpers.

### 8) Voice + expanded Android command surface

* Voice: Android uses a single mic on/off flow in the Voice tab with transcript capture and TTS playback (ElevenLabs when configured, system TTS fallback). Voice stops when the app leaves the foreground.
* Voice wake/talk-mode toggles are currently removed from Android UX/runtime.
* Additional Android command families (availability depends on device + permissions):
  * `device.status`, `device.info`, `device.permissions`, `device.health`
  * `notifications.list`, `notifications.actions`
  * `photos.latest`
  * `contacts.search`, `contacts.add`
  * `calendar.events`, `calendar.add`
  * `motion.activity`, `motion.pedometer`


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/digitalocean.md`

Source URL: https://docs.openclaw.ai/platforms/digitalocean.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# DigitalOcean

# OpenClaw on DigitalOcean

## Goal

Run a persistent OpenClaw Gateway on DigitalOcean for \*\*$6/month** (or $4/mo with reserved pricing).

If you want a \$0/month option and donâ€™t mind ARM + provider-specific setup, see the [Oracle Cloud guide](/platforms/oracle).

## Cost Comparison (2026)

| Provider     | Plan            | Specs                  | Price/mo      | Notes                                 |
| ------------ | --------------- | ---------------------- | ------------- | ------------------------------------- |
| Oracle Cloud | Always Free ARM | up to 4 OCPU, 24GB RAM | \$0           | ARM, limited capacity / signup quirks |
| Hetzner      | CX22            | 2 vCPU, 4GB RAM        | â‚¬3.79 (\~\$4) | Cheapest paid option                  |
| DigitalOcean | Basic           | 1 vCPU, 1GB RAM        | \$6           | Easy UI, good docs                    |
| Vultr        | Cloud Compute   | 1 vCPU, 1GB RAM        | \$6           | Many locations                        |
| Linode       | Nanode          | 1 vCPU, 1GB RAM        | \$5           | Now part of Akamai                    |

**Picking a provider:**

* DigitalOcean: simplest UX + predictable setup (this guide)
* Hetzner: good price/perf (see [Hetzner guide](/install/hetzner))
* Oracle Cloud: can be \$0/month, but is more finicky and ARM-only (see [Oracle guide](/platforms/oracle))

***

## Prerequisites

* DigitalOcean account ([signup with \$200 free credit](https://m.do.co/c/signup))
* SSH key pair (or willingness to use password auth)
* \~20 minutes

## 1) Create a Droplet

<Warning>
  Use a clean base image (Ubuntu 24.04 LTS). Avoid third-party Marketplace 1-click images unless you have reviewed their startup scripts and firewall defaults.
</Warning>

1. Log into [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create â†’ Droplets**
3. Choose:
   * **Region:** Closest to you (or your users)
   * **Image:** Ubuntu 24.04 LTS
   * **Size:** Basic â†’ Regular â†’ **\$6/mo** (1 vCPU, 1GB RAM, 25GB SSD)
   * **Authentication:** SSH key (recommended) or password
4. Click **Create Droplet**
5. Note the IP address

## 2) Connect via SSH

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh root@YOUR_DROPLET_IP
```

## 3) Install OpenClaw

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Update system
apt update && apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# Verify
openclaw --version
```

## 4) Run Onboarding

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw onboard --install-daemon
```

The wizard will walk you through:

* Model auth (API keys or OAuth)
* Channel setup (Telegram, WhatsApp, Discord, etc.)
* Gateway token (auto-generated)
* Daemon installation (systemd)

## 5) Verify the Gateway

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check status
openclaw status

# Check service
systemctl --user status openclaw-gateway.service

# View logs
journalctl --user -u openclaw-gateway.service -f
```

## 6) Access the Dashboard

The gateway binds to loopback by default. To access the Control UI:

**Option A: SSH Tunnel (recommended)**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# From your local machine
ssh -L 18789:localhost:18789 root@YOUR_DROPLET_IP

# Then open: http://localhost:18789
```

**Option B: Tailscale Serve (HTTPS, loopback-only)**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# On the droplet
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# Configure Gateway to use Tailscale Serve
openclaw config set gateway.tailscale.mode serve
openclaw gateway restart
```

Open: `https://<magicdns>/`

Notes:

* Serve keeps the Gateway loopback-only and authenticates Control UI/WebSocket traffic via Tailscale identity headers (tokenless auth assumes trusted gateway host; HTTP APIs still require token/password).
* To require token/password instead, set `gateway.auth.allowTailscale: false` or use `gateway.auth.mode: "password"`.

**Option C: Tailnet bind (no Serve)**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw config set gateway.bind tailnet
openclaw gateway restart
```

Open: `http://<tailscale-ip>:18789` (token required).

## 7) Connect Your Channels

### Telegram

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

### WhatsApp

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw channels login whatsapp
# Scan QR code
```

See [Channels](/channels) for other providers.

***

## Optimizations for 1GB RAM

The \$6 droplet only has 1GB RAM. To keep things running smoothly:

### Add swap (recommended)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Use a lighter model

If you're hitting OOMs, consider:

* Using API-based models (Claude, GPT) instead of local models
* Setting `agents.defaults.model.primary` to a smaller model

### Monitor memory

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
free -h
htop
```

***

## Persistence

All state lives in:

* `~/.openclaw/` â€” config, credentials, session data
* `~/.openclaw/workspace/` â€” workspace (SOUL.md, memory, etc.)

These survive reboots. Back them up periodically:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
tar -czvf openclaw-backup.tar.gz ~/.openclaw ~/.openclaw/workspace
```

***

## Oracle Cloud Free Alternative

Oracle Cloud offers **Always Free** ARM instances that are significantly more powerful than any paid option here â€” for \$0/month.

| What you get      | Specs                  |
| ----------------- | ---------------------- |
| **4 OCPUs**       | ARM Ampere A1          |
| **24GB RAM**      | More than enough       |
| **200GB storage** | Block volume           |
| **Forever free**  | No credit card charges |

**Caveats:**

* Signup can be finicky (retry if it fails)
* ARM architecture â€” most things work, but some binaries need ARM builds

For the full setup guide, see [Oracle Cloud](/platforms/oracle). For signup tips and troubleshooting the enrollment process, see this [community guide](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd).

***

## Troubleshooting

### Gateway won't start

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway status
openclaw doctor --non-interactive
journalctl -u openclaw --no-pager -n 50
```

### Port already in use

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
lsof -i :18789
kill <PID>
```

### Out of memory

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check memory
free -h

# Add more swap
# Or upgrade to $12/mo droplet (2GB RAM)
```

***

## See Also

* [Hetzner guide](/install/hetzner) â€” cheaper, more powerful
* [Docker install](/install/docker) â€” containerized setup
* [Tailscale](/gateway/tailscale) â€” secure remote access
* [Configuration](/gateway/configuration) â€” full config reference


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/index.md`

Source URL: https://docs.openclaw.ai/platforms/index.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Platforms

# Platforms

OpenClaw core is written in TypeScript. **Node is the recommended runtime**.
Bun is not recommended for the Gateway (WhatsApp/Telegram bugs).

Companion apps exist for macOS (menu bar app) and mobile nodes (iOS/Android). Windows and
Linux companion apps are planned, but the Gateway is fully supported today.
Native companion apps for Windows are also planned; the Gateway is recommended via WSL2.

## Choose your OS

* macOS: [macOS](/platforms/macos)
* iOS: [iOS](/platforms/ios)
* Android: [Android](/platforms/android)
* Windows: [Windows](/platforms/windows)
* Linux: [Linux](/platforms/linux)

## VPS & hosting

* VPS hub: [VPS hosting](/vps)
* Fly.io: [Fly.io](/install/fly)
* Hetzner (Docker): [Hetzner](/install/hetzner)
* GCP (Compute Engine): [GCP](/install/gcp)
* exe.dev (VM + HTTPS proxy): [exe.dev](/install/exe-dev)

## Common links

* Install guide: [Getting Started](/start/getting-started)
* Gateway runbook: [Gateway](/gateway)
* Gateway configuration: [Configuration](/gateway/configuration)
* Service status: `openclaw gateway status`

## Gateway service install (CLI)

Use one of these (all supported):

* Wizard (recommended): `openclaw onboard --install-daemon`
* Direct: `openclaw gateway install`
* Configure flow: `openclaw configure` â†’ select **Gateway service**
* Repair/migrate: `openclaw doctor` (offers to install or fix the service)

The service target depends on OS:

* macOS: LaunchAgent (`ai.openclaw.gateway` or `ai.openclaw.<profile>`; legacy `com.openclaw.*`)
* Linux/WSL2: systemd user service (`openclaw-gateway[-<profile>].service`)


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/ios.md`

Source URL: https://docs.openclaw.ai/platforms/ios.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# iOS App

# iOS App (Node)

Availability: internal preview. The iOS app is not publicly distributed yet.

## What it does

* Connects to a Gateway over WebSocket (LAN or tailnet).
* Exposes node capabilities: Canvas, Screen snapshot, Camera capture, Location, Talk mode, Voice wake.
* Receives `node.invoke` commands and reports node status events.

## Requirements

* Gateway running on another device (macOS, Linux, or Windows via WSL2).
* Network path:
  * Same LAN via Bonjour, **or**
  * Tailnet via unicast DNS-SD (example domain: `openclaw.internal.`), **or**
  * Manual host/port (fallback).

## Quick start (pair + connect)

1. Start the Gateway:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway --port 18789
```

2. In the iOS app, open Settings and pick a discovered gateway (or enable Manual Host and enter host/port).

3. Approve the pairing request on the gateway host:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw devices list
openclaw devices approve <requestId>
```

4. Verify connection:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes status
openclaw gateway call node.list --params "{}"
```

## Discovery paths

### Bonjour (LAN)

The Gateway advertises `_openclaw-gw._tcp` on `local.`. The iOS app lists these automatically.

### Tailnet (cross-network)

If mDNS is blocked, use a unicast DNS-SD zone (choose a domain; example: `openclaw.internal.`) and Tailscale split DNS.
See [Bonjour](/gateway/bonjour) for the CoreDNS example.

### Manual host/port

In Settings, enable **Manual Host** and enter the gateway host + port (default `18789`).

## Canvas + A2UI

The iOS node renders a WKWebView canvas. Use `node.invoke` to drive it:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18789/__openclaw__/canvas/"}'
```

Notes:

* The Gateway canvas host serves `/__openclaw__/canvas/` and `/__openclaw__/a2ui/`.
* It is served from the Gateway HTTP server (same port as `gateway.port`, default `18789`).
* The iOS node auto-navigates to A2UI on connect when a canvas host URL is advertised.
* Return to the built-in scaffold with `canvas.navigate` and `{"url":""}`.

### Canvas eval / snapshot

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__openclaw; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'
```

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes invoke --node "iOS Node" --command canvas.snapshot --params '{"maxWidth":900,"format":"jpeg"}'
```

## Voice wake + talk mode

* Voice wake and talk mode are available in Settings.
* iOS may suspend background audio; treat voice features as best-effort when the app is not active.

## Common errors

* `NODE_BACKGROUND_UNAVAILABLE`: bring the iOS app to the foreground (canvas/camera/screen commands require it).
* `A2UI_HOST_NOT_CONFIGURED`: the Gateway did not advertise a canvas host URL; check `canvasHost` in [Gateway configuration](/gateway/configuration).
* Pairing prompt never appears: run `openclaw devices list` and approve manually.
* Reconnect fails after reinstall: the Keychain pairing token was cleared; re-pair the node.

## Related docs

* [Pairing](/channels/pairing)
* [Discovery](/gateway/discovery)
* [Bonjour](/gateway/bonjour)


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/linux.md`

Source URL: https://docs.openclaw.ai/platforms/linux.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Linux App

# Linux App

The Gateway is fully supported on Linux. **Node is the recommended runtime**.
Bun is not recommended for the Gateway (WhatsApp/Telegram bugs).

Native Linux companion apps are planned. Contributions are welcome if you want to help build one.

## Beginner quick path (VPS)

1. Install Node 22+
2. `npm i -g openclaw@latest`
3. `openclaw onboard --install-daemon`
4. From your laptop: `ssh -N -L 18789:127.0.0.1:18789 <user>@<host>`
5. Open `http://127.0.0.1:18789/` and paste your token

Step-by-step VPS guide: [exe.dev](/install/exe-dev)

## Install

* [Getting Started](/start/getting-started)
* [Install & updates](/install/updating)
* Optional flows: [Bun (experimental)](/install/bun), [Nix](/install/nix), [Docker](/install/docker)

## Gateway

* [Gateway runbook](/gateway)
* [Configuration](/gateway/configuration)

## Gateway service install (CLI)

Use one of these:

```
openclaw onboard --install-daemon
```

Or:

```
openclaw gateway install
```

Or:

```
openclaw configure
```

Select **Gateway service** when prompted.

Repair/migrate:

```
openclaw doctor
```

## System control (systemd user unit)

OpenClaw installs a systemd **user** service by default. Use a **system**
service for shared or always-on servers. The full unit example and guidance
live in the [Gateway runbook](/gateway).

Minimal setup:

Create `~/.config/systemd/user/openclaw-gateway[-<profile>].service`:

```
[Unit]
Description=OpenClaw Gateway (profile: <profile>, v<version>)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/openclaw gateway --port 18789
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

Enable it:

```
systemctl --user enable --now openclaw-gateway[-<profile>].service
```


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/bundled-gateway.md`

Source URL: https://docs.openclaw.ai/platforms/mac/bundled-gateway.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Gateway on macOS

# Gateway on macOS (external launchd)

OpenClaw\.app no longer bundles Node/Bun or the Gateway runtime. The macOS app
expects an **external** `openclaw` CLI install, does not spawn the Gateway as a
child process, and manages a perâ€‘user launchd service to keep the Gateway
running (or attaches to an existing local Gateway if one is already running).

## Install the CLI (required for local mode)

You need Node 22+ on the Mac, then install `openclaw` globally:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm install -g openclaw@<version>
```

The macOS appâ€™s **Install CLI** button runs the same flow via npm/pnpm (bun not recommended for Gateway runtime).

## Launchd (Gateway as LaunchAgent)

Label:

* `ai.openclaw.gateway` (or `ai.openclaw.<profile>`; legacy `com.openclaw.*` may remain)

Plist location (perâ€‘user):

* `~/Library/LaunchAgents/ai.openclaw.gateway.plist`
  (or `~/Library/LaunchAgents/ai.openclaw.<profile>.plist`)

Manager:

* The macOS app owns LaunchAgent install/update in Local mode.
* The CLI can also install it: `openclaw gateway install`.

Behavior:

* â€œOpenClaw Activeâ€ enables/disables the LaunchAgent.
* App quit does **not** stop the gateway (launchd keeps it alive).
* If a Gateway is already running on the configured port, the app attaches to
  it instead of starting a new one.

Logging:

* launchd stdout/err: `/tmp/openclaw/openclaw-gateway.log`

## Version compatibility

The macOS app checks the gateway version against its own version. If theyâ€™re
incompatible, update the global CLI to match the app version.

## Smoke check

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw --version

OPENCLAW_SKIP_CHANNELS=1 \
OPENCLAW_SKIP_CANVAS_HOST=1 \
openclaw gateway --port 18999 --bind loopback
```

Then:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/canvas.md`

Source URL: https://docs.openclaw.ai/platforms/mac/canvas.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Canvas

# Canvas (macOS app)

The macOS app embeds an agentâ€‘controlled **Canvas panel** using `WKWebView`. It
is a lightweight visual workspace for HTML/CSS/JS, A2UI, and small interactive
UI surfaces.

## Where Canvas lives

Canvas state is stored under Application Support:

* `~/Library/Application Support/OpenClaw/canvas/<session>/...`

The Canvas panel serves those files via a **custom URL scheme**:

* `openclaw-canvas://<session>/<path>`

Examples:

* `openclaw-canvas://main/` â†’ `<canvasRoot>/main/index.html`
* `openclaw-canvas://main/assets/app.css` â†’ `<canvasRoot>/main/assets/app.css`
* `openclaw-canvas://main/widgets/todo/` â†’ `<canvasRoot>/main/widgets/todo/index.html`

If no `index.html` exists at the root, the app shows a **builtâ€‘in scaffold page**.

## Panel behavior

* Borderless, resizable panel anchored near the menu bar (or mouse cursor).
* Remembers size/position per session.
* Autoâ€‘reloads when local canvas files change.
* Only one Canvas panel is visible at a time (session is switched as needed).

Canvas can be disabled from Settings â†’ **Allow Canvas**. When disabled, canvas
node commands return `CANVAS_DISABLED`.

## Agent API surface

Canvas is exposed via the **Gateway WebSocket**, so the agent can:

* show/hide the panel
* navigate to a path or URL
* evaluate JavaScript
* capture a snapshot image

CLI examples:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes canvas present --node <id>
openclaw nodes canvas navigate --node <id> --url "/"
openclaw nodes canvas eval --node <id> --js "document.title"
openclaw nodes canvas snapshot --node <id>
```

Notes:

* `canvas.navigate` accepts **local canvas paths**, `http(s)` URLs, and `file://` URLs.
* If you pass `"/"`, the Canvas shows the local scaffold or `index.html`.

## A2UI in Canvas

A2UI is hosted by the Gateway canvas host and rendered inside the Canvas panel.
When the Gateway advertises a Canvas host, the macOS app autoâ€‘navigates to the
A2UI host page on first open.

Default A2UI host URL:

```
http://<gateway-host>:18789/__openclaw__/a2ui/
```

### A2UI commands (v0.8)

Canvas currently accepts **A2UI v0.8** serverâ†’client messages:

* `beginRendering`
* `surfaceUpdate`
* `dataModelUpdate`
* `deleteSurface`

`createSurface` (v0.9) is not supported.

CLI example:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cat > /tmp/a2ui-v0.8.jsonl <<'EOFA2'
{"surfaceUpdate":{"surfaceId":"main","components":[{"id":"root","component":{"Column":{"children":{"explicitList":["title","content"]}}}},{"id":"title","component":{"Text":{"text":{"literalString":"Canvas (A2UI v0.8)"},"usageHint":"h1"}}},{"id":"content","component":{"Text":{"text":{"literalString":"If you can read this, A2UI push works."},"usageHint":"body"}}}]}}
{"beginRendering":{"surfaceId":"main","root":"root"}}
EOFA2

openclaw nodes canvas a2ui push --jsonl /tmp/a2ui-v0.8.jsonl --node <id>
```

Quick smoke:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes canvas a2ui push --node <id> --text "Hello from A2UI"
```

## Triggering agent runs from Canvas

Canvas can trigger new agent runs via deep links:

* `openclaw://agent?...`

Example (in JS):

```js  theme={"theme":{"light":"min-light","dark":"min-dark"}}
window.location.href = "openclaw://agent?message=Review%20this%20design";
```

The app prompts for confirmation unless a valid key is provided.

## Security notes

* Canvas scheme blocks directory traversal; files must live under the session root.
* Local Canvas content uses a custom scheme (no loopback server required).
* External `http(s)` URLs are allowed only when explicitly navigated.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/child-process.md`

Source URL: https://docs.openclaw.ai/platforms/mac/child-process.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Gateway Lifecycle

# Gateway lifecycle on macOS

The macOS app **manages the Gateway via launchd** by default and does not spawn
the Gateway as a child process. It first tries to attach to an alreadyâ€‘running
Gateway on the configured port; if none is reachable, it enables the launchd
service via the external `openclaw` CLI (no embedded runtime). This gives you
reliable autoâ€‘start at login and restart on crashes.

Childâ€‘process mode (Gateway spawned directly by the app) is **not in use** today.
If you need tighter coupling to the UI, run the Gateway manually in a terminal.

## Default behavior (launchd)

* The app installs a perâ€‘user LaunchAgent labeled `ai.openclaw.gateway`
  (or `ai.openclaw.<profile>` when using `--profile`/`OPENCLAW_PROFILE`; legacy `com.openclaw.*` is supported).
* When Local mode is enabled, the app ensures the LaunchAgent is loaded and
  starts the Gateway if needed.
* Logs are written to the launchd gateway log path (visible in Debug Settings).

Common commands:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
launchctl kickstart -k gui/$UID/ai.openclaw.gateway
launchctl bootout gui/$UID/ai.openclaw.gateway
```

Replace the label with `ai.openclaw.<profile>` when running a named profile.

## Unsigned dev builds

`scripts/restart-mac.sh --no-sign` is for fast local builds when you donâ€™t have
signing keys. To prevent launchd from pointing at an unsigned relay binary, it:

* Writes `~/.openclaw/disable-launchagent`.

Signed runs of `scripts/restart-mac.sh` clear this override if the marker is
present. To reset manually:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
rm ~/.openclaw/disable-launchagent
```

## Attach-only mode

To force the macOS app to **never install or manage launchd**, launch it with
`--attach-only` (or `--no-launchd`). This sets `~/.openclaw/disable-launchagent`,
so the app only attaches to an already running Gateway. You can toggle the same
behavior in Debug Settings.

## Remote mode

Remote mode never starts a local Gateway. The app uses an SSH tunnel to the
remote host and connects over that tunnel.

## Why we prefer launchd

* Autoâ€‘start at login.
* Builtâ€‘in restart/KeepAlive semantics.
* Predictable logs and supervision.

If a true childâ€‘process mode is ever needed again, it should be documented as a
separate, explicit devâ€‘only mode.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/dev-setup.md`

Source URL: https://docs.openclaw.ai/platforms/mac/dev-setup.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS Dev Setup

# macOS Developer Setup

This guide covers the necessary steps to build and run the OpenClaw macOS application from source.

## Prerequisites

Before building the app, ensure you have the following installed:

1. **Xcode 26.2+**: Required for Swift development.
2. **Node.js 22+ & pnpm**: Required for the gateway, CLI, and packaging scripts.

## 1. Install Dependencies

Install the project-wide dependencies:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
pnpm install
```

## 2. Build and Package the App

To build the macOS app and package it into `dist/OpenClaw.app`, run:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
./scripts/package-mac-app.sh
```

If you don't have an Apple Developer ID certificate, the script will automatically use **ad-hoc signing** (`-`).

For dev run modes, signing flags, and Team ID troubleshooting, see the macOS app README:
[https://github.com/openclaw/openclaw/blob/main/apps/macos/README.md](https://github.com/openclaw/openclaw/blob/main/apps/macos/README.md)

> **Note**: Ad-hoc signed apps may trigger security prompts. If the app crashes immediately with "Abort trap 6", see the [Troubleshooting](#troubleshooting) section.

## 3. Install the CLI

The macOS app expects a global `openclaw` CLI install to manage background tasks.

**To install it (recommended):**

1. Open the OpenClaw app.
2. Go to the **General** settings tab.
3. Click **"Install CLI"**.

Alternatively, install it manually:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
npm install -g openclaw@<version>
```

## Troubleshooting

### Build Fails: Toolchain or SDK Mismatch

The macOS app build expects the latest macOS SDK and Swift 6.2 toolchain.

**System dependencies (required):**

* **Latest macOS version available in Software Update** (required by Xcode 26.2 SDKs)
* **Xcode 26.2** (Swift 6.2 toolchain)

**Checks:**

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
xcodebuild -version
xcrun swift --version
```

If versions donâ€™t match, update macOS/Xcode and re-run the build.

### App Crashes on Permission Grant

If the app crashes when you try to allow **Speech Recognition** or **Microphone** access, it may be due to a corrupted TCC cache or signature mismatch.

**Fix:**

1. Reset the TCC permissions:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   tccutil reset All ai.openclaw.mac.debug
   ```

2. If that fails, change the `BUNDLE_ID` temporarily in [`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh) to force a "clean slate" from macOS.

### Gateway "Starting..." indefinitely

If the gateway status stays on "Starting...", check if a zombie process is holding the port:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway status
openclaw gateway stop

# If youâ€™re not using a LaunchAgent (dev mode / manual runs), find the listener:
lsof -nP -iTCP:18789 -sTCP:LISTEN
```

If a manual run is holding the port, stop that process (Ctrl+C). As a last resort, kill the PID you found above.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/health.md`

Source URL: https://docs.openclaw.ai/platforms/mac/health.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Health Checks

# Health Checks on macOS

How to see whether the linked channel is healthy from the menu bar app.

## Menu bar

* Status dot now reflects Baileys health:
  * Green: linked + socket opened recently.
  * Orange: connecting/retrying.
  * Red: logged out or probe failed.
* Secondary line reads "linked Â· auth 12m" or shows the failure reason.
* "Run Health Check" menu item triggers an on-demand probe.

## Settings

* General tab gains a Health card showing: linked auth age, session-store path/count, last check time, last error/status code, and buttons for Run Health Check / Reveal Logs.
* Uses a cached snapshot so the UI loads instantly and falls back gracefully when offline.
* **Channels tab** surfaces channel status + controls for WhatsApp/Telegram (login QR, logout, probe, last disconnect/error).

## How the probe works

* App runs `openclaw health --json` via `ShellExecutor` every \~60s and on demand. The probe loads creds and reports status without sending messages.
* Cache the last good snapshot and the last error separately to avoid flicker; show the timestamp of each.

## When in doubt

* You can still use the CLI flow in [Gateway health](/gateway/health) (`openclaw status`, `openclaw status --deep`, `openclaw health --json`) and tail `/tmp/openclaw/openclaw-*.log` for `web-heartbeat` / `web-reconnect`.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/icon.md`

Source URL: https://docs.openclaw.ai/platforms/mac/icon.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Menu Bar Icon

# Menu Bar Icon States

Author: steipete Â· Updated: 2025-12-06 Â· Scope: macOS app (`apps/macos`)

* **Idle:** Normal icon animation (blink, occasional wiggle).
* **Paused:** Status item uses `appearsDisabled`; no motion.
* **Voice trigger (big ears):** Voice wake detector calls `AppState.triggerVoiceEars(ttl: nil)` when the wake word is heard, keeping `earBoostActive=true` while the utterance is captured. Ears scale up (1.9x), get circular ear holes for readability, then drop via `stopVoiceEars()` after 1s of silence. Only fired from the in-app voice pipeline.
* **Working (agent running):** `AppState.isWorking=true` drives a â€œtail/leg scurryâ€ micro-motion: faster leg wiggle and slight offset while work is in-flight. Currently toggled around WebChat agent runs; add the same toggle around other long tasks when you wire them.

Wiring points

* Voice wake: runtime/tester call `AppState.triggerVoiceEars(ttl: nil)` on trigger and `stopVoiceEars()` after 1s of silence to match the capture window.
* Agent activity: set `AppStateStore.shared.setWorking(true/false)` around work spans (already done in WebChat agent call). Keep spans short and reset in `defer` blocks to avoid stuck animations.

Shapes & sizes

* Base icon drawn in `CritterIconRenderer.makeIcon(blink:legWiggle:earWiggle:earScale:earHoles:)`.
* Ear scale defaults to `1.0`; voice boost sets `earScale=1.9` and toggles `earHoles=true` without changing overall frame (18Ã—18â€¯pt template image rendered into a 36Ã—36â€¯px Retina backing store).
* Scurry uses leg wiggle up to \~1.0 with a small horizontal jiggle; itâ€™s additive to any existing idle wiggle.

Behavioral notes

* No external CLI/broker toggle for ears/working; keep it internal to the appâ€™s own signals to avoid accidental flapping.
* Keep TTLs short (\<10s) so the icon returns to baseline quickly if a job hangs.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/logging.md`

Source URL: https://docs.openclaw.ai/platforms/mac/logging.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS Logging

# Logging (macOS)

## Rolling diagnostics file log (Debug pane)

OpenClaw routes macOS app logs through swift-log (unified logging by default) and can write a local, rotating file log to disk when you need a durable capture.

* Verbosity: **Debug pane â†’ Logs â†’ App logging â†’ Verbosity**
* Enable: **Debug pane â†’ Logs â†’ App logging â†’ â€œWrite rolling diagnostics log (JSONL)â€**
* Location: `~/Library/Logs/OpenClaw/diagnostics.jsonl` (rotates automatically; old files are suffixed with `.1`, `.2`, â€¦)
* Clear: **Debug pane â†’ Logs â†’ App logging â†’ â€œClearâ€**

Notes:

* This is **off by default**. Enable only while actively debugging.
* Treat the file as sensitive; donâ€™t share it without review.

## Unified logging private data on macOS

Unified logging redacts most payloads unless a subsystem opts into `privacy -off`. Per Peter's write-up on macOS [logging privacy shenanigans](https://steipete.me/posts/2025/logging-privacy-shenanigans) (2025) this is controlled by a plist in `/Library/Preferences/Logging/Subsystems/` keyed by the subsystem name. Only new log entries pick up the flag, so enable it before reproducing an issue.

## Enable for OpenClaw (`ai.openclaw`)

* Write the plist to a temp file first, then install it atomically as root:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cat <<'EOF' >/tmp/ai.openclaw.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>DEFAULT-OPTIONS</key>
    <dict>
        <key>Enable-Private-Data</key>
        <true/>
    </dict>
</dict>
</plist>
EOF
sudo install -m 644 -o root -g wheel /tmp/ai.openclaw.plist /Library/Preferences/Logging/Subsystems/ai.openclaw.plist
```

* No reboot is required; logd notices the file quickly, but only new log lines will include private payloads.
* View the richer output with the existing helper, e.g. `./scripts/clawlog.sh --category WebChat --last 5m`.

## Disable after debugging

* Remove the override: `sudo rm /Library/Preferences/Logging/Subsystems/ai.openclaw.plist`.
* Optionally run `sudo log config --reload` to force logd to drop the override immediately.
* Remember this surface can include phone numbers and message bodies; keep the plist in place only while you actively need the extra detail.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/menu-bar.md`

Source URL: https://docs.openclaw.ai/platforms/mac/menu-bar.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Menu Bar

# Menu Bar Status Logic

## What is shown

* We surface the current agent work state in the menu bar icon and in the first status row of the menu.
* Health status is hidden while work is active; it returns when all sessions are idle.
* The â€œNodesâ€ block in the menu lists **devices** only (paired nodes via `node.list`), not client/presence entries.
* A â€œUsageâ€ section appears under Context when provider usage snapshots are available.

## State model

* Sessions: events arrive with `runId` (per-run) plus `sessionKey` in the payload. The â€œmainâ€ session is the key `main`; if absent, we fall back to the most recently updated session.
* Priority: main always wins. If main is active, its state is shown immediately. If main is idle, the most recently active nonâ€‘main session is shown. We do not flipâ€‘flop midâ€‘activity; we only switch when the current session goes idle or main becomes active.
* Activity kinds:
  * `job`: highâ€‘level command execution (`state: started|streaming|done|error`).
  * `tool`: `phase: start|result` with `toolName` and `meta/args`.

## IconState enum (Swift)

* `idle`
* `workingMain(ActivityKind)`
* `workingOther(ActivityKind)`
* `overridden(ActivityKind)` (debug override)

### ActivityKind â†’ glyph

* `exec` â†’ ðŸ’»
* `read` â†’ ðŸ“„
* `write` â†’ âœï¸
* `edit` â†’ ðŸ“
* `attach` â†’ ðŸ“Ž
* default â†’ ðŸ› ï¸

### Visual mapping

* `idle`: normal critter.
* `workingMain`: badge with glyph, full tint, leg â€œworkingâ€ animation.
* `workingOther`: badge with glyph, muted tint, no scurry.
* `overridden`: uses the chosen glyph/tint regardless of activity.

## Status row text (menu)

* While work is active: `<Session role> Â· <activity label>`
  * Examples: `Main Â· exec: pnpm test`, `Other Â· read: apps/macos/Sources/OpenClaw/AppState.swift`.
* When idle: falls back to the health summary.

## Event ingestion

* Source: controlâ€‘channel `agent` events (`ControlChannel.handleAgentEvent`).
* Parsed fields:
  * `stream: "job"` with `data.state` for start/stop.
  * `stream: "tool"` with `data.phase`, `name`, optional `meta`/`args`.
* Labels:
  * `exec`: first line of `args.command`.
  * `read`/`write`: shortened path.
  * `edit`: path plus inferred change kind from `meta`/diff counts.
  * fallback: tool name.

## Debug override

* Settings â–¸ Debug â–¸ â€œIcon overrideâ€ picker:
  * `System (auto)` (default)
  * `Working: main` (per tool kind)
  * `Working: other` (per tool kind)
  * `Idle`
* Stored via `@AppStorage("iconOverride")`; mapped to `IconState.overridden`.

## Testing checklist

* Trigger main session job: verify icon switches immediately and status row shows main label.
* Trigger nonâ€‘main session job while main idle: icon/status shows nonâ€‘main; stays stable until it finishes.
* Start main while other active: icon flips to main instantly.
* Rapid tool bursts: ensure badge does not flicker (TTL grace on tool results).
* Health row reappears once all sessions idle.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/peekaboo.md`

Source URL: https://docs.openclaw.ai/platforms/mac/peekaboo.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Peekaboo Bridge

# Peekaboo Bridge (macOS UI automation)

OpenClaw can host **PeekabooBridge** as a local, permissionâ€‘aware UI automation
broker. This lets the `peekaboo` CLI drive UI automation while reusing the
macOS appâ€™s TCC permissions.

## What this is (and isnâ€™t)

* **Host**: OpenClaw\.app can act as a PeekabooBridge host.
* **Client**: use the `peekaboo` CLI (no separate `openclaw ui ...` surface).
* **UI**: visual overlays stay in Peekaboo.app; OpenClaw is a thin broker host.

## Enable the bridge

In the macOS app:

* Settings â†’ **Enable Peekaboo Bridge**

When enabled, OpenClaw starts a local UNIX socket server. If disabled, the host
is stopped and `peekaboo` will fall back to other available hosts.

## Client discovery order

Peekaboo clients typically try hosts in this order:

1. Peekaboo.app (full UX)
2. Claude.app (if installed)
3. OpenClaw\.app (thin broker)

Use `peekaboo bridge status --verbose` to see which host is active and which
socket path is in use. You can override with:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
export PEEKABOO_BRIDGE_SOCKET=/path/to/bridge.sock
```

## Security & permissions

* The bridge validates **caller code signatures**; an allowlist of TeamIDs is
  enforced (Peekaboo host TeamID + OpenClaw app TeamID).
* Requests time out after \~10 seconds.
* If required permissions are missing, the bridge returns a clear error message
  rather than launching System Settings.

## Snapshot behavior (automation)

Snapshots are stored in memory and expire automatically after a short window.
If you need longer retention, reâ€‘capture from the client.

## Troubleshooting

* If `peekaboo` reports â€œbridge client is not authorizedâ€, ensure the client is
  properly signed or run the host with `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`
  in **debug** mode only.
* If no hosts are found, open one of the host apps (Peekaboo.app or OpenClaw\.app)
  and confirm permissions are granted.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/permissions.md`

Source URL: https://docs.openclaw.ai/platforms/mac/permissions.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS Permissions

# macOS permissions (TCC)

macOS permission grants are fragile. TCC associates a permission grant with the
app's code signature, bundle identifier, and on-disk path. If any of those change,
macOS treats the app as new and may drop or hide prompts.

## Requirements for stable permissions

* Same path: run the app from a fixed location (for OpenClaw, `dist/OpenClaw.app`).
* Same bundle identifier: changing the bundle ID creates a new permission identity.
* Signed app: unsigned or ad-hoc signed builds do not persist permissions.
* Consistent signature: use a real Apple Development or Developer ID certificate
  so the signature stays stable across rebuilds.

Ad-hoc signatures generate a new identity every build. macOS will forget previous
grants, and prompts can disappear entirely until the stale entries are cleared.

## Recovery checklist when prompts disappear

1. Quit the app.
2. Remove the app entry in System Settings -> Privacy & Security.
3. Relaunch the app from the same path and re-grant permissions.
4. If the prompt still does not appear, reset TCC entries with `tccutil` and try again.
5. Some permissions only reappear after a full macOS restart.

Example resets (replace bundle ID as needed):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo tccutil reset Accessibility ai.openclaw.mac
sudo tccutil reset ScreenCapture ai.openclaw.mac
sudo tccutil reset AppleEvents
```

## Files and folders permissions (Desktop/Documents/Downloads)

macOS may also gate Desktop, Documents, and Downloads for terminal/background processes. If file reads or directory listings hang, grant access to the same process context that performs file operations (for example Terminal/iTerm, LaunchAgent-launched app, or SSH process).

Workaround: move files into the OpenClaw workspace (`~/.openclaw/workspace`) if you want to avoid per-folder grants.

If you are testing permissions, always sign with a real certificate. Ad-hoc
builds are only acceptable for quick local runs where permissions do not matter.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/release.md`

Source URL: https://docs.openclaw.ai/platforms/mac/release.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS Release

# OpenClaw macOS release (Sparkle)

This app now ships Sparkle auto-updates. Release builds must be Developer IDâ€“signed, zipped, and published with a signed appcast entry.

## Prereqs

* Developer ID Application cert installed (example: `Developer ID Application: <Developer Name> (<TEAMID>)`).
* Sparkle private key path set in the environment as `SPARKLE_PRIVATE_KEY_FILE` (path to your Sparkle ed25519 private key; public key baked into Info.plist). If it is missing, check `~/.profile`.
* Notary credentials (keychain profile or API key) for `xcrun notarytool` if you want Gatekeeper-safe DMG/zip distribution.
  * We use a Keychain profile named `openclaw-notary`, created from App Store Connect API key env vars in your shell profile:
    * `APP_STORE_CONNECT_API_KEY_P8`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`
    * `echo "$APP_STORE_CONNECT_API_KEY_P8" | sed 's/\\n/\n/g' > /tmp/openclaw-notary.p8`
    * `xcrun notarytool store-credentials "openclaw-notary" --key /tmp/openclaw-notary.p8 --key-id "$APP_STORE_CONNECT_KEY_ID" --issuer "$APP_STORE_CONNECT_ISSUER_ID"`
* `pnpm` deps installed (`pnpm install --config.node-linker=hoisted`).
* Sparkle tools are fetched automatically via SwiftPM at `apps/macos/.build/artifacts/sparkle/Sparkle/bin/` (`sign_update`, `generate_appcast`, etc.).

## Build & package

Notes:

* `APP_BUILD` maps to `CFBundleVersion`/`sparkle:version`; keep it numeric + monotonic (no `-beta`), or Sparkle compares it as equal.
* If `APP_BUILD` is omitted, `scripts/package-mac-app.sh` derives a Sparkle-safe default from `APP_VERSION` (`YYYYMMDDNN`: stable defaults to `90`, prereleases use a suffix-derived lane) and uses the higher of that value and git commit count.
* You can still override `APP_BUILD` explicitly when release engineering needs a specific monotonic value.
* For `BUILD_CONFIG=release`, `scripts/package-mac-app.sh` now defaults to universal (`arm64 x86_64`) automatically. You can still override with `BUILD_ARCHS=arm64` or `BUILD_ARCHS=x86_64`. For local/dev builds (`BUILD_CONFIG=debug`), it defaults to the current architecture (`$(uname -m)`).
* Use `scripts/package-mac-dist.sh` for release artifacts (zip + DMG + notarization). Use `scripts/package-mac-app.sh` for local/dev packaging.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# From repo root; set release IDs so Sparkle feed is enabled.
# This command builds release artifacts without notarization.
# APP_BUILD must be numeric + monotonic for Sparkle compare.
# Default is auto-derived from APP_VERSION when omitted.
SKIP_NOTARIZE=1 \
BUNDLE_ID=ai.openclaw.mac \
APP_VERSION=2026.3.10 \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-dist.sh

# `package-mac-dist.sh` already creates the zip + DMG.
# If you used `package-mac-app.sh` directly instead, create them manually:
# If you want notarization/stapling in this step, use the NOTARIZE command below.
ditto -c -k --sequesterRsrc --keepParent dist/OpenClaw.app dist/OpenClaw-2026.3.10.zip

# Optional: build a styled DMG for humans (drag to /Applications)
scripts/create-dmg.sh dist/OpenClaw.app dist/OpenClaw-2026.3.10.dmg

# Recommended: build + notarize/staple zip + DMG
# First, create a keychain profile once:
#   xcrun notarytool store-credentials "openclaw-notary" \
#     --apple-id "<apple-id>" --team-id "<team-id>" --password "<app-specific-password>"
NOTARIZE=1 NOTARYTOOL_PROFILE=openclaw-notary \
BUNDLE_ID=ai.openclaw.mac \
APP_VERSION=2026.3.10 \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-dist.sh

# Optional: ship dSYM alongside the release
ditto -c -k --keepParent apps/macos/.build/release/OpenClaw.app.dSYM dist/OpenClaw-2026.3.10.dSYM.zip
```

## Appcast entry

Use the release note generator so Sparkle renders formatted HTML notes:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
SPARKLE_PRIVATE_KEY_FILE=/path/to/ed25519-private-key scripts/make_appcast.sh dist/OpenClaw-2026.3.10.zip https://raw.githubusercontent.com/openclaw/openclaw/main/appcast.xml
```

Generates HTML release notes from `CHANGELOG.md` (via [`scripts/changelog-to-html.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/changelog-to-html.sh)) and embeds them in the appcast entry.
Commit the updated `appcast.xml` alongside the release assets (zip + dSYM) when publishing.

## Publish & verify

* Upload `OpenClaw-2026.3.10.zip` (and `OpenClaw-2026.3.10.dSYM.zip`) to the GitHub release for tag `v2026.3.10`.
* Ensure the raw appcast URL matches the baked feed: `https://raw.githubusercontent.com/openclaw/openclaw/main/appcast.xml`.
* Sanity checks:
  * `curl -I https://raw.githubusercontent.com/openclaw/openclaw/main/appcast.xml` returns 200.
  * `curl -I <enclosure url>` returns 200 after assets upload.
  * On a previous public build, run â€œCheck for Updatesâ€¦â€ from the About tab and verify Sparkle installs the new build cleanly.

Definition of done: signed app + appcast are published, update flow works from an older installed version, and release assets are attached to the GitHub release.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/remote.md`

Source URL: https://docs.openclaw.ai/platforms/mac/remote.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Remote Control

# Remote OpenClaw (macOS â‡„ remote host)

This flow lets the macOS app act as a full remote control for a OpenClaw gateway running on another host (desktop/server). Itâ€™s the appâ€™s **Remote over SSH** (remote run) feature. All featuresâ€”health checks, Voice Wake forwarding, and Web Chatâ€”reuse the same remote SSH configuration from *Settings â†’ General*.

## Modes

* **Local (this Mac)**: Everything runs on the laptop. No SSH involved.
* **Remote over SSH (default)**: OpenClaw commands are executed on the remote host. The mac app opens an SSH connection with `-o BatchMode` plus your chosen identity/key and a local port-forward.
* **Remote direct (ws/wss)**: No SSH tunnel. The mac app connects to the gateway URL directly (for example, via Tailscale Serve or a public HTTPS reverse proxy).

## Remote transports

Remote mode supports two transports:

* **SSH tunnel** (default): Uses `ssh -N -L ...` to forward the gateway port to localhost. The gateway will see the nodeâ€™s IP as `127.0.0.1` because the tunnel is loopback.
* **Direct (ws/wss)**: Connects straight to the gateway URL. The gateway sees the real client IP.

## Prereqs on the remote host

1. Install Node + pnpm and build/install the OpenClaw CLI (`pnpm install && pnpm build && pnpm link --global`).
2. Ensure `openclaw` is on PATH for non-interactive shells (symlink into `/usr/local/bin` or `/opt/homebrew/bin` if needed).
3. Open SSH with key auth. We recommend **Tailscale** IPs for stable reachability off-LAN.

## macOS app setup

1. Open *Settings â†’ General*.
2. Under **OpenClaw runs**, pick **Remote over SSH** and set:
   * **Transport**: **SSH tunnel** or **Direct (ws/wss)**.
   * **SSH target**: `user@host` (optional `:port`).
     * If the gateway is on the same LAN and advertises Bonjour, pick it from the discovered list to auto-fill this field.
   * **Gateway URL** (Direct only): `wss://gateway.example.ts.net` (or `ws://...` for local/LAN).
   * **Identity file** (advanced): path to your key.
   * **Project root** (advanced): remote checkout path used for commands.
   * **CLI path** (advanced): optional path to a runnable `openclaw` entrypoint/binary (auto-filled when advertised).
3. Hit **Test remote**. Success indicates the remote `openclaw status --json` runs correctly. Failures usually mean PATH/CLI issues; exit 127 means the CLI isnâ€™t found remotely.
4. Health checks and Web Chat will now run through this SSH tunnel automatically.

## Web Chat

* **SSH tunnel**: Web Chat connects to the gateway over the forwarded WebSocket control port (default 18789).
* **Direct (ws/wss)**: Web Chat connects straight to the configured gateway URL.
* There is no separate WebChat HTTP server anymore.

## Permissions

* The remote host needs the same TCC approvals as local (Automation, Accessibility, Screen Recording, Microphone, Speech Recognition, Notifications). Run onboarding on that machine to grant them once.
* Nodes advertise their permission state via `node.list` / `node.describe` so agents know whatâ€™s available.

## Security notes

* Prefer loopback binds on the remote host and connect via SSH or Tailscale.
* SSH tunneling uses strict host-key checking; trust the host key first so it exists in `~/.ssh/known_hosts`.
* If you bind the Gateway to a non-loopback interface, require token/password auth.
* See [Security](/gateway/security) and [Tailscale](/gateway/tailscale).

## WhatsApp login flow (remote)

* Run `openclaw channels login --verbose` **on the remote host**. Scan the QR with WhatsApp on your phone.
* Re-run login on that host if auth expires. Health check will surface link problems.

## Troubleshooting

* **exit 127 / not found**: `openclaw` isnâ€™t on PATH for non-login shells. Add it to `/etc/paths`, your shell rc, or symlink into `/usr/local/bin`/`/opt/homebrew/bin`.
* **Health probe failed**: check SSH reachability, PATH, and that Baileys is logged in (`openclaw status --json`).
* **Web Chat stuck**: confirm the gateway is running on the remote host and the forwarded port matches the gateway WS port; the UI requires a healthy WS connection.
* **Node IP shows 127.0.0.1**: expected with the SSH tunnel. Switch **Transport** to **Direct (ws/wss)** if you want the gateway to see the real client IP.
* **Voice Wake**: trigger phrases are forwarded automatically in remote mode; no separate forwarder is needed.

## Notification sounds

Pick sounds per notification from scripts with `openclaw` and `node.invoke`, e.g.:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw nodes notify --node <id> --title "Ping" --body "Remote gateway ready" --sound Glass
```

There is no global â€œdefault soundâ€ toggle in the app anymore; callers choose a sound (or none) per request.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/signing.md`

Source URL: https://docs.openclaw.ai/platforms/mac/signing.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS Signing

# mac signing (debug builds)

This app is usually built from [`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh), which now:

* sets a stable debug bundle identifier: `ai.openclaw.mac.debug`
* writes the Info.plist with that bundle id (override via `BUNDLE_ID=...`)
* calls [`scripts/codesign-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/codesign-mac-app.sh) to sign the main binary and app bundle so macOS treats each rebuild as the same signed bundle and keeps TCC permissions (notifications, accessibility, screen recording, mic, speech). For stable permissions, use a real signing identity; ad-hoc is opt-in and fragile (see [macOS permissions](/platforms/mac/permissions)).
* uses `CODESIGN_TIMESTAMP=auto` by default; it enables trusted timestamps for Developer ID signatures. Set `CODESIGN_TIMESTAMP=off` to skip timestamping (offline debug builds).
* inject build metadata into Info.plist: `OpenClawBuildTimestamp` (UTC) and `OpenClawGitCommit` (short hash) so the About pane can show build, git, and debug/release channel.
* **Packaging requires Node 22+**: the script runs TS builds and the Control UI build.
* reads `SIGN_IDENTITY` from the environment. Add `export SIGN_IDENTITY="Apple Development: Your Name (TEAMID)"` (or your Developer ID Application cert) to your shell rc to always sign with your cert. Ad-hoc signing requires explicit opt-in via `ALLOW_ADHOC_SIGNING=1` or `SIGN_IDENTITY="-"` (not recommended for permission testing).
* runs a Team ID audit after signing and fails if any Mach-O inside the app bundle is signed by a different Team ID. Set `SKIP_TEAM_ID_CHECK=1` to bypass.

## Usage

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# from repo root
scripts/package-mac-app.sh               # auto-selects identity; errors if none found
SIGN_IDENTITY="Developer ID Application: Your Name" scripts/package-mac-app.sh   # real cert
ALLOW_ADHOC_SIGNING=1 scripts/package-mac-app.sh    # ad-hoc (permissions will not stick)
SIGN_IDENTITY="-" scripts/package-mac-app.sh        # explicit ad-hoc (same caveat)
DISABLE_LIBRARY_VALIDATION=1 scripts/package-mac-app.sh   # dev-only Sparkle Team ID mismatch workaround
```

### Ad-hoc Signing Note

When signing with `SIGN_IDENTITY="-"` (ad-hoc), the script automatically disables the **Hardened Runtime** (`--options runtime`). This is necessary to prevent crashes when the app attempts to load embedded frameworks (like Sparkle) that do not share the same Team ID. Ad-hoc signatures also break TCC permission persistence; see [macOS permissions](/platforms/mac/permissions) for recovery steps.

## Build metadata for About

`package-mac-app.sh` stamps the bundle with:

* `OpenClawBuildTimestamp`: ISO8601 UTC at package time
* `OpenClawGitCommit`: short git hash (or `unknown` if unavailable)

The About tab reads these keys to show version, build date, git commit, and whether itâ€™s a debug build (via `#if DEBUG`). Run the packager to refresh these values after code changes.

## Why

TCC permissions are tied to the bundle identifier *and* code signature. Unsigned debug builds with changing UUIDs were causing macOS to forget grants after each rebuild. Signing the binaries (adâ€‘hoc by default) and keeping a fixed bundle id/path (`dist/OpenClaw.app`) preserves the grants between builds, matching the VibeTunnel approach.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/skills.md`

Source URL: https://docs.openclaw.ai/platforms/mac/skills.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Skills

# Skills (macOS)

The macOS app surfaces OpenClaw skills via the gateway; it does not parse skills locally.

## Data source

* `skills.status` (gateway) returns all skills plus eligibility and missing requirements
  (including allowlist blocks for bundled skills).
* Requirements are derived from `metadata.openclaw.requires` in each `SKILL.md`.

## Install actions

* `metadata.openclaw.install` defines install options (brew/node/go/uv).
* The app calls `skills.install` to run installers on the gateway host.
* The gateway surfaces only one preferred installer when multiple are provided
  (brew when available, otherwise node manager from `skills.install`, default npm).

## Env/API keys

* The app stores keys in `~/.openclaw/openclaw.json` under `skills.entries.<skillKey>`.
* `skills.update` patches `enabled`, `apiKey`, and `env`.

## Remote mode

* Install + config updates happen on the gateway host (not the local Mac).


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/voice-overlay.md`

Source URL: https://docs.openclaw.ai/platforms/mac/voice-overlay.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Voice Overlay

# Voice Overlay Lifecycle (macOS)

Audience: macOS app contributors. Goal: keep the voice overlay predictable when wake-word and push-to-talk overlap.

## Current intent

* If the overlay is already visible from wake-word and the user presses the hotkey, the hotkey session *adopts* the existing text instead of resetting it. The overlay stays up while the hotkey is held. When the user releases: send if there is trimmed text, otherwise dismiss.
* Wake-word alone still auto-sends on silence; push-to-talk sends immediately on release.

## Implemented (Dec 9, 2025)

* Overlay sessions now carry a token per capture (wake-word or push-to-talk). Partial/final/send/dismiss/level updates are dropped when the token doesnâ€™t match, avoiding stale callbacks.
* Push-to-talk adopts any visible overlay text as a prefix (so pressing the hotkey while the wake overlay is up keeps the text and appends new speech). It waits up to 1.5s for a final transcript before falling back to the current text.
* Chime/overlay logging is emitted at `info` in categories `voicewake.overlay`, `voicewake.ptt`, and `voicewake.chime` (session start, partial, final, send, dismiss, chime reason).

## Next steps

1. **VoiceSessionCoordinator (actor)**
   * Owns exactly one `VoiceSession` at a time.
   * API (token-based): `beginWakeCapture`, `beginPushToTalk`, `updatePartial`, `endCapture`, `cancel`, `applyCooldown`.
   * Drops callbacks that carry stale tokens (prevents old recognizers from reopening the overlay).
2. **VoiceSession (model)**
   * Fields: `token`, `source` (wakeWord|pushToTalk), committed/volatile text, chime flags, timers (auto-send, idle), `overlayMode` (display|editing|sending), cooldown deadline.
3. **Overlay binding**
   * `VoiceSessionPublisher` (`ObservableObject`) mirrors the active session into SwiftUI.
   * `VoiceWakeOverlayView` renders only via the publisher; it never mutates global singletons directly.
   * Overlay user actions (`sendNow`, `dismiss`, `edit`) call back into the coordinator with the session token.
4. **Unified send path**
   * On `endCapture`: if trimmed text is empty â†’ dismiss; else `performSend(session:)` (plays send chime once, forwards, dismisses).
   * Push-to-talk: no delay; wake-word: optional delay for auto-send.
   * Apply a short cooldown to the wake runtime after push-to-talk finishes so wake-word doesnâ€™t immediately retrigger.
5. **Logging**
   * Coordinator emits `.info` logs in subsystem `ai.openclaw`, categories `voicewake.overlay` and `voicewake.chime`.
   * Key events: `session_started`, `adopted_by_push_to_talk`, `partial`, `finalized`, `send`, `dismiss`, `cancel`, `cooldown`.

## Debugging checklist

* Stream logs while reproducing a sticky overlay:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  sudo log stream --predicate 'subsystem == "ai.openclaw" AND category CONTAINS "voicewake"' --level info --style compact
  ```

* Verify only one active session token; stale callbacks should be dropped by the coordinator.

* Ensure push-to-talk release always calls `endCapture` with the active token; if text is empty, expect `dismiss` without chime or send.

## Migration steps (suggested)

1. Add `VoiceSessionCoordinator`, `VoiceSession`, and `VoiceSessionPublisher`.
2. Refactor `VoiceWakeRuntime` to create/update/end sessions instead of touching `VoiceWakeOverlayController` directly.
3. Refactor `VoicePushToTalk` to adopt existing sessions and call `endCapture` on release; apply runtime cooldown.
4. Wire `VoiceWakeOverlayController` to the publisher; remove direct calls from runtime/PTT.
5. Add integration tests for session adoption, cooldown, and empty-text dismissal.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/voicewake.md`

Source URL: https://docs.openclaw.ai/platforms/mac/voicewake.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Voice Wake

# Voice Wake & Push-to-Talk

## Modes

* **Wake-word mode** (default): always-on Speech recognizer waits for trigger tokens (`swabbleTriggerWords`). On match it starts capture, shows the overlay with partial text, and auto-sends after silence.
* **Push-to-talk (Right Option hold)**: hold the right Option key to capture immediatelyâ€”no trigger needed. The overlay appears while held; releasing finalizes and forwards after a short delay so you can tweak text.

## Runtime behavior (wake-word)

* Speech recognizer lives in `VoiceWakeRuntime`.
* Trigger only fires when thereâ€™s a **meaningful pause** between the wake word and the next word (\~0.55s gap). The overlay/chime can start on the pause even before the command begins.
* Silence windows: 2.0s when speech is flowing, 5.0s if only the trigger was heard.
* Hard stop: 120s to prevent runaway sessions.
* Debounce between sessions: 350ms.
* Overlay is driven via `VoiceWakeOverlayController` with committed/volatile coloring.
* After send, recognizer restarts cleanly to listen for the next trigger.

## Lifecycle invariants

* If Voice Wake is enabled and permissions are granted, the wake-word recognizer should be listening (except during an explicit push-to-talk capture).
* Overlay visibility (including manual dismiss via the X button) must never prevent the recognizer from resuming.

## Sticky overlay failure mode (previous)

Previously, if the overlay got stuck visible and you manually closed it, Voice Wake could appear â€œdeadâ€ because the runtimeâ€™s restart attempt could be blocked by overlay visibility and no subsequent restart was scheduled.

Hardening:

* Wake runtime restart is no longer blocked by overlay visibility.
* Overlay dismiss completion triggers a `VoiceWakeRuntime.refresh(...)` via `VoiceSessionCoordinator`, so manual X-dismiss always resumes listening.

## Push-to-talk specifics

* Hotkey detection uses a global `.flagsChanged` monitor for **right Option** (`keyCode 61` + `.option`). We only observe events (no swallowing).
* Capture pipeline lives in `VoicePushToTalk`: starts Speech immediately, streams partials to the overlay, and calls `VoiceWakeForwarder` on release.
* When push-to-talk starts we pause the wake-word runtime to avoid dueling audio taps; it restarts automatically after release.
* Permissions: requires Microphone + Speech; seeing events needs Accessibility/Input Monitoring approval.
* External keyboards: some may not expose right Option as expectedâ€”offer a fallback shortcut if users report misses.

## User-facing settings

* **Voice Wake** toggle: enables wake-word runtime.
* **Hold Cmd+Fn to talk**: enables the push-to-talk monitor. Disabled on macOS \< 26.
* Language & mic pickers, live level meter, trigger-word table, tester (local-only; does not forward).
* Mic picker preserves the last selection if a device disconnects, shows a disconnected hint, and temporarily falls back to the system default until it returns.
* **Sounds**: chimes on trigger detect and on send; defaults to the macOS â€œGlassâ€ system sound. You can pick any `NSSound`-loadable file (e.g. MP3/WAV/AIFF) for each event or choose **No Sound**.

## Forwarding behavior

* When Voice Wake is enabled, transcripts are forwarded to the active gateway/agent (the same local vs remote mode used by the rest of the mac app).
* Replies are delivered to the **last-used main provider** (WhatsApp/Telegram/Discord/WebChat). If delivery fails, the error is logged and the run is still visible via WebChat/session logs.

## Forwarding payload

* `VoiceWakeForwarder.prefixedTranscript(_:)` prepends the machine hint before sending. Shared between wake-word and push-to-talk paths.

## Quick verification

* Toggle push-to-talk on, hold Cmd+Fn, speak, release: overlay should show partials then send.
* While holding, menu-bar ears should stay enlarged (uses `triggerVoiceEars(ttl:nil)`); they drop after release.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/webchat.md`

Source URL: https://docs.openclaw.ai/platforms/mac/webchat.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# WebChat

# WebChat (macOS app)

The macOS menu bar app embeds the WebChat UI as a native SwiftUI view. It
connects to the Gateway and defaults to the **main session** for the selected
agent (with a session switcher for other sessions).

* **Local mode**: connects directly to the local Gateway WebSocket.
* **Remote mode**: forwards the Gateway control port over SSH and uses that
  tunnel as the data plane.

## Launch & debugging

* Manual: Lobster menu â†’ â€œOpen Chatâ€.

* Autoâ€‘open for testing:

  ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
  dist/OpenClaw.app/Contents/MacOS/OpenClaw --webchat
  ```

* Logs: `./scripts/clawlog.sh` (subsystem `ai.openclaw`, category `WebChatSwiftUI`).

## How itâ€™s wired

* Data plane: Gateway WS methods `chat.history`, `chat.send`, `chat.abort`,
  `chat.inject` and events `chat`, `agent`, `presence`, `tick`, `health`.
* Session: defaults to the primary session (`main`, or `global` when scope is
  global). The UI can switch between sessions.
* Onboarding uses a dedicated session to keep firstâ€‘run setup separate.

## Security surface

* Remote mode forwards only the Gateway WebSocket control port over SSH.

## Known limitations

* The UI is optimized for chat sessions (not a full browser sandbox).


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/mac/xpc.md`

Source URL: https://docs.openclaw.ai/platforms/mac/xpc.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS IPC

# OpenClaw macOS IPC architecture

**Current model:** a local Unix socket connects the **node host service** to the **macOS app** for exec approvals + `system.run`. A `openclaw-mac` debug CLI exists for discovery/connect checks; agent actions still flow through the Gateway WebSocket and `node.invoke`. UI automation uses PeekabooBridge.

## Goals

* Single GUI app instance that owns all TCC-facing work (notifications, screen recording, mic, speech, AppleScript).
* A small surface for automation: Gateway + node commands, plus PeekabooBridge for UI automation.
* Predictable permissions: always the same signed bundle ID, launched by launchd, so TCC grants stick.

## How it works

### Gateway + node transport

* The app runs the Gateway (local mode) and connects to it as a node.
* Agent actions are performed via `node.invoke` (e.g. `system.run`, `system.notify`, `canvas.*`).

### Node service + app IPC

* A headless node host service connects to the Gateway WebSocket.
* `system.run` requests are forwarded to the macOS app over a local Unix socket.
* The app performs the exec in UI context, prompts if needed, and returns output.

Diagram (SCI):

```
Agent -> Gateway -> Node Service (WS)
                      |  IPC (UDS + token + HMAC + TTL)
                      v
                  Mac App (UI + TCC + system.run)
```

### PeekabooBridge (UI automation)

* UI automation uses a separate UNIX socket named `bridge.sock` and the PeekabooBridge JSON protocol.
* Host preference order (client-side): Peekaboo.app â†’ Claude.app â†’ OpenClaw\.app â†’ local execution.
* Security: bridge hosts require an allowed TeamID; DEBUG-only same-UID escape hatch is guarded by `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1` (Peekaboo convention).
* See: [PeekabooBridge usage](/platforms/mac/peekaboo) for details.

## Operational flows

* Restart/rebuild: `SIGN_IDENTITY="Apple Development: <Developer Name> (<TEAMID>)" scripts/restart-mac.sh`
  * Kills existing instances
  * Swift build + package
  * Writes/bootstraps/kickstarts the LaunchAgent
* Single instance: app exits early if another instance with the same bundle ID is running.

## Hardening notes

* Prefer requiring a TeamID match for all privileged surfaces.
* PeekabooBridge: `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1` (DEBUG-only) may allow same-UID callers for local development.
* All communication remains local-only; no network sockets are exposed.
* TCC prompts originate only from the GUI app bundle; keep the signed bundle ID stable across rebuilds.
* IPC hardening: socket mode `0600`, token, peer-UID checks, HMAC challenge/response, short TTL.


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/macos.md`

Source URL: https://docs.openclaw.ai/platforms/macos.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# macOS App

# OpenClaw macOS Companion (menu bar + gateway broker)

The macOS app is the **menuâ€‘bar companion** for OpenClaw. It owns permissions,
manages/attaches to the Gateway locally (launchd or manual), and exposes macOS
capabilities to the agent as a node.

## What it does

* Shows native notifications and status in the menu bar.
* Owns TCC prompts (Notifications, Accessibility, Screen Recording, Microphone,
  Speech Recognition, Automation/AppleScript).
* Runs or connects to the Gateway (local or remote).
* Exposes macOSâ€‘only tools (Canvas, Camera, Screen Recording, `system.run`).
* Starts the local node host service in **remote** mode (launchd), and stops it in **local** mode.
* Optionally hosts **PeekabooBridge** for UI automation.
* Installs the global CLI (`openclaw`) via npm/pnpm on request (bun not recommended for the Gateway runtime).

## Local vs remote mode

* **Local** (default): the app attaches to a running local Gateway if present;
  otherwise it enables the launchd service via `openclaw gateway install`.
* **Remote**: the app connects to a Gateway over SSH/Tailscale and never starts
  a local process.
  The app starts the local **node host service** so the remote Gateway can reach this Mac.
  The app does not spawn the Gateway as a child process.

## Launchd control

The app manages a perâ€‘user LaunchAgent labeled `ai.openclaw.gateway`
(or `ai.openclaw.<profile>` when using `--profile`/`OPENCLAW_PROFILE`; legacy `com.openclaw.*` still unloads).

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
launchctl kickstart -k gui/$UID/ai.openclaw.gateway
launchctl bootout gui/$UID/ai.openclaw.gateway
```

Replace the label with `ai.openclaw.<profile>` when running a named profile.

If the LaunchAgent isnâ€™t installed, enable it from the app or run
`openclaw gateway install`.

## Node capabilities (mac)

The macOS app presents itself as a node. Common commands:

* Canvas: `canvas.present`, `canvas.navigate`, `canvas.eval`, `canvas.snapshot`, `canvas.a2ui.*`
* Camera: `camera.snap`, `camera.clip`
* Screen: `screen.record`
* System: `system.run`, `system.notify`

The node reports a `permissions` map so agents can decide whatâ€™s allowed.

Node service + app IPC:

* When the headless node host service is running (remote mode), it connects to the Gateway WS as a node.
* `system.run` executes in the macOS app (UI/TCC context) over a local Unix socket; prompts + output stay in-app.

Diagram (SCI):

```
Gateway -> Node Service (WS)
                 |  IPC (UDS + token + HMAC + TTL)
                 v
             Mac App (UI + TCC + system.run)
```

## Exec approvals (system.run)

`system.run` is controlled by **Exec approvals** in the macOS app (Settings â†’ Exec approvals).
Security + ask + allowlist are stored locally on the Mac in:

```
~/.openclaw/exec-approvals.json
```

Example:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "version": 1,
  "defaults": {
    "security": "deny",
    "ask": "on-miss"
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "allowlist": [{ "pattern": "/opt/homebrew/bin/rg" }]
    }
  }
}
```

Notes:

* `allowlist` entries are glob patterns for resolved binary paths.
* Raw shell command text that contains shell control or expansion syntax (`&&`, `||`, `;`, `|`, `` ` ``, `$`, `<`, `>`, `(`, `)`) is treated as an allowlist miss and requires explicit approval (or allowlisting the shell binary).
* Choosing â€œAlways Allowâ€ in the prompt adds that command to the allowlist.
* `system.run` environment overrides are filtered (drops `PATH`, `DYLD_*`, `LD_*`, `NODE_OPTIONS`, `PYTHON*`, `PERL*`, `RUBYOPT`, `SHELLOPTS`, `PS4`) and then merged with the appâ€™s environment.
* For shell wrappers (`bash|sh|zsh ... -c/-lc`), request-scoped environment overrides are reduced to a small explicit allowlist (`TERM`, `LANG`, `LC_*`, `COLORTERM`, `NO_COLOR`, `FORCE_COLOR`).
* For allow-always decisions in allowlist mode, known dispatch wrappers (`env`, `nice`, `nohup`, `stdbuf`, `timeout`) persist inner executable paths instead of wrapper paths. If unwrapping is not safe, no allowlist entry is persisted automatically.

## Deep links

The app registers the `openclaw://` URL scheme for local actions.

### `openclaw://agent`

Triggers a Gateway `agent` request.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
open 'openclaw://agent?message=Hello%20from%20deep%20link'
```

Query parameters:

* `message` (required)
* `sessionKey` (optional)
* `thinking` (optional)
* `deliver` / `to` / `channel` (optional)
* `timeoutSeconds` (optional)
* `key` (optional unattended mode key)

Safety:

* Without `key`, the app prompts for confirmation.
* Without `key`, the app enforces a short message limit for the confirmation prompt and ignores `deliver` / `to` / `channel`.
* With a valid `key`, the run is unattended (intended for personal automations).

## Onboarding flow (typical)

1. Install and launch **OpenClaw\.app**.
2. Complete the permissions checklist (TCC prompts).
3. Ensure **Local** mode is active and the Gateway is running.
4. Install the CLI if you want terminal access.

## State dir placement (macOS)

Avoid putting your OpenClaw state dir in iCloud or other cloud-synced folders.
Sync-backed paths can add latency and occasionally cause file-lock/sync races for
sessions and credentials.

Prefer a local non-synced state path such as:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
OPENCLAW_STATE_DIR=~/.openclaw
```

If `openclaw doctor` detects state under:

* `~/Library/Mobile Documents/com~apple~CloudDocs/...`
* `~/Library/CloudStorage/...`

it will warn and recommend moving back to a local path.

## Build & dev workflow (native)

* `cd apps/macos && swift build`
* `swift run OpenClaw` (or Xcode)
* Package app: `scripts/package-mac-app.sh`

## Debug gateway connectivity (macOS CLI)

Use the debug CLI to exercise the same Gateway WebSocket handshake and discovery
logic that the macOS app uses, without launching the app.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cd apps/macos
swift run openclaw-mac connect --json
swift run openclaw-mac discover --timeout 3000 --json
```

Connect options:

* `--url <ws://host:port>`: override config
* `--mode <local|remote>`: resolve from config (default: config or local)
* `--probe`: force a fresh health probe
* `--timeout <ms>`: request timeout (default: `15000`)
* `--json`: structured output for diffing

Discovery options:

* `--include-local`: include gateways that would be filtered as â€œlocalâ€
* `--timeout <ms>`: overall discovery window (default: `2000`)
* `--json`: structured output for diffing

Tip: compare against `openclaw gateway discover --json` to see whether the
macOS appâ€™s discovery pipeline (NWBrowser + tailnet DNSâ€‘SD fallback) differs from
the Node CLIâ€™s `dns-sd` based discovery.

## Remote connection plumbing (SSH tunnels)

When the macOS app runs in **Remote** mode, it opens an SSH tunnel so local UI
components can talk to a remote Gateway as if it were on localhost.

### Control tunnel (Gateway WebSocket port)

* **Purpose:** health checks, status, Web Chat, config, and other control-plane calls.
* **Local port:** the Gateway port (default `18789`), always stable.
* **Remote port:** the same Gateway port on the remote host.
* **Behavior:** no random local port; the app reuses an existing healthy tunnel
  or restarts it if needed.
* **SSH shape:** `ssh -N -L <local>:127.0.0.1:<remote>` with BatchMode +
  ExitOnForwardFailure + keepalive options.
* **IP reporting:** the SSH tunnel uses loopback, so the gateway will see the node
  IP as `127.0.0.1`. Use **Direct (ws/wss)** transport if you want the real client
  IP to appear (see [macOS remote access](/platforms/mac/remote)).

For setup steps, see [macOS remote access](/platforms/mac/remote). For protocol
details, see [Gateway protocol](/gateway/protocol).

## Related docs

* [Gateway runbook](/gateway)
* [Gateway (macOS)](/platforms/mac/bundled-gateway)
* [macOS permissions](/platforms/mac/permissions)
* [Canvas](/platforms/mac/canvas)


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/oracle.md`

Source URL: https://docs.openclaw.ai/platforms/oracle.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Oracle Cloud

# OpenClaw on Oracle Cloud (OCI)

## Goal

Run a persistent OpenClaw Gateway on Oracle Cloud's **Always Free** ARM tier.

Oracleâ€™s free tier can be a great fit for OpenClaw (especially if you already have an OCI account), but it comes with tradeoffs:

* ARM architecture (most things work, but some binaries may be x86-only)
* Capacity and signup can be finicky

## Cost Comparison (2026)

| Provider     | Plan            | Specs                  | Price/mo | Notes                 |
| ------------ | --------------- | ---------------------- | -------- | --------------------- |
| Oracle Cloud | Always Free ARM | up to 4 OCPU, 24GB RAM | \$0      | ARM, limited capacity |
| Hetzner      | CX22            | 2 vCPU, 4GB RAM        | \~ \$4   | Cheapest paid option  |
| DigitalOcean | Basic           | 1 vCPU, 1GB RAM        | \$6      | Easy UI, good docs    |
| Vultr        | Cloud Compute   | 1 vCPU, 1GB RAM        | \$6      | Many locations        |
| Linode       | Nanode          | 1 vCPU, 1GB RAM        | \$5      | Now part of Akamai    |

***

## Prerequisites

* Oracle Cloud account ([signup](https://www.oracle.com/cloud/free/)) â€” see [community signup guide](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd) if you hit issues
* Tailscale account (free at [tailscale.com](https://tailscale.com))
* \~30 minutes

## 1) Create an OCI Instance

1. Log into [Oracle Cloud Console](https://cloud.oracle.com/)
2. Navigate to **Compute â†’ Instances â†’ Create Instance**
3. Configure:
   * **Name:** `openclaw`
   * **Image:** Ubuntu 24.04 (aarch64)
   * **Shape:** `VM.Standard.A1.Flex` (Ampere ARM)
   * **OCPUs:** 2 (or up to 4)
   * **Memory:** 12 GB (or up to 24 GB)
   * **Boot volume:** 50 GB (up to 200 GB free)
   * **SSH key:** Add your public key
4. Click **Create**
5. Note the public IP address

**Tip:** If instance creation fails with "Out of capacity", try a different availability domain or retry later. Free tier capacity is limited.

## 2) Connect and Update

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Connect via public IP
ssh ubuntu@YOUR_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential
```

**Note:** `build-essential` is required for ARM compilation of some dependencies.

## 3) Configure User and Hostname

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Set hostname
sudo hostnamectl set-hostname openclaw

# Set password for ubuntu user
sudo passwd ubuntu

# Enable lingering (keeps user services running after logout)
sudo loginctl enable-linger ubuntu
```

## 4) Install Tailscale

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh --hostname=openclaw
```

This enables Tailscale SSH, so you can connect via `ssh openclaw` from any device on your tailnet â€” no public IP needed.

Verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
tailscale status
```

**From now on, connect via Tailscale:** `ssh ubuntu@openclaw` (or use the Tailscale IP).

## 5) Install OpenClaw

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://openclaw.ai/install.sh | bash
source ~/.bashrc
```

When prompted "How do you want to hatch your bot?", select **"Do this later"**.

> Note: If you hit ARM-native build issues, start with system packages (e.g. `sudo apt install -y build-essential`) before reaching for Homebrew.

## 6) Configure Gateway (loopback + token auth) and enable Tailscale Serve

Use token auth as the default. Itâ€™s predictable and avoids needing any â€œinsecure authâ€ Control UI flags.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Keep the Gateway private on the VM
openclaw config set gateway.bind loopback

# Require auth for the Gateway + Control UI
openclaw config set gateway.auth.mode token
openclaw doctor --generate-gateway-token

# Expose over Tailscale Serve (HTTPS + tailnet access)
openclaw config set gateway.tailscale.mode serve
openclaw config set gateway.trustedProxies '["127.0.0.1"]'

systemctl --user restart openclaw-gateway
```

## 7) Verify

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check version
openclaw --version

# Check daemon status
systemctl --user status openclaw-gateway

# Check Tailscale Serve
tailscale serve status

# Test local response
curl http://localhost:18789
```

## 8) Lock Down VCN Security

Now that everything is working, lock down the VCN to block all traffic except Tailscale. OCI's Virtual Cloud Network acts as a firewall at the network edge â€” traffic is blocked before it reaches your instance.

1. Go to **Networking â†’ Virtual Cloud Networks** in the OCI Console
2. Click your VCN â†’ **Security Lists** â†’ Default Security List
3. **Remove** all ingress rules except:
   * `0.0.0.0/0 UDP 41641` (Tailscale)
4. Keep default egress rules (allow all outbound)

This blocks SSH on port 22, HTTP, HTTPS, and everything else at the network edge. From now on, you can only connect via Tailscale.

***

## Access the Control UI

From any device on your Tailscale network:

```
https://openclaw.<tailnet-name>.ts.net/
```

Replace `<tailnet-name>` with your tailnet name (visible in `tailscale status`).

No SSH tunnel needed. Tailscale provides:

* HTTPS encryption (automatic certs)
* Authentication via Tailscale identity
* Access from any device on your tailnet (laptop, phone, etc.)

***

## Security: VCN + Tailscale (recommended baseline)

With the VCN locked down (only UDP 41641 open) and the Gateway bound to loopback, you get strong defense-in-depth: public traffic is blocked at the network edge, and admin access happens over your tailnet.

This setup often removes the *need* for extra host-based firewall rules purely to stop Internet-wide SSH brute force â€” but you should still keep the OS updated, run `openclaw security audit`, and verify you arenâ€™t accidentally listening on public interfaces.

### What's Already Protected

| Traditional Step   | Needed?     | Why                                                                          |
| ------------------ | ----------- | ---------------------------------------------------------------------------- |
| UFW firewall       | No          | VCN blocks before traffic reaches instance                                   |
| fail2ban           | No          | No brute force if port 22 blocked at VCN                                     |
| sshd hardening     | No          | Tailscale SSH doesn't use sshd                                               |
| Disable root login | No          | Tailscale uses Tailscale identity, not system users                          |
| SSH key-only auth  | No          | Tailscale authenticates via your tailnet                                     |
| IPv6 hardening     | Usually not | Depends on your VCN/subnet settings; verify whatâ€™s actually assigned/exposed |

### Still Recommended

* **Credential permissions:** `chmod 700 ~/.openclaw`
* **Security audit:** `openclaw security audit`
* **System updates:** `sudo apt update && sudo apt upgrade` regularly
* **Monitor Tailscale:** Review devices in [Tailscale admin console](https://login.tailscale.com/admin)

### Verify Security Posture

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Confirm no public ports listening
sudo ss -tlnp | grep -v '127.0.0.1\|::1'

# Verify Tailscale SSH is active
tailscale status | grep -q 'offers: ssh' && echo "Tailscale SSH active"

# Optional: disable sshd entirely
sudo systemctl disable --now ssh
```

***

## Fallback: SSH Tunnel

If Tailscale Serve isn't working, use an SSH tunnel:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# From your local machine (via Tailscale)
ssh -L 18789:127.0.0.1:18789 ubuntu@openclaw
```

Then open `http://localhost:18789`.

***

## Troubleshooting

### Instance creation fails ("Out of capacity")

Free tier ARM instances are popular. Try:

* Different availability domain
* Retry during off-peak hours (early morning)
* Use the "Always Free" filter when selecting shape

### Tailscale won't connect

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check status
sudo tailscale status

# Re-authenticate
sudo tailscale up --ssh --hostname=openclaw --reset
```

### Gateway won't start

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway status
openclaw doctor --non-interactive
journalctl --user -u openclaw-gateway -n 50
```

### Can't reach Control UI

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Verify Tailscale Serve is running
tailscale serve status

# Check gateway is listening
curl http://localhost:18789

# Restart if needed
systemctl --user restart openclaw-gateway
```

### ARM binary issues

Some tools may not have ARM builds. Check:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
uname -m  # Should show aarch64
```

Most npm packages work fine. For binaries, look for `linux-arm64` or `aarch64` releases.

***

## Persistence

All state lives in:

* `~/.openclaw/` â€” config, credentials, session data
* `~/.openclaw/workspace/` â€” workspace (SOUL.md, memory, artifacts)

Back up periodically:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
tar -czvf openclaw-backup.tar.gz ~/.openclaw ~/.openclaw/workspace
```

***

## See Also

* [Gateway remote access](/gateway/remote) â€” other remote access patterns
* [Tailscale integration](/gateway/tailscale) â€” full Tailscale docs
* [Gateway configuration](/gateway/configuration) â€” all config options
* [DigitalOcean guide](/platforms/digitalocean) â€” if you want paid + easier signup
* [Hetzner guide](/install/hetzner) â€” Docker-based alternative


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/raspberry-pi.md`

Source URL: https://docs.openclaw.ai/platforms/raspberry-pi.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Raspberry Pi

# OpenClaw on Raspberry Pi

## Goal

Run a persistent, always-on OpenClaw Gateway on a Raspberry Pi for **\~\$35-80** one-time cost (no monthly fees).

Perfect for:

* 24/7 personal AI assistant
* Home automation hub
* Low-power, always-available Telegram/WhatsApp bot

## Hardware Requirements

| Pi Model        | RAM     | Works?   | Notes                              |
| --------------- | ------- | -------- | ---------------------------------- |
| **Pi 5**        | 4GB/8GB | âœ… Best   | Fastest, recommended               |
| **Pi 4**        | 4GB     | âœ… Good   | Sweet spot for most users          |
| **Pi 4**        | 2GB     | âœ… OK     | Works, add swap                    |
| **Pi 4**        | 1GB     | âš ï¸ Tight | Possible with swap, minimal config |
| **Pi 3B+**      | 1GB     | âš ï¸ Slow  | Works but sluggish                 |
| **Pi Zero 2 W** | 512MB   | âŒ        | Not recommended                    |

**Minimum specs:** 1GB RAM, 1 core, 500MB disk\
**Recommended:** 2GB+ RAM, 64-bit OS, 16GB+ SD card (or USB SSD)

## What You'll Need

* Raspberry Pi 4 or 5 (2GB+ recommended)
* MicroSD card (16GB+) or USB SSD (better performance)
* Power supply (official Pi PSU recommended)
* Network connection (Ethernet or WiFi)
* \~30 minutes

## 1) Flash the OS

Use **Raspberry Pi OS Lite (64-bit)** â€” no desktop needed for a headless server.

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Choose OS: **Raspberry Pi OS Lite (64-bit)**
3. Click the gear icon (âš™ï¸) to pre-configure:
   * Set hostname: `gateway-host`
   * Enable SSH
   * Set username/password
   * Configure WiFi (if not using Ethernet)
4. Flash to your SD card / USB drive
5. Insert and boot the Pi

## 2) Connect via SSH

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
ssh user@gateway-host
# or use the IP address
ssh user@192.168.x.x
```

## 3) System Setup

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl build-essential

# Set timezone (important for cron/reminders)
sudo timedatectl set-timezone America/Chicago  # Change to your timezone
```

## 4) Install Node.js 22 (ARM64)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should show v22.x.x
npm --version
```

## 5) Add Swap (Important for 2GB or less)

Swap prevents out-of-memory crashes:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize for low RAM (reduce swappiness)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 6) Install OpenClaw

### Option A: Standard Install (Recommended)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -fsSL https://openclaw.ai/install.sh | bash
```

### Option B: Hackable Install (For tinkering)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm install
npm run build
npm link
```

The hackable install gives you direct access to logs and code â€” useful for debugging ARM-specific issues.

## 7) Run Onboarding

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw onboard --install-daemon
```

Follow the wizard:

1. **Gateway mode:** Local
2. **Auth:** API keys recommended (OAuth can be finicky on headless Pi)
3. **Channels:** Telegram is easiest to start with
4. **Daemon:** Yes (systemd)

## 8) Verify Installation

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check status
openclaw status

# Check service
sudo systemctl status openclaw

# View logs
journalctl -u openclaw -f
```

## 9) Access the Dashboard

Since the Pi is headless, use an SSH tunnel:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# From your laptop/desktop
ssh -L 18789:localhost:18789 user@gateway-host

# Then open in browser
open http://localhost:18789
```

Or use Tailscale for always-on access:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# On the Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Update config
openclaw config set gateway.bind tailnet
sudo systemctl restart openclaw
```

***

## Performance Optimizations

### Use a USB SSD (Huge Improvement)

SD cards are slow and wear out. A USB SSD dramatically improves performance:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check if booting from USB
lsblk
```

See [Pi USB boot guide](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#usb-mass-storage-boot) for setup.

### Speed up CLI startup (module compile cache)

On lower-power Pi hosts, enable Node's module compile cache so repeated CLI runs are faster:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
grep -q 'NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache' ~/.bashrc || cat >> ~/.bashrc <<'EOF' # pragma: allowlist secret
export NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
mkdir -p /var/tmp/openclaw-compile-cache
export OPENCLAW_NO_RESPAWN=1
EOF
source ~/.bashrc
```

Notes:

* `NODE_COMPILE_CACHE` speeds up subsequent runs (`status`, `health`, `--help`).
* `/var/tmp` survives reboots better than `/tmp`.
* `OPENCLAW_NO_RESPAWN=1` avoids extra startup cost from CLI self-respawn.
* First run warms the cache; later runs benefit most.

### systemd startup tuning (optional)

If this Pi is mostly running OpenClaw, add a service drop-in to reduce restart
jitter and keep startup env stable:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo systemctl edit openclaw
```

```ini  theme={"theme":{"light":"min-light","dark":"min-dark"}}
[Service]
Environment=OPENCLAW_NO_RESPAWN=1
Environment=NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
Restart=always
RestartSec=2
TimeoutStartSec=90
```

Then apply:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo systemctl daemon-reload
sudo systemctl restart openclaw
```

If possible, keep OpenClaw state/cache on SSD-backed storage to avoid SD-card
random-I/O bottlenecks during cold starts.

How `Restart=` policies help automated recovery:
[systemd can automate service recovery](https://www.redhat.com/en/blog/systemd-automate-recovery).

### Reduce Memory Usage

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Disable GPU memory allocation (headless)
echo 'gpu_mem=16' | sudo tee -a /boot/config.txt

# Disable Bluetooth if not needed
sudo systemctl disable bluetooth
```

### Monitor Resources

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check memory
free -h

# Check CPU temperature
vcgencmd measure_temp

# Live monitoring
htop
```

***

## ARM-Specific Notes

### Binary Compatibility

Most OpenClaw features work on ARM64, but some external binaries may need ARM builds:

| Tool               | ARM64 Status | Notes                               |
| ------------------ | ------------ | ----------------------------------- |
| Node.js            | âœ…            | Works great                         |
| WhatsApp (Baileys) | âœ…            | Pure JS, no issues                  |
| Telegram           | âœ…            | Pure JS, no issues                  |
| gog (Gmail CLI)    | âš ï¸           | Check for ARM release               |
| Chromium (browser) | âœ…            | `sudo apt install chromium-browser` |

If a skill fails, check if its binary has an ARM build. Many Go/Rust tools do; some don't.

### 32-bit vs 64-bit

**Always use 64-bit OS.** Node.js and many modern tools require it. Check with:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
uname -m
# Should show: aarch64 (64-bit) not armv7l (32-bit)
```

***

## Recommended Model Setup

Since the Pi is just the Gateway (models run in the cloud), use API-based models:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514",
        "fallbacks": ["openai/gpt-4o-mini"]
      }
    }
  }
}
```

**Don't try to run local LLMs on a Pi** â€” even small models are too slow. Let Claude/GPT do the heavy lifting.

***

## Auto-Start on Boot

The onboarding wizard sets this up, but to verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check service is enabled
sudo systemctl is-enabled openclaw

# Enable if not
sudo systemctl enable openclaw

# Start on boot
sudo systemctl start openclaw
```

***

## Troubleshooting

### Out of Memory (OOM)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check memory
free -h

# Add more swap (see Step 5)
# Or reduce services running on the Pi
```

### Slow Performance

* Use USB SSD instead of SD card
* Disable unused services: `sudo systemctl disable cups bluetooth avahi-daemon`
* Check CPU throttling: `vcgencmd get_throttled` (should return `0x0`)

### Service Won't Start

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Check logs
journalctl -u openclaw --no-pager -n 100

# Common fix: rebuild
cd ~/openclaw  # if using hackable install
npm run build
sudo systemctl restart openclaw
```

### ARM Binary Issues

If a skill fails with "exec format error":

1. Check if the binary has an ARM64 build
2. Try building from source
3. Or use a Docker container with ARM support

### WiFi Drops

For headless Pis on WiFi:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Disable WiFi power management
sudo iwconfig wlan0 power off

# Make permanent
echo 'wireless-power off' | sudo tee -a /etc/network/interfaces
```

***

## Cost Comparison

| Setup          | One-Time Cost | Monthly Cost | Notes                     |
| -------------- | ------------- | ------------ | ------------------------- |
| **Pi 4 (2GB)** | \~\$45        | \$0          | + power (\~\$5/yr)        |
| **Pi 4 (4GB)** | \~\$55        | \$0          | Recommended               |
| **Pi 5 (4GB)** | \~\$60        | \$0          | Best performance          |
| **Pi 5 (8GB)** | \~\$80        | \$0          | Overkill but future-proof |
| DigitalOcean   | \$0           | \$6/mo       | \$72/year                 |
| Hetzner        | \$0           | â‚¬3.79/mo     | \~\$50/year               |

**Break-even:** A Pi pays for itself in \~6-12 months vs cloud VPS.

***

## See Also

* [Linux guide](/platforms/linux) â€” general Linux setup
* [DigitalOcean guide](/platforms/digitalocean) â€” cloud alternative
* [Hetzner guide](/install/hetzner) â€” Docker setup
* [Tailscale](/gateway/tailscale) â€” remote access
* [Nodes](/nodes) â€” pair your laptop/phone with the Pi gateway


Built with [Mintlify](https://mintlify.com).

---

## File: `platforms/windows.md`

Source URL: https://docs.openclaw.ai/platforms/windows.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Windows (WSL2)

# Windows (WSL2)

OpenClaw on Windows is recommended **via WSL2** (Ubuntu recommended). The
CLI + Gateway run inside Linux, which keeps the runtime consistent and makes
tooling far more compatible (Node/Bun/pnpm, Linux binaries, skills). Native
Windows might be trickier. WSL2 gives you the full Linux experience â€” one command
to install: `wsl --install`.

Native Windows companion apps are planned.

## Install (WSL2)

* [Getting Started](/start/getting-started) (use inside WSL)
* [Install & updates](/install/updating)
* Official WSL2 guide (Microsoft): [https://learn.microsoft.com/windows/wsl/install](https://learn.microsoft.com/windows/wsl/install)

## Gateway

* [Gateway runbook](/gateway)
* [Configuration](/gateway/configuration)

## Gateway service install (CLI)

Inside WSL2:

```
openclaw onboard --install-daemon
```

Or:

```
openclaw gateway install
```

Or:

```
openclaw configure
```

Select **Gateway service** when prompted.

Repair/migrate:

```
openclaw doctor
```

## Gateway auto-start before Windows login

For headless setups, ensure the full boot chain runs even when no one logs into
Windows.

### 1) Keep user services running without login

Inside WSL:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo loginctl enable-linger "$(whoami)"
```

### 2) Install the OpenClaw gateway user service

Inside WSL:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw gateway install
```

### 3) Start WSL automatically at Windows boot

In PowerShell as Administrator:

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
schtasks /create /tn "WSL Boot" /tr "wsl.exe -d Ubuntu --exec /bin/true" /sc onstart /ru SYSTEM
```

Replace `Ubuntu` with your distro name from:

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
wsl --list --verbose
```

### Verify startup chain

After a reboot (before Windows sign-in), check from WSL:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
systemctl --user is-enabled openclaw-gateway
systemctl --user status openclaw-gateway --no-pager
```

## Advanced: expose WSL services over LAN (portproxy)

WSL has its own virtual network. If another machine needs to reach a service
running **inside WSL** (SSH, a local TTS server, or the Gateway), you must
forward a Windows port to the current WSL IP. The WSL IP changes after restarts,
so you may need to refresh the forwarding rule.

Example (PowerShell **as Administrator**):

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

Allow the port through Windows Firewall (one-time):

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

Refresh the portproxy after WSL restarts:

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
```

Notes:

* SSH from another machine targets the **Windows host IP** (example: `ssh user@windows-host -p 2222`).
* Remote nodes must point at a **reachable** Gateway URL (not `127.0.0.1`); use
  `openclaw status --all` to confirm.
* Use `listenaddress=0.0.0.0` for LAN access; `127.0.0.1` keeps it local only.
* If you want this automatic, register a Scheduled Task to run the refresh
  step at login.

## Step-by-step WSL2 install

### 1) Install WSL2 + Ubuntu

Open PowerShell (Admin):

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
wsl --install
# Or pick a distro explicitly:
wsl --list --online
wsl --install -d Ubuntu-24.04
```

Reboot if Windows asks.

### 2) Enable systemd (required for gateway install)

In your WSL terminal:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Then from PowerShell:

```powershell  theme={"theme":{"light":"min-light","dark":"min-dark"}}
wsl --shutdown
```

Re-open Ubuntu, then verify:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
systemctl --user status
```

### 3) Install OpenClaw (inside WSL)

Follow the Linux Getting Started flow inside WSL:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build
openclaw onboard
```

Full guide: [Getting Started](/start/getting-started)

## Windows companion app

We do not have a Windows companion app yet. Contributions are welcome if you want
contributions to make it happen.


Built with [Mintlify](https://mintlify.com).

---

