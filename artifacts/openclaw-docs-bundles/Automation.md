# Automation

Source category: `Automation`

Files included: 8

---

## File: `automation/auth-monitoring.md`

Source URL: https://docs.openclaw.ai/automation/auth-monitoring.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Auth Monitoring

# Auth monitoring

OpenClaw exposes OAuth expiry health via `openclaw models status`. Use that for
automation and alerting; scripts are optional extras for phone workflows.

## Preferred: CLI check (portable)

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw models status --check
```

Exit codes:

* `0`: OK
* `1`: expired or missing credentials
* `2`: expiring soon (within 24h)

This works in cron/systemd and requires no extra scripts.

## Optional scripts (ops / phone workflows)

These live under `scripts/` and are **optional**. They assume SSH access to the
gateway host and are tuned for systemd + Termux.

* `scripts/claude-auth-status.sh` now uses `openclaw models status --json` as the
  source of truth (falling back to direct file reads if the CLI is unavailable),
  so keep `openclaw` on `PATH` for timers.
* `scripts/auth-monitor.sh`: cron/systemd timer target; sends alerts (ntfy or phone).
* `scripts/systemd/openclaw-auth-monitor.{service,timer}`: systemd user timer.
* `scripts/claude-auth-status.sh`: Claude Code + OpenClaw auth checker (full/json/simple).
* `scripts/mobile-reauth.sh`: guided reâ€‘auth flow over SSH.
* `scripts/termux-quick-auth.sh`: oneâ€‘tap widget status + open auth URL.
* `scripts/termux-auth-widget.sh`: full guided widget flow.
* `scripts/termux-sync-widget.sh`: sync Claude Code creds â†’ OpenClaw.

If you donâ€™t need phone automation or systemd timers, skip these scripts.


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/cron-jobs.md`

Source URL: https://docs.openclaw.ai/automation/cron-jobs.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Cron Jobs

# Cron jobs (Gateway scheduler)

> **Cron vs Heartbeat?** See [Cron vs Heartbeat](/automation/cron-vs-heartbeat) for guidance on when to use each.

Cron is the Gatewayâ€™s built-in scheduler. It persists jobs, wakes the agent at
the right time, and can optionally deliver output back to a chat.

If you want *â€œrun this every morningâ€* or *â€œpoke the agent in 20 minutesâ€*,
cron is the mechanism.

Troubleshooting: [/automation/troubleshooting](/automation/troubleshooting)

## TL;DR

* Cron runs **inside the Gateway** (not inside the model).
* Jobs persist under `~/.openclaw/cron/` so restarts donâ€™t lose schedules.
* Two execution styles:
  * **Main session**: enqueue a system event, then run on the next heartbeat.
  * **Isolated**: run a dedicated agent turn in `cron:<jobId>`, with delivery (announce by default or none).
* Wakeups are first-class: a job can request â€œwake nowâ€ vs â€œnext heartbeatâ€.
* Webhook posting is per job via `delivery.mode = "webhook"` + `delivery.to = "<url>"`.
* Legacy fallback remains for stored jobs with `notify: true` when `cron.webhook` is set, migrate those jobs to webhook delivery mode.
* For upgrades, `openclaw doctor --fix` can normalize legacy cron store fields before the scheduler touches them.

## Quick start (actionable)

Create a one-shot reminder, verify it exists, and run it immediately:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Reminder" \
  --at "2026-02-01T16:00:00Z" \
  --session main \
  --system-event "Reminder: check the cron docs draft" \
  --wake now \
  --delete-after-run

openclaw cron list
openclaw cron run <job-id>
openclaw cron runs --id <job-id>
```

Schedule a recurring isolated job with delivery:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Morning brief" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize overnight updates." \
  --announce \
  --channel slack \
  --to "channel:C1234567890"
```

## Tool-call equivalents (Gateway cron tool)

For the canonical JSON shapes and examples, see [JSON schema for tool calls](/automation/cron-jobs#json-schema-for-tool-calls).

## Where cron jobs are stored

Cron jobs are persisted on the Gateway host at `~/.openclaw/cron/jobs.json` by default.
The Gateway loads the file into memory and writes it back on changes, so manual edits
are only safe when the Gateway is stopped. Prefer `openclaw cron add/edit` or the cron
tool call API for changes.

## Beginner-friendly overview

Think of a cron job as: **when** to run + **what** to do.

1. **Choose a schedule**
   * One-shot reminder â†’ `schedule.kind = "at"` (CLI: `--at`)
   * Repeating job â†’ `schedule.kind = "every"` or `schedule.kind = "cron"`
   * If your ISO timestamp omits a timezone, it is treated as **UTC**.

2. **Choose where it runs**
   * `sessionTarget: "main"` â†’ run during the next heartbeat with main context.
   * `sessionTarget: "isolated"` â†’ run a dedicated agent turn in `cron:<jobId>`.

3. **Choose the payload**
   * Main session â†’ `payload.kind = "systemEvent"`
   * Isolated session â†’ `payload.kind = "agentTurn"`

Optional: one-shot jobs (`schedule.kind = "at"`) delete after success by default. Set
`deleteAfterRun: false` to keep them (they will disable after success).

## Concepts

### Jobs

A cron job is a stored record with:

* a **schedule** (when it should run),
* a **payload** (what it should do),
* optional **delivery mode** (`announce`, `webhook`, or `none`).
* optional **agent binding** (`agentId`): run the job under a specific agent; if
  missing or unknown, the gateway falls back to the default agent.

Jobs are identified by a stable `jobId` (used by CLI/Gateway APIs).
In agent tool calls, `jobId` is canonical; legacy `id` is accepted for compatibility.
One-shot jobs auto-delete after success by default; set `deleteAfterRun: false` to keep them.

### Schedules

Cron supports three schedule kinds:

* `at`: one-shot timestamp via `schedule.at` (ISO 8601).
* `every`: fixed interval (ms).
* `cron`: 5-field cron expression (or 6-field with seconds) with optional IANA timezone.

Cron expressions use `croner`. If a timezone is omitted, the Gateway hostâ€™s
local timezone is used.

To reduce top-of-hour load spikes across many gateways, OpenClaw applies a
deterministic per-job stagger window of up to 5 minutes for recurring
top-of-hour expressions (for example `0 * * * *`, `0 */2 * * *`). Fixed-hour
expressions such as `0 7 * * *` remain exact.

For any cron schedule, you can set an explicit stagger window with `schedule.staggerMs`
(`0` keeps exact timing). CLI shortcuts:

* `--stagger 30s` (or `1m`, `5m`) to set an explicit stagger window.
* `--exact` to force `staggerMs = 0`.

### Main vs isolated execution

#### Main session jobs (system events)

Main jobs enqueue a system event and optionally wake the heartbeat runner.
They must use `payload.kind = "systemEvent"`.

* `wakeMode: "now"` (default): event triggers an immediate heartbeat run.
* `wakeMode: "next-heartbeat"`: event waits for the next scheduled heartbeat.

This is the best fit when you want the normal heartbeat prompt + main-session context.
See [Heartbeat](/gateway/heartbeat).

#### Isolated jobs (dedicated cron sessions)

Isolated jobs run a dedicated agent turn in session `cron:<jobId>`.

Key behaviors:

* Prompt is prefixed with `[cron:<jobId> <job name>]` for traceability.
* Each run starts a **fresh session id** (no prior conversation carry-over).
* Default behavior: if `delivery` is omitted, isolated jobs announce a summary (`delivery.mode = "announce"`).
* `delivery.mode` chooses what happens:
  * `announce`: deliver a summary to the target channel and post a brief summary to the main session.
  * `webhook`: POST the finished event payload to `delivery.to` when the finished event includes a summary.
  * `none`: internal only (no delivery, no main-session summary).
* `wakeMode` controls when the main-session summary posts:
  * `now`: immediate heartbeat.
  * `next-heartbeat`: waits for the next scheduled heartbeat.

Use isolated jobs for noisy, frequent, or "background chores" that shouldn't spam
your main chat history.

### Payload shapes (what runs)

Two payload kinds are supported:

* `systemEvent`: main-session only, routed through the heartbeat prompt.
* `agentTurn`: isolated-session only, runs a dedicated agent turn.

Common `agentTurn` fields:

* `message`: required text prompt.
* `model` / `thinking`: optional overrides (see below).
* `timeoutSeconds`: optional timeout override.
* `lightContext`: optional lightweight bootstrap mode for jobs that do not need workspace bootstrap file injection.

Delivery config:

* `delivery.mode`: `none` | `announce` | `webhook`.
* `delivery.channel`: `last` or a specific channel.
* `delivery.to`: channel-specific target (announce) or webhook URL (webhook mode).
* `delivery.bestEffort`: avoid failing the job if announce delivery fails.

Announce delivery suppresses messaging tool sends for the run; use `delivery.channel`/`delivery.to`
to target the chat instead. When `delivery.mode = "none"`, no summary is posted to the main session.

If `delivery` is omitted for isolated jobs, OpenClaw defaults to `announce`.

#### Announce delivery flow

When `delivery.mode = "announce"`, cron delivers directly via the outbound channel adapters.
The main agent is not spun up to craft or forward the message.

Behavior details:

* Content: delivery uses the isolated run's outbound payloads (text/media) with normal chunking and
  channel formatting.
* Heartbeat-only responses (`HEARTBEAT_OK` with no real content) are not delivered.
* If the isolated run already sent a message to the same target via the message tool, delivery is
  skipped to avoid duplicates.
* Missing or invalid delivery targets fail the job unless `delivery.bestEffort = true`.
* A short summary is posted to the main session only when `delivery.mode = "announce"`.
* The main-session summary respects `wakeMode`: `now` triggers an immediate heartbeat and
  `next-heartbeat` waits for the next scheduled heartbeat.

#### Webhook delivery flow

When `delivery.mode = "webhook"`, cron posts the finished event payload to `delivery.to` when the finished event includes a summary.

Behavior details:

* The endpoint must be a valid HTTP(S) URL.
* No channel delivery is attempted in webhook mode.
* No main-session summary is posted in webhook mode.
* If `cron.webhookToken` is set, auth header is `Authorization: Bearer <cron.webhookToken>`.
* Deprecated fallback: stored legacy jobs with `notify: true` still post to `cron.webhook` (if configured), with a warning so you can migrate to `delivery.mode = "webhook"`.

### Model and thinking overrides

Isolated jobs (`agentTurn`) can override the model and thinking level:

* `model`: Provider/model string (e.g., `anthropic/claude-sonnet-4-20250514`) or alias (e.g., `opus`)
* `thinking`: Thinking level (`off`, `minimal`, `low`, `medium`, `high`, `xhigh`; GPT-5.2 + Codex models only)

Note: You can set `model` on main-session jobs too, but it changes the shared main
session model. We recommend model overrides only for isolated jobs to avoid
unexpected context shifts.

Resolution priority:

1. Job payload override (highest)
2. Hook-specific defaults (e.g., `hooks.gmail.model`)
3. Agent config default

### Lightweight bootstrap context

Isolated jobs (`agentTurn`) can set `lightContext: true` to run with lightweight bootstrap context.

* Use this for scheduled chores that do not need workspace bootstrap file injection.
* In practice, the embedded runtime runs with `bootstrapContextMode: "lightweight"`, which keeps cron bootstrap context empty on purpose.
* CLI equivalents: `openclaw cron add --light-context ...` and `openclaw cron edit --light-context`.

### Delivery (channel + target)

Isolated jobs can deliver output to a channel via the top-level `delivery` config:

* `delivery.mode`: `announce` (channel delivery), `webhook` (HTTP POST), or `none`.
* `delivery.channel`: `whatsapp` / `telegram` / `discord` / `slack` / `mattermost` (plugin) / `signal` / `imessage` / `last`.
* `delivery.to`: channel-specific recipient target.

`announce` delivery is only valid for isolated jobs (`sessionTarget: "isolated"`).
`webhook` delivery is valid for both main and isolated jobs.

If `delivery.channel` or `delivery.to` is omitted, cron can fall back to the main sessionâ€™s
â€œlast routeâ€ (the last place the agent replied).

Target format reminders:

* Slack/Discord/Mattermost (plugin) targets should use explicit prefixes (e.g. `channel:<id>`, `user:<id>`) to avoid ambiguity.
  Mattermost bare 26-char IDs are resolved **user-first** (DM if user exists, channel otherwise) â€” use `user:<id>` or `channel:<id>` for deterministic routing.
* Telegram topics should use the `:topic:` form (see below).

#### Telegram delivery targets (topics / forum threads)

Telegram supports forum topics via `message_thread_id`. For cron delivery, you can encode
the topic/thread into the `to` field:

* `-1001234567890` (chat id only)
* `-1001234567890:topic:123` (preferred: explicit topic marker)
* `-1001234567890:123` (shorthand: numeric suffix)

Prefixed targets like `telegram:...` / `telegram:group:...` are also accepted:

* `telegram:group:-1001234567890:topic:123`

## JSON schema for tool calls

Use these shapes when calling Gateway `cron.*` tools directly (agent tool calls or RPC).
CLI flags accept human durations like `20m`, but tool calls should use an ISO 8601 string
for `schedule.at` and milliseconds for `schedule.everyMs`.

### cron.add params

One-shot, main session job (system event):

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "Reminder",
  "schedule": { "kind": "at", "at": "2026-02-01T16:00:00Z" },
  "sessionTarget": "main",
  "wakeMode": "now",
  "payload": { "kind": "systemEvent", "text": "Reminder text" },
  "deleteAfterRun": true
}
```

Recurring, isolated job with delivery:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "Morning brief",
  "schedule": { "kind": "cron", "expr": "0 7 * * *", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "next-heartbeat",
  "payload": {
    "kind": "agentTurn",
    "message": "Summarize overnight updates.",
    "lightContext": true
  },
  "delivery": {
    "mode": "announce",
    "channel": "slack",
    "to": "channel:C1234567890",
    "bestEffort": true
  }
}
```

