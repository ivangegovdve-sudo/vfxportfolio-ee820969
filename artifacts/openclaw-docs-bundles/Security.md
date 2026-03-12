# Security

Source category: `Security`

Files included: 3

---

## File: `security/CONTRIBUTING-THREAT-MODEL.md`

Source URL: https://docs.openclaw.ai/security/CONTRIBUTING-THREAT-MODEL.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# CONTRIBUTING THREAT MODEL

# Contributing to the OpenClaw Threat Model

Thanks for helping make OpenClaw more secure. This threat model is a living document and we welcome contributions from anyone - you don't need to be a security expert.

## Ways to Contribute

### Add a Threat

Spotted an attack vector or risk we haven't covered? Open an issue on [openclaw/trust](https://github.com/openclaw/trust/issues) and describe it in your own words. You don't need to know any frameworks or fill in every field - just describe the scenario.

**Helpful to include (but not required):**

* The attack scenario and how it could be exploited
* Which parts of OpenClaw are affected (CLI, gateway, channels, ClawHub, MCP servers, etc.)
* How severe you think it is (low / medium / high / critical)
* Any links to related research, CVEs, or real-world examples

We'll handle the ATLAS mapping, threat IDs, and risk assessment during review. If you want to include those details, great - but it's not expected.

> **This is for adding to the threat model, not reporting live vulnerabilities.** If you've found an exploitable vulnerability, see our [Trust page](https://trust.openclaw.ai) for responsible disclosure instructions.

### Suggest a Mitigation

Have an idea for how to address an existing threat? Open an issue or PR referencing the threat. Useful mitigations are specific and actionable - for example, "per-sender rate limiting of 10 messages/minute at the gateway" is better than "implement rate limiting."

### Propose an Attack Chain

Attack chains show how multiple threats combine into a realistic attack scenario. If you see a dangerous combination, describe the steps and how an attacker would chain them together. A short narrative of how the attack unfolds in practice is more valuable than a formal template.

### Fix or Improve Existing Content

Typos, clarifications, outdated info, better examples - PRs welcome, no issue needed.

## What We Use

### MITRE ATLAS