Notes:

* `schedule.kind`: `at` (`at`), `every` (`everyMs`), or `cron` (`expr`, optional `tz`).
* `schedule.at` accepts ISO 8601 (timezone optional; treated as UTC when omitted).
* `everyMs` is milliseconds.
* `sessionTarget` must be `"main"` or `"isolated"` and must match `payload.kind`.
* Optional fields: `agentId`, `description`, `enabled`, `deleteAfterRun` (defaults to true for `at`),
  `delivery`.
* `wakeMode` defaults to `"now"` when omitted.

### cron.update params

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "jobId": "job-123",
  "patch": {
    "enabled": false,
    "schedule": { "kind": "every", "everyMs": 3600000 }
  }
}
```

Notes:

* `jobId` is canonical; `id` is accepted for compatibility.
* Use `agentId: null` in the patch to clear an agent binding.

### cron.run and cron.remove params

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{ "jobId": "job-123", "mode": "force" }
```

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{ "jobId": "job-123" }
```

## Storage & history

* Job store: `~/.openclaw/cron/jobs.json` (Gateway-managed JSON).
* Run history: `~/.openclaw/cron/runs/<jobId>.jsonl` (JSONL, auto-pruned by size and line count).
* Isolated cron run sessions in `sessions.json` are pruned by `cron.sessionRetention` (default `24h`; set `false` to disable).
* Override store path: `cron.store` in config.

## Retry policy

When a job fails, OpenClaw classifies errors as **transient** (retryable) or **permanent** (disable immediately).

### Transient errors (retried)

* Rate limit (429, too many requests, resource exhausted)
* Provider overload (for example Anthropic `529 overloaded_error`, overload fallback summaries)
* Network errors (timeout, ECONNRESET, fetch failed, socket)
* Server errors (5xx)
* Cloudflare-related errors

### Permanent errors (no retry)

* Auth failures (invalid API key, unauthorized)
* Config or validation errors
* Other non-transient errors

### Default behavior (no config)

**One-shot jobs (`schedule.kind: "at"`):**

* On transient error: retry up to 3 times with exponential backoff (30s â†’ 1m â†’ 5m).
* On permanent error: disable immediately.
* On success or skip: disable (or delete if `deleteAfterRun: true`).

**Recurring jobs (`cron` / `every`):**

* On any error: apply exponential backoff (30s â†’ 1m â†’ 5m â†’ 15m â†’ 60m) before the next scheduled run.
* Job stays enabled; backoff resets after the next successful run.

Configure `cron.retry` to override these defaults (see [Configuration](/automation/cron-jobs#configuration)).

## Configuration

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  cron: {
    enabled: true, // default true
    store: "~/.openclaw/cron/jobs.json",
    maxConcurrentRuns: 1, // default 1
    // Optional: override retry policy for one-shot jobs
    retry: {
      maxAttempts: 3,
      backoffMs: [60000, 120000, 300000],
      retryOn: ["rate_limit", "overloaded", "network", "server_error"],
    },
    webhook: "https://example.invalid/legacy", // deprecated fallback for stored notify:true jobs
    webhookToken: "replace-with-dedicated-webhook-token", // optional bearer token for webhook mode
    sessionRetention: "24h", // duration string or false
    runLog: {
      maxBytes: "2mb", // default 2_000_000 bytes
      keepLines: 2000, // default 2000
    },
  },
}
```

Run-log pruning behavior:

* `cron.runLog.maxBytes`: max run-log file size before pruning.
* `cron.runLog.keepLines`: when pruning, keep only the newest N lines.
* Both apply to `cron/runs/<jobId>.jsonl` files.

Webhook behavior:

* Preferred: set `delivery.mode: "webhook"` with `delivery.to: "https://..."` per job.
* Webhook URLs must be valid `http://` or `https://` URLs.
* When posted, payload is the cron finished event JSON.
* If `cron.webhookToken` is set, auth header is `Authorization: Bearer <cron.webhookToken>`.
* If `cron.webhookToken` is not set, no `Authorization` header is sent.
* Deprecated fallback: stored legacy jobs with `notify: true` still use `cron.webhook` when present.

Disable cron entirely:

* `cron.enabled: false` (config)
* `OPENCLAW_SKIP_CRON=1` (env)

## Maintenance

Cron has two built-in maintenance paths: isolated run-session retention and run-log pruning.

### Defaults

* `cron.sessionRetention`: `24h` (set `false` to disable run-session pruning)
* `cron.runLog.maxBytes`: `2_000_000` bytes
* `cron.runLog.keepLines`: `2000`

### How it works

* Isolated runs create session entries (`...:cron:<jobId>:run:<uuid>`) and transcript files.
* The reaper removes expired run-session entries older than `cron.sessionRetention`.
* For removed run sessions no longer referenced by the session store, OpenClaw archives transcript files and purges old deleted archives on the same retention window.
* After each run append, `cron/runs/<jobId>.jsonl` is size-checked:
  * if file size exceeds `runLog.maxBytes`, it is trimmed to the newest `runLog.keepLines` lines.

### Performance caveat for high volume schedulers

High-frequency cron setups can generate large run-session and run-log footprints. Maintenance is built in, but loose limits can still create avoidable IO and cleanup work.

What to watch:

* long `cron.sessionRetention` windows with many isolated runs
* high `cron.runLog.keepLines` combined with large `runLog.maxBytes`
* many noisy recurring jobs writing to the same `cron/runs/<jobId>.jsonl`

What to do:

* keep `cron.sessionRetention` as short as your debugging/audit needs allow
* keep run logs bounded with moderate `runLog.maxBytes` and `runLog.keepLines`
* move noisy background jobs to isolated mode with delivery rules that avoid unnecessary chatter
* review growth periodically with `openclaw cron runs` and adjust retention before logs become large

### Customize examples

Keep run sessions for a week and allow bigger run logs:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  cron: {
    sessionRetention: "7d",
    runLog: {
      maxBytes: "10mb",
      keepLines: 5000,
    },
  },
}
```

Disable isolated run-session pruning but keep run-log pruning:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  cron: {
    sessionRetention: false,
    runLog: {
      maxBytes: "5mb",
      keepLines: 3000,
    },
  },
}
```

Tune for high-volume cron usage (example):

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  cron: {
    sessionRetention: "12h",
    runLog: {
      maxBytes: "3mb",
      keepLines: 1500,
    },
  },
}
```

## CLI quickstart

One-shot reminder (UTC ISO, auto-delete after success):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Send reminder" \
  --at "2026-01-12T18:00:00Z" \
  --session main \
  --system-event "Reminder: submit expense report." \
  --wake now \
  --delete-after-run
```

One-shot reminder (main session, wake immediately):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Calendar check" \
  --at "20m" \
  --session main \
  --system-event "Next heartbeat: check calendar." \
  --wake now
```

Recurring isolated job (announce to WhatsApp):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Morning status" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize inbox + calendar for today." \
  --announce \
  --channel whatsapp \
  --to "+15551234567"
```

Recurring cron job with explicit 30-second stagger:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Minute watcher" \
  --cron "0 * * * * *" \
  --tz "UTC" \
  --stagger 30s \
  --session isolated \
  --message "Run minute watcher checks." \
  --announce
```

Recurring isolated job (deliver to a Telegram topic):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Nightly summary (topic)" \
  --cron "0 22 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize today; send to the nightly topic." \
  --announce \
  --channel telegram \
  --to "-1001234567890:topic:123"
```

Isolated job with model and thinking override:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Deep analysis" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Weekly deep analysis of project progress." \
  --model "opus" \
  --thinking high \
  --announce \
  --channel whatsapp \
  --to "+15551234567"
```

Agent selection (multi-agent setups):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Pin a job to agent "ops" (falls back to default if that agent is missing)
openclaw cron add --name "Ops sweep" --cron "0 6 * * *" --session isolated --message "Check ops queue" --agent ops

# Switch or clear the agent on an existing job
openclaw cron edit <jobId> --agent ops
openclaw cron edit <jobId> --clear-agent
```

Manual run (force is the default, use `--due` to only run when due):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron run <jobId>
openclaw cron run <jobId> --due
```

`cron.run` now acknowledges once the manual run is queued, not after the job finishes. Successful queue responses look like `{ ok: true, enqueued: true, runId }`. If the job is already running or `--due` finds nothing due, the response stays `{ ok: true, ran: false, reason }`. Use `openclaw cron runs --id <jobId>` or the `cron.runs` gateway method to inspect the eventual finished entry.

Edit an existing job (patch fields):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron edit <jobId> \
  --message "Updated prompt" \
  --model "opus" \
  --thinking low
```

Force an existing cron job to run exactly on schedule (no stagger):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron edit <jobId> --exact
```

Run history:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron runs --id <jobId> --limit 50
```

Immediate system event without creating a job:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw system event --mode now --text "Next heartbeat: check battery."
```

## Gateway API surface

* `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`
* `cron.run` (force or due), `cron.runs`
  For immediate system events without a job, use [`openclaw system event`](/cli/system).

## Troubleshooting

### â€œNothing runsâ€

* Check cron is enabled: `cron.enabled` and `OPENCLAW_SKIP_CRON`.
* Check the Gateway is running continuously (cron runs inside the Gateway process).
* For `cron` schedules: confirm timezone (`--tz`) vs the host timezone.

### A recurring job keeps delaying after failures

* OpenClaw applies exponential retry backoff for recurring jobs after consecutive errors:
  30s, 1m, 5m, 15m, then 60m between retries.
* Backoff resets automatically after the next successful run.
* One-shot (`at`) jobs retry transient errors (rate limit, overloaded, network, server\_error) up to 3 times with backoff; permanent errors disable immediately. See [Retry policy](/automation/cron-jobs#retry-policy).

### Telegram delivers to the wrong place

* For forum topics, use `-100â€¦:topic:<id>` so itâ€™s explicit and unambiguous.
* If you see `telegram:...` prefixes in logs or stored â€œlast routeâ€ targets, thatâ€™s normal;
  cron delivery accepts them and still parses topic IDs correctly.

### Subagent announce delivery retries

* When a subagent run completes, the gateway announces the result to the requester session.
* If the announce flow returns `false` (e.g. requester session is busy), the gateway retries up to 3 times with tracking via `announceRetryCount`.
* Announces older than 5 minutes past `endedAt` are force-expired to prevent stale entries from looping indefinitely.
* If you see repeated announce deliveries in logs, check the subagent registry for entries with high `announceRetryCount` values.


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/cron-vs-heartbeat.md`

Source URL: https://docs.openclaw.ai/automation/cron-vs-heartbeat.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Cron vs Heartbeat

# Cron vs Heartbeat: When to Use Each

Both heartbeats and cron jobs let you run tasks on a schedule. This guide helps you choose the right mechanism for your use case.

## Quick Decision Guide

| Use Case                             | Recommended         | Why                                      |
| ------------------------------------ | ------------------- | ---------------------------------------- |
| Check inbox every 30 min             | Heartbeat           | Batches with other checks, context-aware |
| Send daily report at 9am sharp       | Cron (isolated)     | Exact timing needed                      |
| Monitor calendar for upcoming events | Heartbeat           | Natural fit for periodic awareness       |
| Run weekly deep analysis             | Cron (isolated)     | Standalone task, can use different model |
| Remind me in 20 minutes              | Cron (main, `--at`) | One-shot with precise timing             |
| Background project health check      | Heartbeat           | Piggybacks on existing cycle             |

## Heartbeat: Periodic Awareness

Heartbeats run in the **main session** at a regular interval (default: 30 min). They're designed for the agent to check on things and surface anything important.

### When to use heartbeat

* **Multiple periodic checks**: Instead of 5 separate cron jobs checking inbox, calendar, weather, notifications, and project status, a single heartbeat can batch all of these.
* **Context-aware decisions**: The agent has full main-session context, so it can make smart decisions about what's urgent vs. what can wait.
* **Conversational continuity**: Heartbeat runs share the same session, so the agent remembers recent conversations and can follow up naturally.
* **Low-overhead monitoring**: One heartbeat replaces many small polling tasks.

### Heartbeat advantages

* **Batches multiple checks**: One agent turn can review inbox, calendar, and notifications together.
* **Reduces API calls**: A single heartbeat is cheaper than 5 isolated cron jobs.
* **Context-aware**: The agent knows what you've been working on and can prioritize accordingly.
* **Smart suppression**: If nothing needs attention, the agent replies `HEARTBEAT_OK` and no message is delivered.
* **Natural timing**: Drifts slightly based on queue load, which is fine for most monitoring.

### Heartbeat example: HEARTBEAT.md checklist

```md  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Heartbeat checklist

- Check email for urgent messages
- Review calendar for events in next 2 hours
- If a background task finished, summarize results
- If idle for 8+ hours, send a brief check-in
```

The agent reads this on each heartbeat and handles all items in one turn.

### Configuring heartbeat

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m", // interval
        target: "last", // explicit alert delivery target (default is "none")
        activeHours: { start: "08:00", end: "22:00" }, // optional
      },
    },
  },
}
```

See [Heartbeat](/gateway/heartbeat) for full configuration.

## Cron: Precise Scheduling

Cron jobs run at precise times and can run in isolated sessions without affecting main context.
Recurring top-of-hour schedules are automatically spread by a deterministic
per-job offset in a 0-5 minute window.

### When to use cron

* **Exact timing required**: "Send this at 9:00 AM every Monday" (not "sometime around 9").
* **Standalone tasks**: Tasks that don't need conversational context.
* **Different model/thinking**: Heavy analysis that warrants a more powerful model.
* **One-shot reminders**: "Remind me in 20 minutes" with `--at`.
* **Noisy/frequent tasks**: Tasks that would clutter main session history.
* **External triggers**: Tasks that should run independently of whether the agent is otherwise active.

### Cron advantages

* **Precise timing**: 5-field or 6-field (seconds) cron expressions with timezone support.
* **Built-in load spreading**: recurring top-of-hour schedules are staggered by up to 5 minutes by default.
* **Per-job control**: override stagger with `--stagger <duration>` or force exact timing with `--exact`.
* **Session isolation**: Runs in `cron:<jobId>` without polluting main history.
* **Model overrides**: Use a cheaper or more powerful model per job.
* **Delivery control**: Isolated jobs default to `announce` (summary); choose `none` as needed.
* **Immediate delivery**: Announce mode posts directly without waiting for heartbeat.
* **No agent context needed**: Runs even if main session is idle or compacted.
* **One-shot support**: `--at` for precise future timestamps.

### Cron example: Daily morning briefing

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Morning briefing" \
  --cron "0 7 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Generate today's briefing: weather, calendar, top emails, news summary." \
  --model opus \
  --announce \
  --channel whatsapp \
  --to "+15551234567"
```

This runs at exactly 7:00 AM New York time, uses Opus for quality, and announces a summary directly to WhatsApp.

### Cron example: One-shot reminder

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Meeting reminder" \
  --at "20m" \
  --session main \
  --system-event "Reminder: standup meeting starts in 10 minutes." \
  --wake now \
  --delete-after-run
```

See [Cron jobs](/automation/cron-jobs) for full CLI reference.

## Decision Flowchart

```
Does the task need to run at an EXACT time?
  YES -> Use cron
  NO  -> Continue...

Does the task need isolation from main session?
  YES -> Use cron (isolated)
  NO  -> Continue...

Can this task be batched with other periodic checks?
  YES -> Use heartbeat (add to HEARTBEAT.md)
  NO  -> Use cron

Is this a one-shot reminder?
  YES -> Use cron with --at
  NO  -> Continue...

Does it need a different model or thinking level?
  YES -> Use cron (isolated) with --model/--thinking
  NO  -> Use heartbeat