This threat model is built on [MITRE ATLAS](https://atlas.mitre.org/) (Adversarial Threat Landscape for AI Systems), a framework designed specifically for AI/ML threats like prompt injection, tool misuse, and agent exploitation. You don't need to know ATLAS to contribute - we map submissions to the framework during review.

### Threat IDs

Each threat gets an ID like `T-EXEC-003`. The categories are:

| Code    | Category                                   |
| ------- | ------------------------------------------ |
| RECON   | Reconnaissance - information gathering     |
| ACCESS  | Initial access - gaining entry             |
| EXEC    | Execution - running malicious actions      |
| PERSIST | Persistence - maintaining access           |
| EVADE   | Defense evasion - avoiding detection       |
| DISC    | Discovery - learning about the environment |
| EXFIL   | Exfiltration - stealing data               |
| IMPACT  | Impact - damage or disruption              |

IDs are assigned by maintainers during review. You don't need to pick one.

### Risk Levels

| Level        | Meaning                                                           |
| ------------ | ----------------------------------------------------------------- |
| **Critical** | Full system compromise, or high likelihood + critical impact      |
| **High**     | Significant damage likely, or medium likelihood + critical impact |
| **Medium**   | Moderate risk, or low likelihood + high impact                    |
| **Low**      | Unlikely and limited impact                                       |

If you're unsure about the risk level, just describe the impact and we'll assess it.

## Review Process

1. **Triage** - We review new submissions within 48 hours
2. **Assessment** - We verify feasibility, assign ATLAS mapping and threat ID, validate risk level
3. **Documentation** - We ensure everything is formatted and complete
4. **Merge** - Added to the threat model and visualization

## Resources

* [ATLAS Website](https://atlas.mitre.org/)
* [ATLAS Techniques](https://atlas.mitre.org/techniques/)
* [ATLAS Case Studies](https://atlas.mitre.org/studies/)
* [OpenClaw Threat Model](/security/THREAT-MODEL-ATLAS)

## Contact

* **Security vulnerabilities:** See our [Trust page](https://trust.openclaw.ai) for reporting instructions
* **Threat model questions:** Open an issue on [openclaw/trust](https://github.com/openclaw/trust/issues)
* **General chat:** Discord #security channel

## Recognition

Contributors to the threat model are recognized in the threat model acknowledgments, release notes, and the OpenClaw security hall of fame for significant contributions.


Built with [Mintlify](https://mintlify.com).

---

## File: `security/formal-verification.md`

Source URL: https://docs.openclaw.ai/security/formal-verification.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Formal Verification (Security Models)

# Formal Verification (Security Models)

This page tracks OpenClawâ€™s **formal security models** (TLA+/TLC today; more as needed).

> Note: some older links may refer to the previous project name.

**Goal (north star):** provide a machine-checked argument that OpenClaw enforces its
intended security policy (authorization, session isolation, tool gating, and
misconfiguration safety), under explicit assumptions.

**What this is (today):** an executable, attacker-driven **security regression suite**:

* Each claim has a runnable model-check over a finite state space.
* Many claims have a paired **negative model** that produces a counterexample trace for a realistic bug class.

**What this is not (yet):** a proof that â€œOpenClaw is secure in all respectsâ€ or that the full TypeScript implementation is correct.

## Where the models live

Models are maintained in a separate repo: [vignesh07/openclaw-formal-models](https://github.com/vignesh07/openclaw-formal-models).

## Important caveats

* These are **models**, not the full TypeScript implementation. Drift between model and code is possible.
* Results are bounded by the state space explored by TLC; â€œgreenâ€ does not imply security beyond the modeled assumptions and bounds.
* Some claims rely on explicit environmental assumptions (e.g., correct deployment, correct configuration inputs).

## Reproducing results

Today, results are reproduced by cloning the models repo locally and running TLC (see below). A future iteration could offer:

* CI-run models with public artifacts (counterexample traces, run logs)
* a hosted â€œrun this modelâ€ workflow for small, bounded checks

Getting started:

```bash  theme={"theme":{"light":"min-light","dark":"min-dark"}}
git clone https://github.com/vignesh07/openclaw-formal-models
cd openclaw-formal-models

# Java 11+ required (TLC runs on the JVM).
# The repo vendors a pinned `tla2tools.jar` (TLA+ tools) and provides `bin/tlc` + Make targets.

make <target>
```

### Gateway exposure and open gateway misconfiguration

**Claim:** binding beyond loopback without auth can make remote compromise possible / increases exposure; token/password blocks unauth attackers (per the model assumptions).

* Green runs:
  * `make gateway-exposure-v2`
  * `make gateway-exposure-v2-protected`
* Red (expected):
  * `make gateway-exposure-v2-negative`

See also: `docs/gateway-exposure-matrix.md` in the models repo.

### Nodes.run pipeline (highest-risk capability)

**Claim:** `nodes.run` requires (a) node command allowlist plus declared commands and (b) live approval when configured; approvals are tokenized to prevent replay (in the model).

* Green runs:
  * `make nodes-pipeline`
  * `make approvals-token`
* Red (expected):
  * `make nodes-pipeline-negative`
  * `make approvals-token-negative`

### Pairing store (DM gating)

**Claim:** pairing requests respect TTL and pending-request caps.

* Green runs:
  * `make pairing`
  * `make pairing-cap`
* Red (expected):
  * `make pairing-negative`
  * `make pairing-cap-negative`

### Ingress gating (mentions + control-command bypass)

**Claim:** in group contexts requiring mention, an unauthorized â€œcontrol commandâ€ cannot bypass mention gating.

* Green:
  * `make ingress-gating`
* Red (expected):
  * `make ingress-gating-negative`

### Routing/session-key isolation

**Claim:** DMs from distinct peers do not collapse into the same session unless explicitly linked/configured.

* Green:
  * `make routing-isolation`
* Red (expected):
  * `make routing-isolation-negative`

## v1++: additional bounded models (concurrency, retries, trace correctness)

These are follow-on models that tighten fidelity around real-world failure modes (non-atomic updates, retries, and message fan-out).

### Pairing store concurrency / idempotency

**Claim:** a pairing store should enforce `MaxPending` and idempotency even under interleavings (i.e., â€œcheck-then-writeâ€ must be atomic / locked; refresh shouldnâ€™t create duplicates).

What it means:

* Under concurrent requests, you canâ€™t exceed `MaxPending` for a channel.

* Repeated requests/refreshes for the same `(channel, sender)` should not create duplicate live pending rows.

* Green runs:
  * `make pairing-race` (atomic/locked cap check)
  * `make pairing-idempotency`
  * `make pairing-refresh`
  * `make pairing-refresh-race`

* Red (expected):
  * `make pairing-race-negative` (non-atomic begin/commit cap race)
  * `make pairing-idempotency-negative`
  * `make pairing-refresh-negative`
  * `make pairing-refresh-race-negative`

### Ingress trace correlation / idempotency

**Claim:** ingestion should preserve trace correlation across fan-out and be idempotent under provider retries.

What it means:

* When one external event becomes multiple internal messages, every part keeps the same trace/event identity.

* Retries do not result in double-processing.

* If provider event IDs are missing, dedupe falls back to a safe key (e.g., trace ID) to avoid dropping distinct events.

* Green:
  * `make ingress-trace`
  * `make ingress-trace2`
  * `make ingress-idempotency`
  * `make ingress-dedupe-fallback`

* Red (expected):
  * `make ingress-trace-negative`
  * `make ingress-trace2-negative`
  * `make ingress-idempotency-negative`
  * `make ingress-dedupe-fallback-negative`

### Routing dmScope precedence + identityLinks

**Claim:** routing must keep DM sessions isolated by default, and only collapse sessions when explicitly configured (channel precedence + identity links).

What it means:

* Channel-specific dmScope overrides must win over global defaults.

* identityLinks should collapse only within explicit linked groups, not across unrelated peers.

* Green:
  * `make routing-precedence`
  * `make routing-identitylinks`

* Red (expected):
  * `make routing-precedence-negative`
  * `make routing-identitylinks-negative`


Built with [Mintlify](https://mintlify.com).

---

## File: `security/THREAT-MODEL-ATLAS.md`

Source URL: https://docs.openclaw.ai/security/THREAT-MODEL-ATLAS.md

---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.openclaw.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# THREAT MODEL ATLAS

# OpenClaw Threat Model v1.0

## MITRE ATLAS Framework

**Version:** 1.0-draft
**Last Updated:** 2026-02-04
**Methodology:** MITRE ATLAS + Data Flow Diagrams
**Framework:** [MITRE ATLAS](https://atlas.mitre.org/) (Adversarial Threat Landscape for AI Systems)

### Framework Attribution

This threat model is built on [MITRE ATLAS](https://atlas.mitre.org/), the industry-standard framework for documenting adversarial threats to AI/ML systems. ATLAS is maintained by [MITRE](https://www.mitre.org/) in collaboration with the AI security community.

**Key ATLAS Resources:**

* [ATLAS Techniques](https://atlas.mitre.org/techniques/)
* [ATLAS Tactics](https://atlas.mitre.org/tactics/)
* [ATLAS Case Studies](https://atlas.mitre.org/studies/)
* [ATLAS GitHub](https://github.com/mitre-atlas/atlas-data)
* [Contributing to ATLAS](https://atlas.mitre.org/resources/contribute)

### Contributing to This Threat Model

This is a living document maintained by the OpenClaw community. See [CONTRIBUTING-THREAT-MODEL.md](/security/CONTRIBUTING-THREAT-MODEL) for guidelines on contributing:

* Reporting new threats
* Updating existing threats
* Proposing attack chains
* Suggesting mitigations

***

## 1. Introduction

### 1.1 Purpose

This threat model documents adversarial threats to the OpenClaw AI agent platform and ClawHub skill marketplace, using the MITRE ATLAS framework designed specifically for AI/ML systems.

### 1.2 Scope

| Component              | Included | Notes                                            |
| ---------------------- | -------- | ------------------------------------------------ |
| OpenClaw Agent Runtime | Yes      | Core agent execution, tool calls, sessions       |
| Gateway                | Yes      | Authentication, routing, channel integration     |
| Channel Integrations   | Yes      | WhatsApp, Telegram, Discord, Signal, Slack, etc. |
| ClawHub Marketplace    | Yes      | Skill publishing, moderation, distribution       |
| MCP Servers            | Yes      | External tool providers                          |
| User Devices           | Partial  | Mobile apps, desktop clients                     |

### 1.3 Out of Scope

Nothing is explicitly out of scope for this threat model.

***

## 2. System Architecture

### 2.1 Trust Boundaries

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    UNTRUSTED ZONE                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚  WhatsApp   â”‚  â”‚  Telegram   â”‚  â”‚   Discord   â”‚  ...         â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚         â”‚                â”‚                â”‚                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
          â”‚                â”‚                â”‚
          â–¼                â–¼                â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TRUST BOUNDARY 1: Channel Access                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                      GATEWAY                              â”‚   â”‚
â”‚  â”‚  â€¢ Device Pairing (30s grace period)                      â”‚   â”‚
â”‚  â”‚  â€¢ AllowFrom / AllowList validation                       â”‚   â”‚
â”‚  â”‚  â€¢ Token/Password/Tailscale auth                          â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TRUST BOUNDARY 2: Session Isolation              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                   AGENT SESSIONS                          â”‚   â”‚
â”‚  â”‚  â€¢ Session key = agent:channel:peer                       â”‚   â”‚
â”‚  â”‚  â€¢ Tool policies per agent                                â”‚   â”‚
â”‚  â”‚  â€¢ Transcript logging                                     â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TRUST BOUNDARY 3: Tool Execution                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                  EXECUTION SANDBOX                        â”‚   â”‚
â”‚  â”‚  â€¢ Docker sandbox OR Host (exec-approvals)                â”‚   â”‚
â”‚  â”‚  â€¢ Node remote execution                                  â”‚   â”‚
â”‚  â”‚  â€¢ SSRF protection (DNS pinning + IP blocking)            â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TRUST BOUNDARY 4: External Content               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚              FETCHED URLs / EMAILS / WEBHOOKS             â”‚   â”‚
â”‚  â”‚  â€¢ External content wrapping (XML tags)                   â”‚   â”‚
â”‚  â”‚  â€¢ Security notice injection                              â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 TRUST BOUNDARY 5: Supply Chain                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                      CLAWHUB                              â”‚   â”‚
â”‚  â”‚  â€¢ Skill publishing (semver, SKILL.md required)           â”‚   â”‚
â”‚  â”‚  â€¢ Pattern-based moderation flags                         â”‚   â”‚
â”‚  â”‚  â€¢ VirusTotal scanning (coming soon)                      â”‚   â”‚
â”‚  â”‚  â€¢ GitHub account age verification                        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Data Flows

| Flow | Source  | Destination | Data                | Protection           |
| ---- | ------- | ----------- | ------------------- | -------------------- |
| F1   | Channel | Gateway     | User messages       | TLS, AllowFrom       |
| F2   | Gateway | Agent       | Routed messages     | Session isolation    |
| F3   | Agent   | Tools       | Tool invocations    | Policy enforcement   |
| F4   | Agent   | External    | web\_fetch requests | SSRF blocking        |
| F5   | ClawHub | Agent       | Skill code          | Moderation, scanning |
| F6   | Agent   | Channel     | Responses           | Output filtering     |

***

## 3. Threat Analysis by ATLAS Tactic

### 3.1 Reconnaissance (AML.TA0002)

#### T-RECON-001: Agent Endpoint Discovery

| Attribute               | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0006 - Active Scanning                                          |
| **Description**         | Attacker scans for exposed OpenClaw gateway endpoints                |
| **Attack Vector**       | Network scanning, shodan queries, DNS enumeration                    |
| **Affected Components** | Gateway, exposed API endpoints                                       |
| **Current Mitigations** | Tailscale auth option, bind to loopback by default                   |
| **Residual Risk**       | Medium - Public gateways discoverable                                |
| **Recommendations**     | Document secure deployment, add rate limiting on discovery endpoints |

#### T-RECON-002: Channel Integration Probing

| Attribute               | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **ATLAS ID**            | AML.T0006 - Active Scanning                                        |
| **Description**         | Attacker probes messaging channels to identify AI-managed accounts |
| **Attack Vector**       | Sending test messages, observing response patterns                 |
| **Affected Components** | All channel integrations                                           |
| **Current Mitigations** | None specific                                                      |
| **Residual Risk**       | Low - Limited value from discovery alone                           |
| **Recommendations**     | Consider response timing randomization                             |

***

### 3.2 Initial Access (AML.TA0004)

#### T-ACCESS-001: Pairing Code Interception

| Attribute               | Value                                                    |
| ----------------------- | -------------------------------------------------------- |
| **ATLAS ID**            | AML.T0040 - AI Model Inference API Access                |
| **Description**         | Attacker intercepts pairing code during 30s grace period |
| **Attack Vector**       | Shoulder surfing, network sniffing, social engineering   |
| **Affected Components** | Device pairing system                                    |
| **Current Mitigations** | 30s expiry, codes sent via existing channel              |
| **Residual Risk**       | Medium - Grace period exploitable                        |
| **Recommendations**     | Reduce grace period, add confirmation step               |

#### T-ACCESS-002: AllowFrom Spoofing

| Attribute               | Value                                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| **ATLAS ID**            | AML.T0040 - AI Model Inference API Access                                      |
| **Description**         | Attacker spoofs allowed sender identity in channel                             |
| **Attack Vector**       | Depends on channel - phone number spoofing, username impersonation             |
| **Affected Components** | AllowFrom validation per channel                                               |
| **Current Mitigations** | Channel-specific identity verification                                         |
| **Residual Risk**       | Medium - Some channels vulnerable to spoofing                                  |
| **Recommendations**     | Document channel-specific risks, add cryptographic verification where possible |

#### T-ACCESS-003: Token Theft

| Attribute               | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| **ATLAS ID**            | AML.T0040 - AI Model Inference API Access                   |
| **Description**         | Attacker steals authentication tokens from config files     |
| **Attack Vector**       | Malware, unauthorized device access, config backup exposure |
| **Affected Components** | \~/.openclaw/credentials/, config storage                   |
| **Current Mitigations** | File permissions                                            |
| **Residual Risk**       | High - Tokens stored in plaintext                           |
| **Recommendations**     | Implement token encryption at rest, add token rotation      |

***

### 3.3 Execution (AML.TA0005)

#### T-EXEC-001: Direct Prompt Injection

| Attribute               | Value                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0051.000 - LLM Prompt Injection: Direct                                              |
| **Description**         | Attacker sends crafted prompts to manipulate agent behavior                               |
| **Attack Vector**       | Channel messages containing adversarial instructions                                      |
| **Affected Components** | Agent LLM, all input surfaces                                                             |
| **Current Mitigations** | Pattern detection, external content wrapping                                              |
| **Residual Risk**       | Critical - Detection only, no blocking; sophisticated attacks bypass                      |
| **Recommendations**     | Implement multi-layer defense, output validation, user confirmation for sensitive actions |

#### T-EXEC-002: Indirect Prompt Injection

| Attribute               | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| **ATLAS ID**            | AML.T0051.001 - LLM Prompt Injection: Indirect              |
| **Description**         | Attacker embeds malicious instructions in fetched content   |
| **Attack Vector**       | Malicious URLs, poisoned emails, compromised webhooks       |
| **Affected Components** | web\_fetch, email ingestion, external data sources          |
| **Current Mitigations** | Content wrapping with XML tags and security notice          |
| **Residual Risk**       | High - LLM may ignore wrapper instructions                  |
| **Recommendations**     | Implement content sanitization, separate execution contexts |

#### T-EXEC-003: Tool Argument Injection

| Attribute               | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| **ATLAS ID**            | AML.T0051.000 - LLM Prompt Injection: Direct                 |
| **Description**         | Attacker manipulates tool arguments through prompt injection |
| **Attack Vector**       | Crafted prompts that influence tool parameter values         |
| **Affected Components** | All tool invocations                                         |
| **Current Mitigations** | Exec approvals for dangerous commands                        |
| **Residual Risk**       | High - Relies on user judgment                               |
| **Recommendations**     | Implement argument validation, parameterized tool calls      |

#### T-EXEC-004: Exec Approval Bypass

| Attribute               | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **ATLAS ID**            | AML.T0043 - Craft Adversarial Data                         |
| **Description**         | Attacker crafts commands that bypass approval allowlist    |
| **Attack Vector**       | Command obfuscation, alias exploitation, path manipulation |
| **Affected Components** | exec-approvals.ts, command allowlist                       |
| **Current Mitigations** | Allowlist + ask mode                                       |
| **Residual Risk**       | High - No command sanitization                             |
| **Recommendations**     | Implement command normalization, expand blocklist          |

***

### 3.4 Persistence (AML.TA0006)

#### T-PERSIST-001: Malicious Skill Installation

| Attribute               | Value                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| **ATLAS ID**            | AML.T0010.001 - Supply Chain Compromise: AI Software                     |
| **Description**         | Attacker publishes malicious skill to ClawHub                            |
| **Attack Vector**       | Create account, publish skill with hidden malicious code                 |
| **Affected Components** | ClawHub, skill loading, agent execution                                  |
| **Current Mitigations** | GitHub account age verification, pattern-based moderation flags          |
| **Residual Risk**       | Critical - No sandboxing, limited review                                 |
| **Recommendations**     | VirusTotal integration (in progress), skill sandboxing, community review |

#### T-PERSIST-002: Skill Update Poisoning

| Attribute               | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0010.001 - Supply Chain Compromise: AI Software           |
| **Description**         | Attacker compromises popular skill and pushes malicious update |
| **Attack Vector**       | Account compromise, social engineering of skill owner          |
| **Affected Components** | ClawHub versioning, auto-update flows                          |
| **Current Mitigations** | Version fingerprinting                                         |
| **Residual Risk**       | High - Auto-updates may pull malicious versions                |
| **Recommendations**     | Implement update signing, rollback capability, version pinning |

#### T-PERSIST-003: Agent Configuration Tampering

| Attribute               | Value                                                           |
| ----------------------- | --------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0010.002 - Supply Chain Compromise: Data                   |
| **Description**         | Attacker modifies agent configuration to persist access         |
| **Attack Vector**       | Config file modification, settings injection                    |
| **Affected Components** | Agent config, tool policies                                     |
| **Current Mitigations** | File permissions                                                |
| **Residual Risk**       | Medium - Requires local access                                  |
| **Recommendations**     | Config integrity verification, audit logging for config changes |

***

### 3.5 Defense Evasion (AML.TA0007)

#### T-EVADE-001: Moderation Pattern Bypass

| Attribute               | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0043 - Craft Adversarial Data                                     |
| **Description**         | Attacker crafts skill content to evade moderation patterns             |
| **Attack Vector**       | Unicode homoglyphs, encoding tricks, dynamic loading                   |
| **Affected Components** | ClawHub moderation.ts                                                  |
| **Current Mitigations** | Pattern-based FLAG\_RULES                                              |
| **Residual Risk**       | High - Simple regex easily bypassed                                    |
| **Recommendations**     | Add behavioral analysis (VirusTotal Code Insight), AST-based detection |

#### T-EVADE-002: Content Wrapper Escape

| Attribute               | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| **ATLAS ID**            | AML.T0043 - Craft Adversarial Data                        |
| **Description**         | Attacker crafts content that escapes XML wrapper context  |
| **Attack Vector**       | Tag manipulation, context confusion, instruction override |
| **Affected Components** | External content wrapping                                 |
| **Current Mitigations** | XML tags + security notice                                |
| **Residual Risk**       | Medium - Novel escapes discovered regularly               |
| **Recommendations**     | Multiple wrapper layers, output-side validation           |

***

### 3.6 Discovery (AML.TA0008)

#### T-DISC-001: Tool Enumeration

| Attribute               | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **ATLAS ID**            | AML.T0040 - AI Model Inference API Access             |
| **Description**         | Attacker enumerates available tools through prompting |
| **Attack Vector**       | "What tools do you have?" style queries               |
| **Affected Components** | Agent tool registry                                   |
| **Current Mitigations** | None specific                                         |
| **Residual Risk**       | Low - Tools generally documented                      |
| **Recommendations**     | Consider tool visibility controls                     |

#### T-DISC-002: Session Data Extraction

| Attribute               | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **ATLAS ID**            | AML.T0040 - AI Model Inference API Access             |
| **Description**         | Attacker extracts sensitive data from session context |
| **Attack Vector**       | "What did we discuss?" queries, context probing       |
| **Affected Components** | Session transcripts, context window                   |
| **Current Mitigations** | Session isolation per sender                          |
| **Residual Risk**       | Medium - Within-session data accessible               |
| **Recommendations**     | Implement sensitive data redaction in context         |

***

### 3.7 Collection & Exfiltration (AML.TA0009, AML.TA0010)

#### T-EXFIL-001: Data Theft via web\_fetch

| Attribute               | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0009 - Collection                                                 |
| **Description**         | Attacker exfiltrates data by instructing agent to send to external URL |
| **Attack Vector**       | Prompt injection causing agent to POST data to attacker server         |
| **Affected Components** | web\_fetch tool                                                        |
| **Current Mitigations** | SSRF blocking for internal networks                                    |
| **Residual Risk**       | High - External URLs permitted                                         |
| **Recommendations**     | Implement URL allowlisting, data classification awareness              |

#### T-EXFIL-002: Unauthorized Message Sending

| Attribute               | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **ATLAS ID**            | AML.T0009 - Collection                                           |
| **Description**         | Attacker causes agent to send messages containing sensitive data |
| **Attack Vector**       | Prompt injection causing agent to message attacker               |
| **Affected Components** | Message tool, channel integrations                               |
| **Current Mitigations** | Outbound messaging gating                                        |
| **Residual Risk**       | Medium - Gating may be bypassed                                  |
| **Recommendations**     | Require explicit confirmation for new recipients                 |

#### T-EXFIL-003: Credential Harvesting

| Attribute               | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **ATLAS ID**            | AML.T0009 - Collection                                  |
| **Description**         | Malicious skill harvests credentials from agent context |
| **Attack Vector**       | Skill code reads environment variables, config files    |
| **Affected Components** | Skill execution environment                             |
| **Current Mitigations** | None specific to skills                                 |
| **Residual Risk**       | Critical - Skills run with agent privileges             |
| **Recommendations**     | Skill sandboxing, credential isolation                  |

***

### 3.8 Impact (AML.TA0011)

#### T-IMPACT-001: Unauthorized Command Execution

| Attribute               | Value                                               |
| ----------------------- | --------------------------------------------------- |
| **ATLAS ID**            | AML.T0031 - Erode AI Model Integrity                |
| **Description**         | Attacker executes arbitrary commands on user system |
| **Attack Vector**       | Prompt injection combined with exec approval bypass |
| **Affected Components** | Bash tool, command execution                        |
| **Current Mitigations** | Exec approvals, Docker sandbox option               |
| **Residual Risk**       | Critical - Host execution without sandbox           |
| **Recommendations**     | Default to sandbox, improve approval UX             |

#### T-IMPACT-002: Resource Exhaustion (DoS)

| Attribute               | Value                                              |
| ----------------------- | -------------------------------------------------- |
| **ATLAS ID**            | AML.T0031 - Erode AI Model Integrity               |
| **Description**         | Attacker exhausts API credits or compute resources |
| **Attack Vector**       | Automated message flooding, expensive tool calls   |
| **Affected Components** | Gateway, agent sessions, API provider              |
| **Current Mitigations** | None                                               |
| **Residual Risk**       | High - No rate limiting                            |
| **Recommendations**     | Implement per-sender rate limits, cost budgets     |

#### T-IMPACT-003: Reputation Damage

| Attribute               | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **ATLAS ID**            | AML.T0031 - Erode AI Model Integrity                    |
| **Description**         | Attacker causes agent to send harmful/offensive content |
| **Attack Vector**       | Prompt injection causing inappropriate responses        |
| **Affected Components** | Output generation, channel messaging                    |
| **Current Mitigations** | LLM provider content policies                           |
| **Residual Risk**       | Medium - Provider filters imperfect                     |
| **Recommendations**     | Output filtering layer, user controls                   |

***

## 4. ClawHub Supply Chain Analysis

### 4.1 Current Security Controls

| Control              | Implementation               | Effectiveness                                        |
| -------------------- | ---------------------------- | ---------------------------------------------------- |
| GitHub Account Age   | `requireGitHubAccountAge()`  | Medium - Raises bar for new attackers                |
| Path Sanitization    | `sanitizePath()`             | High - Prevents path traversal                       |
| File Type Validation | `isTextFile()`               | Medium - Only text files, but can still be malicious |
| Size Limits          | 50MB total bundle            | High - Prevents resource exhaustion                  |
| Required SKILL.md    | Mandatory readme             | Low security value - Informational only              |
| Pattern Moderation   | FLAG\_RULES in moderation.ts | Low - Easily bypassed                                |
| Moderation Status    | `moderationStatus` field     | Medium - Manual review possible                      |

### 4.2 Moderation Flag Patterns

Current patterns in `moderation.ts`:

```javascript  theme={"theme":{"light":"min-light","dark":"min-dark"}}
// Known-bad identifiers
/(keepcold131\/ClawdAuthenticatorTool|ClawdAuthenticatorTool)/i

// Suspicious keywords
/(malware|stealer|phish|phishing|keylogger)/i
/(api[-_ ]?key|token|password|private key|secret)/i
/(wallet|seed phrase|mnemonic|crypto)/i
/(discord\.gg|webhook|hooks\.slack)/i
/(curl[^\n]+\|\s*(sh|bash))/i
/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd)/i
```

**Limitations:**

* Only checks slug, displayName, summary, frontmatter, metadata, file paths
* Does not analyze actual skill code content
* Simple regex easily bypassed with obfuscation
* No behavioral analysis

### 4.3 Planned Improvements

| Improvement            | Status                                | Impact                                                                |
| ---------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| VirusTotal Integration | In Progress                           | High - Code Insight behavioral analysis                               |
| Community Reporting    | Partial (`skillReports` table exists) | Medium                                                                |
| Audit Logging          | Partial (`auditLogs` table exists)    | Medium                                                                |
| Badge System           | Implemented                           | Medium - `highlighted`, `official`, `deprecated`, `redactionApproved` |

***

## 5. Risk Matrix

### 5.1 Likelihood vs Impact

| Threat ID     | Likelihood | Impact   | Risk Level   | Priority |
| ------------- | ---------- | -------- | ------------ | -------- |
| T-EXEC-001    | High       | Critical | **Critical** | P0       |
| T-PERSIST-001 | High       | Critical | **Critical** | P0       |
| T-EXFIL-003   | Medium     | Critical | **Critical** | P0       |
| T-IMPACT-001  | Medium     | Critical | **High**     | P1       |
| T-EXEC-002    | High       | High     | **High**     | P1       |
| T-EXEC-004    | Medium     | High     | **High**     | P1       |
| T-ACCESS-003  | Medium     | High     | **High**     | P1       |
| T-EXFIL-001   | Medium     | High     | **High**     | P1       |
| T-IMPACT-002  | High       | Medium   | **High**     | P1       |
| T-EVADE-001   | High       | Medium   | **Medium**   | P2       |
| T-ACCESS-001  | Low        | High     | **Medium**   | P2       |
| T-ACCESS-002  | Low        | High     | **Medium**   | P2       |
| T-PERSIST-002 | Low        | High     | **Medium**   | P2       |

### 5.2 Critical Path Attack Chains

**Attack Chain 1: Skill-Based Data Theft**

```
T-PERSIST-001 â†’ T-EVADE-001 â†’ T-EXFIL-003
(Publish malicious skill) â†’ (Evade moderation) â†’ (Harvest credentials)
```

**Attack Chain 2: Prompt Injection to RCE**

```
T-EXEC-001 â†’ T-EXEC-004 â†’ T-IMPACT-001
(Inject prompt) â†’ (Bypass exec approval) â†’ (Execute commands)
```

**Attack Chain 3: Indirect Injection via Fetched Content**

```
T-EXEC-002 â†’ T-EXFIL-001 â†’ External exfiltration
(Poison URL content) â†’ (Agent fetches & follows instructions) â†’ (Data sent to attacker)
```

***

## 6. Recommendations Summary

### 6.1 Immediate (P0)

| ID    | Recommendation                              | Addresses                  |
| ----- | ------------------------------------------- | -------------------------- |
| R-001 | Complete VirusTotal integration             | T-PERSIST-001, T-EVADE-001 |
| R-002 | Implement skill sandboxing                  | T-PERSIST-001, T-EXFIL-003 |
| R-003 | Add output validation for sensitive actions | T-EXEC-001, T-EXEC-002     |

### 6.2 Short-term (P1)

| ID    | Recommendation                            | Addresses    |
| ----- | ----------------------------------------- | ------------ |
| R-004 | Implement rate limiting                   | T-IMPACT-002 |
| R-005 | Add token encryption at rest              | T-ACCESS-003 |
| R-006 | Improve exec approval UX and validation   | T-EXEC-004   |
| R-007 | Implement URL allowlisting for web\_fetch | T-EXFIL-001  |

### 6.3 Medium-term (P2)

| ID    | Recommendation                                        | Addresses     |
| ----- | ----------------------------------------------------- | ------------- |
| R-008 | Add cryptographic channel verification where possible | T-ACCESS-002  |
| R-009 | Implement config integrity verification               | T-PERSIST-003 |
| R-010 | Add update signing and version pinning                | T-PERSIST-002 |

***

## 7. Appendices

### 7.1 ATLAS Technique Mapping

| ATLAS ID      | Technique Name                 | OpenClaw Threats                                                 |
| ------------- | ------------------------------ | ---------------------------------------------------------------- |
| AML.T0006     | Active Scanning                | T-RECON-001, T-RECON-002                                         |
| AML.T0009     | Collection                     | T-EXFIL-001, T-EXFIL-002, T-EXFIL-003                            |
| AML.T0010.001 | Supply Chain: AI Software      | T-PERSIST-001, T-PERSIST-002                                     |
| AML.T0010.002 | Supply Chain: Data             | T-PERSIST-003                                                    |
| AML.T0031     | Erode AI Model Integrity       | T-IMPACT-001, T-IMPACT-002, T-IMPACT-003                         |
| AML.T0040     | AI Model Inference API Access  | T-ACCESS-001, T-ACCESS-002, T-ACCESS-003, T-DISC-001, T-DISC-002 |
| AML.T0043     | Craft Adversarial Data         | T-EXEC-004, T-EVADE-001, T-EVADE-002                             |
| AML.T0051.000 | LLM Prompt Injection: Direct   | T-EXEC-001, T-EXEC-003                                           |
| AML.T0051.001 | LLM Prompt Injection: Indirect | T-EXEC-002                                                       |

### 7.2 Key Security Files

| Path                                | Purpose                     | Risk Level   |
| ----------------------------------- | --------------------------- | ------------ |
| `src/infra/exec-approvals.ts`       | Command approval logic      | **Critical** |
| `src/gateway/auth.ts`               | Gateway authentication      | **Critical** |
| `src/web/inbound/access-control.ts` | Channel access control      | **Critical** |
| `src/infra/net/ssrf.ts`             | SSRF protection             | **Critical** |
| `src/security/external-content.ts`  | Prompt injection mitigation | **Critical** |
| `src/agents/sandbox/tool-policy.ts` | Tool policy enforcement     | **Critical** |
| `convex/lib/moderation.ts`          | ClawHub moderation          | **High**     |
| `convex/lib/skillPublish.ts`        | Skill publishing flow       | **High**     |
| `src/routing/resolve-route.ts`      | Session isolation           | **Medium**   |

### 7.3 Glossary

| Term                 | Definition                                                |
| -------------------- | --------------------------------------------------------- |
| **ATLAS**            | MITRE's Adversarial Threat Landscape for AI Systems       |
| **ClawHub**          | OpenClaw's skill marketplace                              |
| **Gateway**          | OpenClaw's message routing and authentication layer       |
| **MCP**              | Model Context Protocol - tool provider interface          |
| **Prompt Injection** | Attack where malicious instructions are embedded in input |
| **Skill**            | Downloadable extension for OpenClaw agents                |
| **SSRF**             | Server-Side Request Forgery                               |

***

*This threat model is a living document. Report security issues to [security@openclaw.ai](mailto:security@openclaw.ai)*


Built with [Mintlify](https://mintlify.com).

---