```

## Combining Both

The most efficient setup uses **both**:

1. **Heartbeat** handles routine monitoring (inbox, calendar, notifications) in one batched turn every 30 minutes.
2. **Cron** handles precise schedules (daily reports, weekly reviews) and one-shot reminders.

### Example: Efficient automation setup

**HEARTBEAT.md** (checked every 30 min):

```md  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Heartbeat checklist

- Scan inbox for urgent emails
- Check calendar for events in next 2h
- Review any pending tasks
- Light check-in if quiet for 8+ hours
```

**Cron jobs** (precise timing):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Daily morning briefing at 7am
openclaw cron add --name "Morning brief" --cron "0 7 * * *" --session isolated --message "..." --announce

# Weekly project review on Mondays at 9am
openclaw cron add --name "Weekly review" --cron "0 9 * * 1" --session isolated --message "..." --model opus

# One-shot reminder
openclaw cron add --name "Call back" --at "2h" --session main --system-event "Call back the client" --wake now
```

## Lobster: Deterministic workflows with approvals

Lobster is the workflow runtime for **multi-step tool pipelines** that need deterministic execution and explicit approvals.
Use it when the task is more than a single agent turn, and you want a resumable workflow with human checkpoints.

### When Lobster fits

* **Multi-step automation**: You need a fixed pipeline of tool calls, not a one-off prompt.
* **Approval gates**: Side effects should pause until you approve, then resume.
* **Resumable runs**: Continue a paused workflow without re-running earlier steps.

### How it pairs with heartbeat and cron

* **Heartbeat/cron** decide *when* a run happens.
* **Lobster** defines *what steps* happen once the run starts.

For scheduled workflows, use cron or heartbeat to trigger an agent turn that calls Lobster.
For ad-hoc workflows, call Lobster directly.

### Operational notes (from the code)

* Lobster runs as a **local subprocess** (`lobster` CLI) in tool mode and returns a **JSON envelope**.
* If the tool returns `needs_approval`, you resume with a `resumeToken` and `approve` flag.
* The tool is an **optional plugin**; enable it additively via `tools.alsoAllow: ["lobster"]` (recommended).
* Lobster expects the `lobster` CLI to be available on `PATH`.

See [Lobster](/tools/lobster) for full usage and examples.

## Main Session vs Isolated Session

Both heartbeat and cron can interact with the main session, but differently:

|         | Heartbeat                       | Cron (main)              | Cron (isolated)            |
| ------- | ------------------------------- | ------------------------ | -------------------------- |
| Session | Main                            | Main (via system event)  | `cron:<jobId>`             |
| History | Shared                          | Shared                   | Fresh each run             |
| Context | Full                            | Full                     | None (starts clean)        |
| Model   | Main session model              | Main session model       | Can override               |
| Output  | Delivered if not `HEARTBEAT_OK` | Heartbeat prompt + event | Announce summary (default) |

### When to use main session cron

Use `--session main` with `--system-event` when you want:

* The reminder/event to appear in main session context
* The agent to handle it during the next heartbeat with full context
* No separate isolated run

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Check project" \
  --every "4h" \
  --session main \
  --system-event "Time for a project health check" \
  --wake now
```

### When to use isolated cron

Use `--session isolated` when you want:

* A clean slate without prior context
* Different model or thinking settings
* Announce summaries directly to a channel
* History that doesn't clutter main session

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron add \
  --name "Deep analysis" \
  --cron "0 6 * * 0" \
  --session isolated \
  --message "Weekly codebase analysis..." \
  --model opus \
  --thinking high \
  --announce
```

## Cost Considerations

| Mechanism       | Cost Profile                                            |
| --------------- | ------------------------------------------------------- |
| Heartbeat       | One turn every N minutes; scales with HEARTBEAT.md size |
| Cron (main)     | Adds event to next heartbeat (no isolated turn)         |
| Cron (isolated) | Full agent turn per job; can use cheaper model          |

**Tips**:

* Keep `HEARTBEAT.md` small to minimize token overhead.
* Batch similar checks into heartbeat instead of multiple cron jobs.
* Use `target: "none"` on heartbeat if you only want internal processing.
* Use isolated cron with a cheaper model for routine tasks.

## Related

* [Heartbeat](/gateway/heartbeat) - full heartbeat configuration
* [Cron jobs](/automation/cron-jobs) - full cron CLI and API reference
* [System](/cli/system) - system events + heartbeat controls


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/gmail-pubsub.md`

Source URL: https://docs.openclaw.ai/automation/gmail-pubsub.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Gmail PubSub

# Gmail Pub/Sub -> OpenClaw

Goal: Gmail watch -> Pub/Sub push -> `gog gmail watch serve` -> OpenClaw webhook.

## Prereqs

* `gcloud` installed and logged in ([install guide](https://docs.cloud.google.com/sdk/docs/install-sdk)).
* `gog` (gogcli) installed and authorized for the Gmail account ([gogcli.sh](https://gogcli.sh/)).
* OpenClaw hooks enabled (see [Webhooks](/automation/webhook)).
* `tailscale` logged in ([tailscale.com](https://tailscale.com/)). Supported setup uses Tailscale Funnel for the public HTTPS endpoint.
  Other tunnel services can work, but are DIY/unsupported and require manual wiring.
  Right now, Tailscale is what we support.

Example hook config (enable Gmail preset mapping):

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    enabled: true,
    token: "OPENCLAW_HOOK_TOKEN",
    path: "/hooks",
    presets: ["gmail"],
  },
}
```

To deliver the Gmail summary to a chat surface, override the preset with a mapping
that sets `deliver` + optional `channel`/`to`:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    enabled: true,
    token: "OPENCLAW_HOOK_TOKEN",
    presets: ["gmail"],
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate: "New email from {{messages[0].from}}\nSubject: {{messages[0].subject}}\n{{messages[0].snippet}}\n{{messages[0].body}}",
        model: "openai/gpt-5.2-mini",
        deliver: true,
        channel: "last",
        // to: "+15551234567"
      },
    ],
  },
}
```

If you want a fixed channel, set `channel` + `to`. Otherwise `channel: "last"`
uses the last delivery route (falls back to WhatsApp).

To force a cheaper model for Gmail runs, set `model` in the mapping
(`provider/model` or alias). If you enforce `agents.defaults.models`, include it there.

To set a default model and thinking level specifically for Gmail hooks, add
`hooks.gmail.model` / `hooks.gmail.thinking` in your config:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    gmail: {
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off",
    },
  },
}
```

Notes:

* Per-hook `model`/`thinking` in the mapping still overrides these defaults.
* Fallback order: `hooks.gmail.model` â†’ `agents.defaults.model.fallbacks` â†’ primary (auth/rate-limit/timeouts).
* If `agents.defaults.models` is set, the Gmail model must be in the allowlist.
* Gmail hook content is wrapped with external-content safety boundaries by default.
  To disable (dangerous), set `hooks.gmail.allowUnsafeExternalContent: true`.

To customize payload handling further, add `hooks.mappings` or a JS/TS transform module
under `~/.openclaw/hooks/transforms` (see [Webhooks](/automation/webhook)).

## Wizard (recommended)

Use the OpenClaw helper to wire everything together (installs deps on macOS via brew):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw webhooks gmail setup \
  --account openclaw@gmail.com
```

Defaults:

* Uses Tailscale Funnel for the public push endpoint.
* Writes `hooks.gmail` config for `openclaw webhooks gmail run`.
* Enables the Gmail hook preset (`hooks.presets: ["gmail"]`).

Path note: when `tailscale.mode` is enabled, OpenClaw automatically sets
`hooks.gmail.serve.path` to `/` and keeps the public path at
`hooks.gmail.tailscale.path` (default `/gmail-pubsub`) because Tailscale
strips the set-path prefix before proxying.
If you need the backend to receive the prefixed path, set
`hooks.gmail.tailscale.target` (or `--tailscale-target`) to a full URL like
`http://127.0.0.1:8788/gmail-pubsub` and match `hooks.gmail.serve.path`.

Want a custom endpoint? Use `--push-endpoint <url>` or `--tailscale off`.

Platform note: on macOS the wizard installs `gcloud`, `gogcli`, and `tailscale`
via Homebrew; on Linux install them manually first.

Gateway auto-start (recommended):

* When `hooks.enabled=true` and `hooks.gmail.account` is set, the Gateway starts
  `gog gmail watch serve` on boot and auto-renews the watch.
* Set `OPENCLAW_SKIP_GMAIL_WATCHER=1` to opt out (useful if you run the daemon yourself).
* Do not run the manual daemon at the same time, or you will hit
  `listen tcp 127.0.0.1:8788: bind: address already in use`.

Manual daemon (starts `gog gmail watch serve` + auto-renew):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw webhooks gmail run
```

## One-time setup

1. Select the GCP project **that owns the OAuth client** used by `gog`.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud auth login
gcloud config set project <project-id>
```

Note: Gmail watch requires the Pub/Sub topic to live in the same project as the OAuth client.

2. Enable APIs:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

3. Create a topic:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud pubsub topics create gog-gmail-watch
```

4. Allow Gmail push to publish:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud pubsub topics add-iam-policy-binding gog-gmail-watch \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

## Start the watch

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail watch start \
  --account openclaw@gmail.com \
  --label INBOX \
  --topic projects/<project-id>/topics/gog-gmail-watch
```

Save the `history_id` from the output (for debugging).

## Run the push handler

Local example (shared token auth):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail watch serve \
  --account openclaw@gmail.com \
  --bind 127.0.0.1 \
  --port 8788 \
  --path /gmail-pubsub \
  --token <shared> \
  --hook-url http://127.0.0.1:18789/hooks/gmail \
  --hook-token OPENCLAW_HOOK_TOKEN \
  --include-body \
  --max-bytes 20000
```

Notes:

* `--token` protects the push endpoint (`x-gog-token` or `?token=`).
* `--hook-url` points to OpenClaw `/hooks/gmail` (mapped; isolated run + summary to main).
* `--include-body` and `--max-bytes` control the body snippet sent to OpenClaw.

Recommended: `openclaw webhooks gmail run` wraps the same flow and auto-renews the watch.

## Expose the handler (advanced, unsupported)

If you need a non-Tailscale tunnel, wire it manually and use the public URL in the push
subscription (unsupported, no guardrails):

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
cloudflared tunnel --url http://127.0.0.1:8788 --no-autoupdate
```

Use the generated URL as the push endpoint:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gcloud pubsub subscriptions create gog-gmail-watch-push \
  --topic gog-gmail-watch \
  --push-endpoint "https://<public-url>/gmail-pubsub?token=<shared>"
```

Production: use a stable HTTPS endpoint and configure Pub/Sub OIDC JWT, then run:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail watch serve --verify-oidc --oidc-email <svc@...>
```

## Test

Send a message to the watched inbox:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail send \
  --account openclaw@gmail.com \
  --to openclaw@gmail.com \
  --subject "watch test" \
  --body "ping"
```

Check watch state and history:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail watch status --account openclaw@gmail.com
gog gmail history --account openclaw@gmail.com --since <historyId>
```

## Troubleshooting

* `Invalid topicName`: project mismatch (topic not in the OAuth client project).
* `User not authorized`: missing `roles/pubsub.publisher` on the topic.
* Empty messages: Gmail push only provides `historyId`; fetch via `gog gmail history`.

## Cleanup

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
gog gmail watch stop --account openclaw@gmail.com
gcloud pubsub subscriptions delete gog-gmail-watch-push
gcloud pubsub topics delete gog-gmail-watch
```


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/hooks.md`

Source URL: https://docs.openclaw.ai/automation/hooks.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Hooks

# Hooks

Hooks provide an extensible event-driven system for automating actions in response to agent commands and events. Hooks are automatically discovered from directories and can be managed via CLI commands, similar to how skills work in OpenClaw.

## Getting Oriented

Hooks are small scripts that run when something happens. There are two kinds:

* **Hooks** (this page): run inside the Gateway when agent events fire, like `/new`, `/reset`, `/stop`, or lifecycle events.
* **Webhooks**: external HTTP webhooks that let other systems trigger work in OpenClaw. See [Webhook Hooks](/automation/webhook) or use `openclaw webhooks` for Gmail helper commands.

Hooks can also be bundled inside plugins; see [Plugins](/tools/plugin#plugin-hooks).

Common uses:

* Save a memory snapshot when you reset a session
* Keep an audit trail of commands for troubleshooting or compliance
* Trigger follow-up automation when a session starts or ends
* Write files into the agent workspace or call external APIs when events fire

If you can write a small TypeScript function, you can write a hook. Hooks are discovered automatically, and you enable or disable them via the CLI.

## Overview

The hooks system allows you to:

* Save session context to memory when `/new` is issued
* Log all commands for auditing
* Trigger custom automations on agent lifecycle events
* Extend OpenClaw's behavior without modifying core code

## Getting Started

### Bundled Hooks

OpenClaw ships with four bundled hooks that are automatically discovered:

* **ðŸ’¾ session-memory**: Saves session context to your agent workspace (default `~/.openclaw/workspace/memory/`) when you issue `/new`
* **ðŸ“Ž bootstrap-extra-files**: Injects additional workspace bootstrap files from configured glob/path patterns during `agent:bootstrap`
* **ðŸ“ command-logger**: Logs all command events to `~/.openclaw/logs/commands.log`
* **ðŸš€ boot-md**: Runs `BOOT.md` when the gateway starts (requires internal hooks enabled)

List available hooks:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks list
```

Enable a hook:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks enable session-memory
```

Check hook status:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks check
```

Get detailed information:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks info session-memory
```

### Onboarding

During onboarding (`openclaw onboard`), you'll be prompted to enable recommended hooks. The wizard automatically discovers eligible hooks and presents them for selection.

## Hook Discovery

Hooks are automatically discovered from three directories (in order of precedence):

1. **Workspace hooks**: `<workspace>/hooks/` (per-agent, highest precedence)
2. **Managed hooks**: `~/.openclaw/hooks/` (user-installed, shared across workspaces)
3. **Bundled hooks**: `<openclaw>/dist/hooks/bundled/` (shipped with OpenClaw)

Managed hook directories can be either a **single hook** or a **hook pack** (package directory).

Each hook is a directory containing:

```
my-hook/
â”œâ”€â”€ HOOK.md          # Metadata + documentation
â””â”€â”€ handler.ts       # Handler implementation
```

## Hook Packs (npm/archives)

Hook packs are standard npm packages that export one or more hooks via `openclaw.hooks` in
`package.json`. Install them with:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks install <path-or-spec>
```

Npm specs are registry-only (package name + optional exact version or dist-tag).
Git/URL/file specs and semver ranges are rejected.

Bare specs and `@latest` stay on the stable track. If npm resolves either of
those to a prerelease, OpenClaw stops and asks you to opt in explicitly with a
prerelease tag such as `@beta`/`@rc` or an exact prerelease version.

Example `package.json`:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "name": "@acme/my-hooks",
  "version": "0.1.0",
  "openclaw": {
    "hooks": ["./hooks/my-hook", "./hooks/other-hook"]
  }
}
```

Each entry points to a hook directory containing `HOOK.md` and `handler.ts` (or `index.ts`).
Hook packs can ship dependencies; they will be installed under `~/.openclaw/hooks/<id>`.
Each `openclaw.hooks` entry must stay inside the package directory after symlink
resolution; entries that escape are rejected.

Security note: `openclaw hooks install` installs dependencies with `npm install --ignore-scripts`
(no lifecycle scripts). Keep hook pack dependency trees "pure JS/TS" and avoid packages that rely
on `postinstall` builds.

## Hook Structure

### HOOK.md Format

The `HOOK.md` file contains metadata in YAML frontmatter plus Markdown documentation:

```markdown  theme={"theme":{"light":"min-light","dark":"min-dark"}}
---
name: my-hook
description: "Short description of what this hook does"
homepage: https://docs.openclaw.ai/automation/hooks#my-hook
metadata:
  { "openclaw": { "emoji": "ðŸ”—", "events": ["command:new"], "requires": { "bins": ["node"] } } }
---

# My Hook

Detailed documentation goes here...

## What It Does

- Listens for `/new` commands
- Performs some action
- Logs the result

## Requirements

- Node.js must be installed

## Configuration

No configuration needed.
```

### Metadata Fields

The `metadata.openclaw` object supports:

* **`emoji`**: Display emoji for CLI (e.g., `"ðŸ’¾"`)
* **`events`**: Array of events to listen for (e.g., `["command:new", "command:reset"]`)
* **`export`**: Named export to use (defaults to `"default"`)
* **`homepage`**: Documentation URL
* **`requires`**: Optional requirements
  * **`bins`**: Required binaries on PATH (e.g., `["git", "node"]`)
  * **`anyBins`**: At least one of these binaries must be present
  * **`env`**: Required environment variables
  * **`config`**: Required config paths (e.g., `["workspace.dir"]`)
  * **`os`**: Required platforms (e.g., `["darwin", "linux"]`)
* **`always`**: Bypass eligibility checks (boolean)
* **`install`**: Installation methods (for bundled hooks: `[{"id":"bundled","kind":"bundled"}]`)

### Handler Implementation

The `handler.ts` file exports a `HookHandler` function:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const myHandler = async (event) => {
  // Only trigger on 'new' command
  if (event.type !== "command" || event.action !== "new") {
    return;
  }

  console.log(`[my-hook] New command triggered`);
  console.log(`  Session: ${event.sessionKey}`);
  console.log(`  Timestamp: ${event.timestamp.toISOString()}`);

  // Your custom logic here

  // Optionally send message to user
  event.messages.push("âœ¨ My hook executed!");
};

export default myHandler;
```

#### Event Context

Each event includes:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  type: 'command' | 'session' | 'agent' | 'gateway' | 'message',
  action: string,              // e.g., 'new', 'reset', 'stop', 'received', 'sent'
  sessionKey: string,          // Session identifier
  timestamp: Date,             // When the event occurred
  messages: string[],          // Push messages here to send to user
  context: {
    // Command events:
    sessionEntry?: SessionEntry,
    sessionId?: string,
    sessionFile?: string,
    commandSource?: string,    // e.g., 'whatsapp', 'telegram'
    senderId?: string,
    workspaceDir?: string,
    bootstrapFiles?: WorkspaceBootstrapFile[],
    cfg?: OpenClawConfig,
    // Message events (see Message Events section for full details):
    from?: string,             // message:received
    to?: string,               // message:sent
    content?: string,
    channelId?: string,
    success?: boolean,         // message:sent
  }
}
```

## Event Types

### Command Events

Triggered when agent commands are issued:

* **`command`**: All command events (general listener)
* **`command:new`**: When `/new` command is issued
* **`command:reset`**: When `/reset` command is issued
* **`command:stop`**: When `/stop` command is issued

### Session Events

* **`session:compact:before`**: Right before compaction summarizes history
* **`session:compact:after`**: After compaction completes with summary metadata

Internal hook payloads emit these as `type: "session"` with `action: "compact:before"` / `action: "compact:after"`; listeners subscribe with the combined keys above.
Specific handler registration uses the literal key format `${type}:${action}`. For these events, register `session:compact:before` and `session:compact:after`.

### Agent Events

* **`agent:bootstrap`**: Before workspace bootstrap files are injected (hooks may mutate `context.bootstrapFiles`)

### Gateway Events

Triggered when the gateway starts:

* **`gateway:startup`**: After channels start and hooks are loaded

### Message Events

Triggered when messages are received or sent:

* **`message`**: All message events (general listener)
* **`message:received`**: When an inbound message is received from any channel. Fires early in processing before media understanding. Content may contain raw placeholders like `<media:audio>` for media attachments that haven't been processed yet.
* **`message:transcribed`**: When a message has been fully processed, including audio transcription and link understanding. At this point, `transcript` contains the full transcript text for audio messages. Use this hook when you need access to transcribed audio content.
* **`message:preprocessed`**: Fires for every message after all media + link understanding completes, giving hooks access to the fully enriched body (transcripts, image descriptions, link summaries) before the agent sees it.
* **`message:sent`**: When an outbound message is successfully sent

#### Message Event Context

Message events include rich context about the message:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
// message:received context
{
  from: string,           // Sender identifier (phone number, user ID, etc.)
  content: string,        // Message content
  timestamp?: number,     // Unix timestamp when received
  channelId: string,      // Channel (e.g., "whatsapp", "telegram", "discord")
  accountId?: string,     // Provider account ID for multi-account setups
  conversationId?: string, // Chat/conversation ID
  messageId?: string,     // Message ID from the provider
  metadata?: {            // Additional provider-specific data
    to?: string,
    provider?: string,
    surface?: string,
    threadId?: string,
    senderId?: string,
    senderName?: string,
    senderUsername?: string,
    senderE164?: string,
  }
}

// message:sent context
{
  to: string,             // Recipient identifier
  content: string,        // Message content that was sent
  success: boolean,       // Whether the send succeeded
  error?: string,         // Error message if sending failed
  channelId: string,      // Channel (e.g., "whatsapp", "telegram", "discord")
  accountId?: string,     // Provider account ID
  conversationId?: string, // Chat/conversation ID
  messageId?: string,     // Message ID returned by the provider
  isGroup?: boolean,      // Whether this outbound message belongs to a group/channel context
  groupId?: string,       // Group/channel identifier for correlation with message:received
}

// message:transcribed context
{
  body?: string,          // Raw inbound body before enrichment
  bodyForAgent?: string,  // Enriched body visible to the agent
  transcript: string,     // Audio transcript text
  channelId: string,      // Channel (e.g., "telegram", "whatsapp")
  conversationId?: string,
  messageId?: string,
}

// message:preprocessed context
{
  body?: string,          // Raw inbound body
  bodyForAgent?: string,  // Final enriched body after media/link understanding
  transcript?: string,    // Transcript when audio was present
  channelId: string,      // Channel (e.g., "telegram", "whatsapp")
  conversationId?: string,
  messageId?: string,
  isGroup?: boolean,
  groupId?: string,
}
```

#### Example: Message Logger Hook

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const isMessageReceivedEvent = (event: { type: string; action: string }) =>
  event.type === "message" && event.action === "received";
const isMessageSentEvent = (event: { type: string; action: string }) =>
  event.type === "message" && event.action === "sent";

const handler = async (event) => {
  if (isMessageReceivedEvent(event as { type: string; action: string })) {
    console.log(`[message-logger] Received from ${event.context.from}: ${event.context.content}`);
  } else if (isMessageSentEvent(event as { type: string; action: string })) {
    console.log(`[message-logger] Sent to ${event.context.to}: ${event.context.content}`);
  }
};

export default handler;
```

### Tool Result Hooks (Plugin API)

These hooks are not event-stream listeners; they let plugins synchronously adjust tool results before OpenClaw persists them.

* **`tool_result_persist`**: transform tool results before they are written to the session transcript. Must be synchronous; return the updated tool result payload or `undefined` to keep it as-is. See [Agent Loop](/concepts/agent-loop).

### Plugin Hook Events

Compaction lifecycle hooks exposed through the plugin hook runner:

* **`before_compaction`**: Runs before compaction with count/token metadata
* **`after_compaction`**: Runs after compaction with compaction summary metadata

### Future Events

Planned event types:

* **`session:start`**: When a new session begins
* **`session:end`**: When a session ends
* **`agent:error`**: When an agent encounters an error

## Creating Custom Hooks

### 1. Choose Location

* **Workspace hooks** (`<workspace>/hooks/`): Per-agent, highest precedence
* **Managed hooks** (`~/.openclaw/hooks/`): Shared across workspaces

### 2. Create Directory Structure

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
mkdir -p ~/.openclaw/hooks/my-hook
cd ~/.openclaw/hooks/my-hook
```

### 3. Create HOOK.md

```markdown  theme={"theme":{"light":"min-light","dark":"min-dark"}}
---
name: my-hook
description: "Does something useful"
metadata: { "openclaw": { "emoji": "ðŸŽ¯", "events": ["command:new"] } }
---

# My Custom Hook

This hook does something useful when you issue `/new`.
```

### 4. Create handler.ts

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const handler = async (event) => {
  if (event.type !== "command" || event.action !== "new") {
    return;
  }

  console.log("[my-hook] Running!");
  // Your logic here
};

export default handler;
```

### 5. Enable and Test

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Verify hook is discovered
openclaw hooks list

# Enable it
openclaw hooks enable my-hook

# Restart your gateway process (menu bar app restart on macOS, or restart your dev process)

# Trigger the event
# Send /new via your messaging channel
```

## Configuration

### New Config Format (Recommended)

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "command-logger": { "enabled": false }
      }
    }
  }
}
```

### Per-Hook Configuration

Hooks can have custom configuration:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "my-hook": {
          "enabled": true,
          "env": {
            "MY_CUSTOM_VAR": "value"
          }
        }
      }
    }
  }
}
```

### Extra Directories

Load hooks from additional directories:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "load": {
        "extraDirs": ["/path/to/more/hooks"]
      }
    }
  }
}
```

### Legacy Config Format (Still Supported)

The old config format still works for backwards compatibility:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts",
          "export": "default"
        }
      ]
    }
  }
}
```

Note: `module` must be a workspace-relative path. Absolute paths and traversal outside the workspace are rejected.

**Migration**: Use the new discovery-based system for new hooks. Legacy handlers are loaded after directory-based hooks.

## CLI Commands

### List Hooks

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# List all hooks
openclaw hooks list

# Show only eligible hooks
openclaw hooks list --eligible

# Verbose output (show missing requirements)
openclaw hooks list --verbose

# JSON output
openclaw hooks list --json
```

### Hook Information

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Show detailed info about a hook
openclaw hooks info session-memory

# JSON output
openclaw hooks info session-memory --json
```

### Check Eligibility

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Show eligibility summary
openclaw hooks check

# JSON output
openclaw hooks check --json
```

### Enable/Disable

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Enable a hook
openclaw hooks enable session-memory

# Disable a hook
openclaw hooks disable command-logger
```

## Bundled hook reference

### session-memory

Saves session context to memory when you issue `/new`.

**Events**: `command:new`

**Requirements**: `workspace.dir` must be configured

**Output**: `<workspace>/memory/YYYY-MM-DD-slug.md` (defaults to `~/.openclaw/workspace`)

**What it does**:

1. Uses the pre-reset session entry to locate the correct transcript
2. Extracts the last 15 lines of conversation
3. Uses LLM to generate a descriptive filename slug
4. Saves session metadata to a dated memory file

**Example output**:

```markdown  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Session: 2026-01-16 14:30:00 UTC

- **Session Key**: agent:main:main
- **Session ID**: abc123def456
- **Source**: telegram
```

**Filename examples**:

* `2026-01-16-vendor-pitch.md`
* `2026-01-16-api-design.md`
* `2026-01-16-1430.md` (fallback timestamp if slug generation fails)

**Enable**:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks enable session-memory
```

### bootstrap-extra-files

Injects additional bootstrap files (for example monorepo-local `AGENTS.md` / `TOOLS.md`) during `agent:bootstrap`.

**Events**: `agent:bootstrap`

**Requirements**: `workspace.dir` must be configured

**Output**: No files written; bootstrap context is modified in-memory only.

**Config**:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "bootstrap-extra-files": {
          "enabled": true,
          "paths": ["packages/*/AGENTS.md", "packages/*/TOOLS.md"]
        }
      }
    }
  }
}
```

**Notes**:

* Paths are resolved relative to workspace.
* Files must stay inside workspace (realpath-checked).
* Only recognized bootstrap basenames are loaded.
* Subagent allowlist is preserved (`AGENTS.md` and `TOOLS.md` only).

**Enable**:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks enable bootstrap-extra-files
```

### command-logger

Logs all command events to a centralized audit file.

**Events**: `command`

**Requirements**: None

**Output**: `~/.openclaw/logs/commands.log`

**What it does**:

1. Captures event details (command action, timestamp, session key, sender ID, source)
2. Appends to log file in JSONL format
3. Runs silently in the background

**Example log entries**:

```jsonl  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{"timestamp":"2026-01-16T14:30:00.000Z","action":"new","sessionKey":"agent:main:main","senderId":"+1234567890","source":"telegram"}
{"timestamp":"2026-01-16T15:45:22.000Z","action":"stop","sessionKey":"agent:main:main","senderId":"user@example.com","source":"whatsapp"}
```

**View logs**:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# View recent commands
tail -n 20 ~/.openclaw/logs/commands.log

# Pretty-print with jq
cat ~/.openclaw/logs/commands.log | jq .

# Filter by action
grep '"action":"new"' ~/.openclaw/logs/commands.log | jq .
```

**Enable**:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks enable command-logger
```

### boot-md

Runs `BOOT.md` when the gateway starts (after channels start).
Internal hooks must be enabled for this to run.

**Events**: `gateway:startup`

**Requirements**: `workspace.dir` must be configured

**What it does**:

1. Reads `BOOT.md` from your workspace
2. Runs the instructions via the agent runner
3. Sends any requested outbound messages via the message tool

**Enable**:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks enable boot-md
```

## Best Practices

### Keep Handlers Fast

Hooks run during command processing. Keep them lightweight:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
// âœ“ Good - async work, returns immediately
const handler: HookHandler = async (event) => {
  void processInBackground(event); // Fire and forget
};

// âœ— Bad - blocks command processing
const handler: HookHandler = async (event) => {
  await slowDatabaseQuery(event);
  await evenSlowerAPICall(event);
};
```

### Handle Errors Gracefully

Always wrap risky operations:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const handler: HookHandler = async (event) => {
  try {
    await riskyOperation(event);
  } catch (err) {
    console.error("[my-handler] Failed:", err instanceof Error ? err.message : String(err));
    // Don't throw - let other handlers run
  }
};
```

### Filter Events Early

Return early if the event isn't relevant:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const handler: HookHandler = async (event) => {
  // Only handle 'new' commands
  if (event.type !== "command" || event.action !== "new") {
    return;
  }

  // Your logic here
};
```

### Use Specific Event Keys

Specify exact events in metadata when possible:

```yaml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
metadata: { "openclaw": { "events": ["command:new"] } } # Specific
```

Rather than:

```yaml  theme={"theme":{"light":"min-light","dark":"min-dark"}}
metadata: { "openclaw": { "events": ["command"] } } # General - more overhead
```

## Debugging

### Enable Hook Logging

The gateway logs hook loading at startup:

```
Registered hook: session-memory -> command:new
Registered hook: bootstrap-extra-files -> agent:bootstrap
Registered hook: command-logger -> command
Registered hook: boot-md -> gateway:startup
```

### Check Discovery

List all discovered hooks:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks list --verbose
```

### Check Registration

In your handler, log when it's called:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
const handler: HookHandler = async (event) => {
  console.log("[my-handler] Triggered:", event.type, event.action);
  // Your logic
};
```

### Verify Eligibility

Check why a hook isn't eligible:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks info my-hook
```

Look for missing requirements in the output.

## Testing

### Gateway Logs

Monitor gateway logs to see hook execution:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# macOS
./scripts/clawlog.sh -f

# Other platforms
tail -f ~/.openclaw/gateway.log
```

### Test Hooks Directly

Test your handlers in isolation:

```typescript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
import { test } from "vitest";
import myHandler from "./hooks/my-hook/handler.js";

test("my handler works", async () => {
  const event = {
    type: "command",
    action: "new",
    sessionKey: "test-session",
    timestamp: new Date(),
    messages: [],
    context: { foo: "bar" },
  };

  await myHandler(event);

  // Assert side effects
});
```

## Architecture

### Core Components

* **`src/hooks/types.ts`**: Type definitions
* **`src/hooks/workspace.ts`**: Directory scanning and loading
* **`src/hooks/frontmatter.ts`**: HOOK.md metadata parsing
* **`src/hooks/config.ts`**: Eligibility checking
* **`src/hooks/hooks-status.ts`**: Status reporting
* **`src/hooks/loader.ts`**: Dynamic module loader
* **`src/cli/hooks-cli.ts`**: CLI commands
* **`src/gateway/server-startup.ts`**: Loads hooks at gateway start
* **`src/auto-reply/reply/commands-core.ts`**: Triggers command events

### Discovery Flow

```
Gateway startup
    â†“
Scan directories (workspace â†’ managed â†’ bundled)
    â†“
Parse HOOK.md files
    â†“
Check eligibility (bins, env, config, os)
    â†“
Load handlers from eligible hooks
    â†“
Register handlers for events
```

### Event Flow

```
User sends /new
    â†“
Command validation
    â†“
Create hook event
    â†“
Trigger hook (all registered handlers)
    â†“
Command processing continues
    â†“
Session reset
```

## Troubleshooting

### Hook Not Discovered

1. Check directory structure:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   ls -la ~/.openclaw/hooks/my-hook/
   # Should show: HOOK.md, handler.ts
   ```

2. Verify HOOK.md format:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   cat ~/.openclaw/hooks/my-hook/HOOK.md
   # Should have YAML frontmatter with name and metadata
   ```

3. List all discovered hooks:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   openclaw hooks list
   ```

### Hook Not Eligible

Check requirements:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw hooks info my-hook
```

Look for missing:

* Binaries (check PATH)
* Environment variables
* Config values
* OS compatibility

### Hook Not Executing

1. Verify hook is enabled:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   openclaw hooks list
   # Should show âœ“ next to enabled hooks
   ```

2. Restart your gateway process so hooks reload.

3. Check gateway logs for errors:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   ./scripts/clawlog.sh | grep hook
   ```

### Handler Errors

Check for TypeScript/import errors:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Test import directly
node -e "import('./path/to/handler.ts').then(console.log)"
```

## Migration Guide

### From Legacy Config to Discovery

**Before**:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts"
        }
      ]
    }
  }
}
```

**After**:

1. Create hook directory:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   mkdir -p ~/.openclaw/hooks/my-hook
   mv ./hooks/handlers/my-handler.ts ~/.openclaw/hooks/my-hook/handler.ts
   ```

2. Create HOOK.md:

   ```markdown  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   ---
   name: my-hook
   description: "My custom hook"
   metadata: { "openclaw": { "emoji": "ðŸŽ¯", "events": ["command:new"] } }
   ---

   # My Hook

   Does something useful.
   ```

3. Update config:

   ```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   {
     "hooks": {
       "internal": {
         "enabled": true,
         "entries": {
           "my-hook": { "enabled": true }
         }
       }
     }
   }
   ```

4. Verify and restart your gateway process:

   ```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
   openclaw hooks list
   # Should show: ðŸŽ¯ my-hook âœ“
   ```

**Benefits of migration**:

* Automatic discovery
* CLI management
* Eligibility checking
* Better documentation
* Consistent structure

## See Also

* [CLI Reference: hooks](/cli/hooks)
* [Bundled Hooks README](https://github.com/openclaw/openclaw/tree/main/src/hooks/bundled)
* [Webhook Hooks](/automation/webhook)
* [Configuration](/gateway/configuration#hooks)


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/poll.md`

Source URL: https://docs.openclaw.ai/automation/poll.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Polls

# Polls

## Supported channels

* Telegram
* WhatsApp (web channel)
* Discord
* MS Teams (Adaptive Cards)

## CLI

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
# Telegram
openclaw message poll --channel telegram --target 123456789 \
  --poll-question "Ship it?" --poll-option "Yes" --poll-option "No"
openclaw message poll --channel telegram --target -1001234567890:topic:42 \
  --poll-question "Pick a time" --poll-option "10am" --poll-option "2pm" \
  --poll-duration-seconds 300

# WhatsApp
openclaw message poll --target +15555550123 \
  --poll-question "Lunch today?" --poll-option "Yes" --poll-option "No" --poll-option "Maybe"
openclaw message poll --target 123456789@g.us \
  --poll-question "Meeting time?" --poll-option "10am" --poll-option "2pm" --poll-option "4pm" --poll-multi

# Discord
openclaw message poll --channel discord --target channel:123456789 \
  --poll-question "Snack?" --poll-option "Pizza" --poll-option "Sushi"
openclaw message poll --channel discord --target channel:123456789 \
  --poll-question "Plan?" --poll-option "A" --poll-option "B" --poll-duration-hours 48

# MS Teams
openclaw message poll --channel msteams --target conversation:19:abc@thread.tacv2 \
  --poll-question "Lunch?" --poll-option "Pizza" --poll-option "Sushi"
```

Options:

* `--channel`: `whatsapp` (default), `telegram`, `discord`, or `msteams`
* `--poll-multi`: allow selecting multiple options
* `--poll-duration-hours`: Discord-only (defaults to 24 when omitted)
* `--poll-duration-seconds`: Telegram-only (5-600 seconds)
* `--poll-anonymous` / `--poll-public`: Telegram-only poll visibility

## Gateway RPC

Method: `poll`

Params:

* `to` (string, required)
* `question` (string, required)
* `options` (string\[], required)
* `maxSelections` (number, optional)
* `durationHours` (number, optional)
* `durationSeconds` (number, optional, Telegram-only)
* `isAnonymous` (boolean, optional, Telegram-only)
* `channel` (string, optional, default: `whatsapp`)
* `idempotencyKey` (string, required)

## Channel differences

* Telegram: 2-10 options. Supports forum topics via `threadId` or `:topic:` targets. Uses `durationSeconds` instead of `durationHours`, limited to 5-600 seconds. Supports anonymous and public polls.
* WhatsApp: 2-12 options, `maxSelections` must be within option count, ignores `durationHours`.
* Discord: 2-10 options, `durationHours` clamped to 1-768 hours (default 24). `maxSelections > 1` enables multi-select; Discord does not support a strict selection count.
* MS Teams: Adaptive Card polls (OpenClaw-managed). No native poll API; `durationHours` is ignored.

## Agent tool (Message)

Use the `message` tool with `poll` action (`to`, `pollQuestion`, `pollOption`, optional `pollMulti`, `pollDurationHours`, `channel`).

For Telegram, the tool also accepts `pollDurationSeconds`, `pollAnonymous`, and `pollPublic`.

Use `action: "poll"` for poll creation. Poll fields passed with `action: "send"` are rejected.

Note: Discord has no â€œpick exactly Nâ€ mode; `pollMulti` maps to multi-select.
Teams polls are rendered as Adaptive Cards and require the gateway to stay online
to record votes in `~/.openclaw/msteams-polls.json`.


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/troubleshooting.md`

Source URL: https://docs.openclaw.ai/automation/troubleshooting.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Automation Troubleshooting

# Automation troubleshooting

Use this page for scheduler and delivery issues (`cron` + `heartbeat`).

## Command ladder

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

Then run automation checks:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron status
openclaw cron list
openclaw system heartbeat last
```

## Cron not firing

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron status
openclaw cron list
openclaw cron runs --id <jobId> --limit 20
openclaw logs --follow
```

Good output looks like:

* `cron status` reports enabled and a future `nextWakeAtMs`.
* Job is enabled and has a valid schedule/timezone.
* `cron runs` shows `ok` or explicit skip reason.

Common signatures:

* `cron: scheduler disabled; jobs will not run automatically` â†’ cron disabled in config/env.
* `cron: timer tick failed` â†’ scheduler tick crashed; inspect surrounding stack/log context.
* `reason: not-due` in run output â†’ manual run called without `--force` and job not due yet.

## Cron fired but no delivery

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw cron runs --id <jobId> --limit 20
openclaw cron list
openclaw channels status --probe
openclaw logs --follow
```

Good output looks like:

* Run status is `ok`.
* Delivery mode/target are set for isolated jobs.
* Channel probe reports target channel connected.

Common signatures:

* Run succeeded but delivery mode is `none` â†’ no external message is expected.
* Delivery target missing/invalid (`channel`/`to`) â†’ run may succeed internally but skip outbound.
* Channel auth errors (`unauthorized`, `missing_scope`, `Forbidden`) â†’ delivery blocked by channel credentials/permissions.

## Heartbeat suppressed or skipped

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw system heartbeat last
openclaw logs --follow
openclaw config get agents.defaults.heartbeat
openclaw channels status --probe
```

Good output looks like:

* Heartbeat enabled with non-zero interval.
* Last heartbeat result is `ran` (or skip reason is understood).

Common signatures:

* `heartbeat skipped` with `reason=quiet-hours` â†’ outside `activeHours`.
* `requests-in-flight` â†’ main lane busy; heartbeat deferred.
* `empty-heartbeat-file` â†’ interval heartbeat skipped because `HEARTBEAT.md` has no actionable content and no tagged cron event is queued.
* `alerts-disabled` â†’ visibility settings suppress outbound heartbeat messages.

## Timezone and activeHours gotchas

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
openclaw config get agents.defaults.heartbeat.activeHours
openclaw config get agents.defaults.heartbeat.activeHours.timezone
openclaw config get agents.defaults.userTimezone || echo "agents.defaults.userTimezone not set"
openclaw cron list
openclaw logs --follow
```

Quick rules:

* `Config path not found: agents.defaults.userTimezone` means the key is unset; heartbeat falls back to host timezone (or `activeHours.timezone` if set).
* Cron without `--tz` uses gateway host timezone.
* Heartbeat `activeHours` uses configured timezone resolution (`user`, `local`, or explicit IANA tz).
* ISO timestamps without timezone are treated as UTC for cron `at` schedules.

Common signatures:

* Jobs run at the wrong wall-clock time after host timezone changes.
* Heartbeat always skipped during your daytime because `activeHours.timezone` is wrong.

Related:

* [/automation/cron-jobs](/automation/cron-jobs)
* [/gateway/heartbeat](/gateway/heartbeat)
* [/automation/cron-vs-heartbeat](/automation/cron-vs-heartbeat)
* [/concepts/timezone](/concepts/timezone)


Built with [Mintlify](https://mintlify.com).

---

## File: `automation/webhook.md`

Source URL: https://docs.openclaw.ai/automation/webhook.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

# Webhooks

Gateway can expose a small HTTP webhook endpoint for external triggers.

## Enable

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    // Optional: restrict explicit `agentId` routing to this allowlist.
    // Omit or include "*" to allow any agent.
    // Set [] to deny all explicit `agentId` routing.
    allowedAgentIds: ["hooks", "main"],
  },
}
```

Notes:

* `hooks.token` is required when `hooks.enabled=true`.
* `hooks.path` defaults to `/hooks`.

## Auth

Every request must include the hook token. Prefer headers:

* `Authorization: Bearer <token>` (recommended)
* `x-openclaw-token: <token>`
* Query-string tokens are rejected (`?token=...` returns `400`).

## Endpoints

### `POST /hooks/wake`

Payload:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{ "text": "System line", "mode": "now" }
```

* `text` **required** (string): The description of the event (e.g., "New email received").
* `mode` optional (`now` | `next-heartbeat`): Whether to trigger an immediate heartbeat (default `now`) or wait for the next periodic check.

Effect:

* Enqueues a system event for the **main** session
* If `mode=now`, triggers an immediate heartbeat

### `POST /hooks/agent`

Payload:

```json  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  "message": "Run this",
  "name": "Email",
  "agentId": "hooks",
  "sessionKey": "hook:email:msg-123",
  "wakeMode": "now",
  "deliver": true,
  "channel": "last",
  "to": "+15551234567",
  "model": "openai/gpt-5.2-mini",
  "thinking": "low",
  "timeoutSeconds": 120
}
```

* `message` **required** (string): The prompt or message for the agent to process.
* `name` optional (string): Human-readable name for the hook (e.g., "GitHub"), used as a prefix in session summaries.
* `agentId` optional (string): Route this hook to a specific agent. Unknown IDs fall back to the default agent. When set, the hook runs using the resolved agent's workspace and configuration.
* `sessionKey` optional (string): The key used to identify the agent's session. By default this field is rejected unless `hooks.allowRequestSessionKey=true`.
* `wakeMode` optional (`now` | `next-heartbeat`): Whether to trigger an immediate heartbeat (default `now`) or wait for the next periodic check.
* `deliver` optional (boolean): If `true`, the agent's response will be sent to the messaging channel. Defaults to `true`. Responses that are only heartbeat acknowledgments are automatically skipped.
* `channel` optional (string): The messaging channel for delivery. One of: `last`, `whatsapp`, `telegram`, `discord`, `slack`, `mattermost` (plugin), `signal`, `imessage`, `msteams`. Defaults to `last`.
* `to` optional (string): The recipient identifier for the channel (e.g., phone number for WhatsApp/Signal, chat ID for Telegram, channel ID for Discord/Slack/Mattermost (plugin), conversation ID for MS Teams). Defaults to the last recipient in the main session.
* `model` optional (string): Model override (e.g., `anthropic/claude-3-5-sonnet` or an alias). Must be in the allowed model list if restricted.
* `thinking` optional (string): Thinking level override (e.g., `low`, `medium`, `high`).
* `timeoutSeconds` optional (number): Maximum duration for the agent run in seconds.

Effect:

* Runs an **isolated** agent turn (own session key)
* Always posts a summary into the **main** session
* If `wakeMode=now`, triggers an immediate heartbeat

## Session key policy (breaking change)

`/hooks/agent` payload `sessionKey` overrides are disabled by default.

* Recommended: set a fixed `hooks.defaultSessionKey` and keep request overrides off.
* Optional: allow request overrides only when needed, and restrict prefixes.

Recommended config:

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    enabled: true,
    token: "${OPENCLAW_HOOKS_TOKEN}",
    defaultSessionKey: "hook:ingress",
    allowRequestSessionKey: false,
    allowedSessionKeyPrefixes: ["hook:"],
  },
}
```

Compatibility config (legacy behavior):

```json5  theme={"theme":{"light":"min-light","dark":"min-dark"}}
{
  hooks: {
    enabled: true,
    token: "${OPENCLAW_HOOKS_TOKEN}",
    allowRequestSessionKey: true,
    allowedSessionKeyPrefixes: ["hook:"], // strongly recommended
  },
}
```

### `POST /hooks/<name>` (mapped)

Custom hook names are resolved via `hooks.mappings` (see configuration). A mapping can
turn arbitrary payloads into `wake` or `agent` actions, with optional templates or
code transforms.

Mapping options (summary):

* `hooks.presets: ["gmail"]` enables the built-in Gmail mapping.
* `hooks.mappings` lets you define `match`, `action`, and templates in config.
* `hooks.transformsDir` + `transform.module` loads a JS/TS module for custom logic.
  * `hooks.transformsDir` (if set) must stay within the transforms root under your OpenClaw config directory (typically `~/.openclaw/hooks/transforms`).
  * `transform.module` must resolve within the effective transforms directory (traversal/escape paths are rejected).
* Use `match.source` to keep a generic ingest endpoint (payload-driven routing).
* TS transforms require a TS loader (e.g. `bun` or `tsx`) or precompiled `.js` at runtime.
* Set `deliver: true` + `channel`/`to` on mappings to route replies to a chat surface
  (`channel` defaults to `last` and falls back to WhatsApp).
* `agentId` routes the hook to a specific agent; unknown IDs fall back to the default agent.
* `hooks.allowedAgentIds` restricts explicit `agentId` routing. Omit it (or include `*`) to allow any agent. Set `[]` to deny explicit `agentId` routing.
* `hooks.defaultSessionKey` sets the default session for hook agent runs when no explicit key is provided.
* `hooks.allowRequestSessionKey` controls whether `/hooks/agent` payloads may set `sessionKey` (default: `false`).
* `hooks.allowedSessionKeyPrefixes` optionally restricts explicit `sessionKey` values from request payloads and mappings.
* `allowUnsafeExternalContent: true` disables the external content safety wrapper for that hook
  (dangerous; only for trusted internal sources).
* `openclaw webhooks gmail setup` writes `hooks.gmail` config for `openclaw webhooks gmail run`.
  See [Gmail Pub/Sub](/automation/gmail-pubsub) for the full Gmail watch flow.

## Responses

* `200` for `/hooks/wake`
* `200` for `/hooks/agent` (async run accepted)
* `401` on auth failure
* `429` after repeated auth failures from the same client (check `Retry-After`)
* `400` on invalid payload
* `413` on oversized payloads

## Examples

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"text":"New email received","mode":"now"}'
```

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-openclaw-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Summarize inbox","name":"Email","wakeMode":"next-heartbeat"}'
```

### Use a different model

Add `model` to the agent payload (or mapping) to override the model for that run:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-openclaw-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Summarize inbox","name":"Email","model":"openai/gpt-5.2-mini"}'
```

If you enforce `agents.defaults.models`, make sure the override model is included there.

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Ada","subject":"Hello","snippet":"Hi"}]}'
```

## Security

* Keep hook endpoints behind loopback, tailnet, or trusted reverse proxy.
* Use a dedicated hook token; do not reuse gateway auth tokens.
* Repeated auth failures are rate-limited per client address to slow brute-force attempts.
* If you use multi-agent routing, set `hooks.allowedAgentIds` to limit explicit `agentId` selection.
* Keep `hooks.allowRequestSessionKey=false` unless you require caller-selected sessions.
* If you enable request `sessionKey`, restrict `hooks.allowedSessionKeyPrefixes` (for example, `["hook:"]`).
* Avoid including sensitive raw payloads in webhook logs.
* Hook payloads are treated as untrusted and wrapped with safety boundaries by default.
  If you must disable this for a specific hook, set `allowUnsafeExternalContent: true`
  in that hook's mapping (dangerous).


Built with [Mintlify](https://mintlify.com).

---

