param(
    [string]$OutputDir = (Join-Path (Get-Location) "openclaw-docs-grouped"),
    [switch]$Clean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-FlatFileName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    $uri = [Uri]$Url
    $relativePath = $uri.AbsolutePath.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.md"
    }

    $flatName = ($relativePath -split "/" | Where-Object { $_ }) -join "__"
    foreach ($invalidChar in [IO.Path]::GetInvalidFileNameChars()) {
        $flatName = $flatName.Replace([string]$invalidChar, "_")
    }

    return $flatName
}

function Get-RelativeDocPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    return ([Uri]$Url).AbsolutePath.TrimStart("/")
}

function Get-CategoryName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativeDocPath
    )

    switch -Regex ($RelativeDocPath) {
        '^automation/' { return 'Automation' }
        '^channels/' { return 'Channels' }
        '^cli/' { return 'CLI' }
        '^concepts/' { return 'Concepts' }
        '^gateway/' { return 'Gateway' }
        '^help/' { return 'Help' }
        '^install/' { return 'Install' }
        '^nodes/' { return 'Nodes' }
        '^platforms/' { return 'Platforms' }
        '^plugins/' { return 'Plugins' }
        '^providers/' { return 'Providers' }
        '^reference/' { return 'Reference' }
        '^security/' { return 'Security' }
        '^start/' { return 'Start' }
        '^tools/' { return 'Tools' }
        '^web/' { return 'Web' }
        '^(debug|design|diagnostics|experiments)/' { return 'Engineering' }
        default { return 'General' }
    }
}

$rawUrls = @"
https://docs.openclaw.ai/auth-credential-semantics.md
https://docs.openclaw.ai/automation/auth-monitoring.md
https://docs.openclaw.ai/automation/cron-jobs.md
https://docs.openclaw.ai/automation/cron-vs-heartbeat.md
https://docs.openclaw.ai/automation/gmail-pubsub.md
https://docs.openclaw.ai/automation/hooks.md
https://docs.openclaw.ai/automation/poll.md
https://docs.openclaw.ai/automation/troubleshooting.md
https://docs.openclaw.ai/automation/webhook.md
https://docs.openclaw.ai/brave-search.md
https://docs.openclaw.ai/channels/bluebubbles.md
https://docs.openclaw.ai/channels/broadcast-groups.md
https://docs.openclaw.ai/channels/channel-routing.md
https://docs.openclaw.ai/channels/discord.md
https://docs.openclaw.ai/channels/feishu.md
https://docs.openclaw.ai/channels/googlechat.md
https://docs.openclaw.ai/channels/group-messages.md
https://docs.openclaw.ai/channels/groups.md
https://docs.openclaw.ai/channels/imessage.md
https://docs.openclaw.ai/channels/index.md
https://docs.openclaw.ai/channels/irc.md
https://docs.openclaw.ai/channels/line.md
https://docs.openclaw.ai/channels/location.md
https://docs.openclaw.ai/channels/matrix.md
https://docs.openclaw.ai/channels/mattermost.md
https://docs.openclaw.ai/channels/msteams.md
https://docs.openclaw.ai/channels/nextcloud-talk.md
https://docs.openclaw.ai/channels/nostr.md
https://docs.openclaw.ai/channels/pairing.md
https://docs.openclaw.ai/channels/signal.md
https://docs.openclaw.ai/channels/slack.md
https://docs.openclaw.ai/channels/synology-chat.md
https://docs.openclaw.ai/channels/telegram.md
https://docs.openclaw.ai/channels/tlon.md
https://docs.openclaw.ai/channels/troubleshooting.md
https://docs.openclaw.ai/channels/twitch.md
https://docs.openclaw.ai/channels/whatsapp.md
https://docs.openclaw.ai/channels/zalo.md
https://docs.openclaw.ai/channels/zalouser.md
https://docs.openclaw.ai/ci.md
https://docs.openclaw.ai/cli/acp.md
https://docs.openclaw.ai/cli/agent.md
https://docs.openclaw.ai/cli/agents.md
https://docs.openclaw.ai/cli/approvals.md
https://docs.openclaw.ai/cli/browser.md
https://docs.openclaw.ai/cli/channels.md
https://docs.openclaw.ai/cli/clawbot.md
https://docs.openclaw.ai/cli/completion.md
https://docs.openclaw.ai/cli/config.md
https://docs.openclaw.ai/cli/configure.md
https://docs.openclaw.ai/cli/cron.md
https://docs.openclaw.ai/cli/daemon.md
https://docs.openclaw.ai/cli/dashboard.md
https://docs.openclaw.ai/cli/devices.md
https://docs.openclaw.ai/cli/directory.md
https://docs.openclaw.ai/cli/dns.md
https://docs.openclaw.ai/cli/docs.md
https://docs.openclaw.ai/cli/doctor.md
https://docs.openclaw.ai/cli/gateway.md
https://docs.openclaw.ai/cli/health.md
https://docs.openclaw.ai/cli/hooks.md
https://docs.openclaw.ai/cli/index.md
https://docs.openclaw.ai/cli/logs.md
https://docs.openclaw.ai/cli/memory.md
https://docs.openclaw.ai/cli/message.md
https://docs.openclaw.ai/cli/models.md
https://docs.openclaw.ai/cli/node.md
https://docs.openclaw.ai/cli/nodes.md
https://docs.openclaw.ai/cli/onboard.md
https://docs.openclaw.ai/cli/pairing.md
https://docs.openclaw.ai/cli/plugins.md
https://docs.openclaw.ai/cli/qr.md
https://docs.openclaw.ai/cli/reset.md
https://docs.openclaw.ai/cli/sandbox.md
https://docs.openclaw.ai/cli/secrets.md
https://docs.openclaw.ai/cli/security.md
https://docs.openclaw.ai/cli/sessions.md
https://docs.openclaw.ai/cli/setup.md
https://docs.openclaw.ai/cli/skills.md
https://docs.openclaw.ai/cli/status.md
https://docs.openclaw.ai/cli/system.md
https://docs.openclaw.ai/cli/tui.md
https://docs.openclaw.ai/cli/uninstall.md
https://docs.openclaw.ai/cli/update.md
https://docs.openclaw.ai/cli/voicecall.md
https://docs.openclaw.ai/cli/webhooks.md
https://docs.openclaw.ai/concepts/agent.md
https://docs.openclaw.ai/concepts/agent-loop.md
https://docs.openclaw.ai/concepts/agent-workspace.md
https://docs.openclaw.ai/concepts/architecture.md
https://docs.openclaw.ai/concepts/compaction.md
https://docs.openclaw.ai/concepts/context.md
https://docs.openclaw.ai/concepts/features.md
https://docs.openclaw.ai/concepts/markdown-formatting.md
https://docs.openclaw.ai/concepts/memory.md
https://docs.openclaw.ai/concepts/messages.md
https://docs.openclaw.ai/concepts/model-failover.md
https://docs.openclaw.ai/concepts/model-providers.md
https://docs.openclaw.ai/concepts/models.md
https://docs.openclaw.ai/concepts/multi-agent.md
https://docs.openclaw.ai/concepts/oauth.md
https://docs.openclaw.ai/concepts/presence.md
https://docs.openclaw.ai/concepts/queue.md
https://docs.openclaw.ai/concepts/retry.md
https://docs.openclaw.ai/concepts/session.md
https://docs.openclaw.ai/concepts/session-pruning.md
https://docs.openclaw.ai/concepts/session-tool.md
https://docs.openclaw.ai/concepts/streaming.md
https://docs.openclaw.ai/concepts/system-prompt.md
https://docs.openclaw.ai/concepts/timezone.md
https://docs.openclaw.ai/concepts/typebox.md
https://docs.openclaw.ai/concepts/typing-indicators.md
https://docs.openclaw.ai/concepts/usage-tracking.md
https://docs.openclaw.ai/date-time.md
https://docs.openclaw.ai/debug/node-issue.md
https://docs.openclaw.ai/design/kilo-gateway-integration.md
https://docs.openclaw.ai/diagnostics/flags.md
https://docs.openclaw.ai/experiments/onboarding-config-protocol.md
https://docs.openclaw.ai/experiments/plans/acp-thread-bound-agents.md
https://docs.openclaw.ai/experiments/plans/acp-unified-streaming-refactor.md
https://docs.openclaw.ai/experiments/plans/browser-evaluate-cdp-refactor.md
https://docs.openclaw.ai/experiments/plans/openresponses-gateway.md
https://docs.openclaw.ai/experiments/plans/pty-process-supervision.md
https://docs.openclaw.ai/experiments/plans/session-binding-channel-agnostic.md
https://docs.openclaw.ai/experiments/proposals/model-config.md
https://docs.openclaw.ai/experiments/research/memory.md
https://docs.openclaw.ai/gateway/authentication.md
https://docs.openclaw.ai/gateway/background-process.md
https://docs.openclaw.ai/gateway/bonjour.md
https://docs.openclaw.ai/gateway/bridge-protocol.md
https://docs.openclaw.ai/gateway/cli-backends.md
https://docs.openclaw.ai/gateway/configuration.md
https://docs.openclaw.ai/gateway/configuration-examples.md
https://docs.openclaw.ai/gateway/configuration-reference.md
https://docs.openclaw.ai/gateway/discovery.md
https://docs.openclaw.ai/gateway/doctor.md
https://docs.openclaw.ai/gateway/gateway-lock.md
https://docs.openclaw.ai/gateway/health.md
https://docs.openclaw.ai/gateway/heartbeat.md
https://docs.openclaw.ai/gateway/index.md
https://docs.openclaw.ai/gateway/local-models.md
https://docs.openclaw.ai/gateway/logging.md
https://docs.openclaw.ai/gateway/multiple-gateways.md
https://docs.openclaw.ai/gateway/network-model.md
https://docs.openclaw.ai/gateway/openai-http-api.md
https://docs.openclaw.ai/gateway/openresponses-http-api.md
https://docs.openclaw.ai/gateway/pairing.md
https://docs.openclaw.ai/gateway/protocol.md
https://docs.openclaw.ai/gateway/remote.md
https://docs.openclaw.ai/gateway/remote-gateway-readme.md
https://docs.openclaw.ai/gateway/sandbox-vs-tool-policy-vs-elevated.md
https://docs.openclaw.ai/gateway/sandboxing.md
https://docs.openclaw.ai/gateway/secrets.md
https://docs.openclaw.ai/gateway/secrets-plan-contract.md
https://docs.openclaw.ai/gateway/security/index.md
https://docs.openclaw.ai/gateway/tailscale.md
https://docs.openclaw.ai/gateway/tools-invoke-http-api.md
https://docs.openclaw.ai/gateway/troubleshooting.md
https://docs.openclaw.ai/gateway/trusted-proxy-auth.md
https://docs.openclaw.ai/help/debugging.md
https://docs.openclaw.ai/help/environment.md
https://docs.openclaw.ai/help/faq.md
https://docs.openclaw.ai/help/index.md
https://docs.openclaw.ai/help/scripts.md
https://docs.openclaw.ai/help/testing.md
https://docs.openclaw.ai/help/troubleshooting.md
https://docs.openclaw.ai/index.md
https://docs.openclaw.ai/install/ansible.md
https://docs.openclaw.ai/install/bun.md
https://docs.openclaw.ai/install/development-channels.md
https://docs.openclaw.ai/install/docker.md
https://docs.openclaw.ai/install/exe-dev.md
https://docs.openclaw.ai/install/fly.md
https://docs.openclaw.ai/install/gcp.md
https://docs.openclaw.ai/install/hetzner.md
https://docs.openclaw.ai/install/index.md
https://docs.openclaw.ai/install/installer.md
https://docs.openclaw.ai/install/macos-vm.md
https://docs.openclaw.ai/install/migrating.md
https://docs.openclaw.ai/install/nix.md
https://docs.openclaw.ai/install/node.md
https://docs.openclaw.ai/install/northflank.md
https://docs.openclaw.ai/install/podman.md
https://docs.openclaw.ai/install/railway.md
https://docs.openclaw.ai/install/render.md
https://docs.openclaw.ai/install/uninstall.md
https://docs.openclaw.ai/install/updating.md
https://docs.openclaw.ai/nodes/audio.md
https://docs.openclaw.ai/nodes/camera.md
https://docs.openclaw.ai/nodes/images.md
https://docs.openclaw.ai/nodes/index.md
https://docs.openclaw.ai/nodes/location-command.md
https://docs.openclaw.ai/nodes/media-understanding.md
https://docs.openclaw.ai/nodes/talk.md
https://docs.openclaw.ai/nodes/troubleshooting.md
https://docs.openclaw.ai/nodes/voicewake.md
https://docs.openclaw.ai/perplexity.md
https://docs.openclaw.ai/pi.md
https://docs.openclaw.ai/pi-dev.md
https://docs.openclaw.ai/platforms/android.md
https://docs.openclaw.ai/platforms/digitalocean.md
https://docs.openclaw.ai/platforms/index.md
https://docs.openclaw.ai/platforms/ios.md
https://docs.openclaw.ai/platforms/linux.md
https://docs.openclaw.ai/platforms/mac/bundled-gateway.md
https://docs.openclaw.ai/platforms/mac/canvas.md
https://docs.openclaw.ai/platforms/mac/child-process.md
https://docs.openclaw.ai/platforms/mac/dev-setup.md
https://docs.openclaw.ai/platforms/mac/health.md
https://docs.openclaw.ai/platforms/mac/icon.md
https://docs.openclaw.ai/platforms/mac/logging.md
https://docs.openclaw.ai/platforms/mac/menu-bar.md
https://docs.openclaw.ai/platforms/mac/peekaboo.md
https://docs.openclaw.ai/platforms/mac/permissions.md
https://docs.openclaw.ai/platforms/mac/release.md
https://docs.openclaw.ai/platforms/mac/remote.md
https://docs.openclaw.ai/platforms/mac/signing.md
https://docs.openclaw.ai/platforms/mac/skills.md
https://docs.openclaw.ai/platforms/mac/voice-overlay.md
https://docs.openclaw.ai/platforms/mac/voicewake.md
https://docs.openclaw.ai/platforms/mac/webchat.md
https://docs.openclaw.ai/platforms/mac/xpc.md
https://docs.openclaw.ai/platforms/macos.md
https://docs.openclaw.ai/platforms/oracle.md
https://docs.openclaw.ai/platforms/raspberry-pi.md
https://docs.openclaw.ai/platforms/windows.md
https://docs.openclaw.ai/plugins/agent-tools.md
https://docs.openclaw.ai/plugins/community.md
https://docs.openclaw.ai/plugins/manifest.md
https://docs.openclaw.ai/plugins/voice-call.md
https://docs.openclaw.ai/plugins/zalouser.md
https://docs.openclaw.ai/prose.md
https://docs.openclaw.ai/providers/anthropic.md
https://docs.openclaw.ai/providers/bedrock.md
https://docs.openclaw.ai/providers/claude-max-api-proxy.md
https://docs.openclaw.ai/providers/cloudflare-ai-gateway.md
https://docs.openclaw.ai/providers/deepgram.md
https://docs.openclaw.ai/providers/github-copilot.md
https://docs.openclaw.ai/providers/glm.md
https://docs.openclaw.ai/providers/huggingface.md
https://docs.openclaw.ai/providers/index.md
https://docs.openclaw.ai/providers/kilocode.md
https://docs.openclaw.ai/providers/litellm.md
https://docs.openclaw.ai/providers/minimax.md
https://docs.openclaw.ai/providers/mistral.md
https://docs.openclaw.ai/providers/models.md
https://docs.openclaw.ai/providers/moonshot.md
https://docs.openclaw.ai/providers/nvidia.md
https://docs.openclaw.ai/providers/ollama.md
https://docs.openclaw.ai/providers/openai.md
https://docs.openclaw.ai/providers/opencode.md
https://docs.openclaw.ai/providers/opencode-go.md
https://docs.openclaw.ai/providers/openrouter.md
https://docs.openclaw.ai/providers/qianfan.md
https://docs.openclaw.ai/providers/qwen.md
https://docs.openclaw.ai/providers/synthetic.md
https://docs.openclaw.ai/providers/together.md
https://docs.openclaw.ai/providers/venice.md
https://docs.openclaw.ai/providers/vercel-ai-gateway.md
https://docs.openclaw.ai/providers/vllm.md
https://docs.openclaw.ai/providers/xiaomi.md
https://docs.openclaw.ai/providers/zai.md
https://docs.openclaw.ai/reference/AGENTS.default.md
https://docs.openclaw.ai/reference/RELEASING.md
https://docs.openclaw.ai/reference/api-usage-costs.md
https://docs.openclaw.ai/reference/credits.md
https://docs.openclaw.ai/reference/device-models.md
https://docs.openclaw.ai/reference/prompt-caching.md
https://docs.openclaw.ai/reference/rpc.md
https://docs.openclaw.ai/reference/secretref-credential-surface.md
https://docs.openclaw.ai/reference/session-management-compaction.md
https://docs.openclaw.ai/reference/templates/AGENTS.md
https://docs.openclaw.ai/reference/templates/BOOT.md
https://docs.openclaw.ai/reference/templates/BOOTSTRAP.md
https://docs.openclaw.ai/reference/templates/HEARTBEAT.md
https://docs.openclaw.ai/reference/templates/IDENTITY.md
https://docs.openclaw.ai/reference/templates/SOUL.md
https://docs.openclaw.ai/reference/templates/TOOLS.md
https://docs.openclaw.ai/reference/templates/USER.md
https://docs.openclaw.ai/reference/test.md
https://docs.openclaw.ai/reference/token-use.md
https://docs.openclaw.ai/reference/transcript-hygiene.md
https://docs.openclaw.ai/reference/wizard.md
https://docs.openclaw.ai/security/CONTRIBUTING-THREAT-MODEL.md
https://docs.openclaw.ai/security/THREAT-MODEL-ATLAS.md
https://docs.openclaw.ai/security/formal-verification.md
https://docs.openclaw.ai/start/bootstrapping.md
https://docs.openclaw.ai/start/docs-directory.md
https://docs.openclaw.ai/start/getting-started.md
https://docs.openclaw.ai/start/hubs.md
https://docs.openclaw.ai/start/lore.md
https://docs.openclaw.ai/start/onboarding.md
https://docs.openclaw.ai/start/onboarding-overview.md
https://docs.openclaw.ai/start/openclaw.md
https://docs.openclaw.ai/start/setup.md
https://docs.openclaw.ai/start/showcase.md
https://docs.openclaw.ai/start/wizard.md
https://docs.openclaw.ai/start/wizard-cli-automation.md
https://docs.openclaw.ai/start/wizard-cli-reference.md
https://docs.openclaw.ai/tools/acp-agents.md
https://docs.openclaw.ai/tools/agent-send.md
https://docs.openclaw.ai/tools/apply-patch.md
https://docs.openclaw.ai/tools/browser.md
https://docs.openclaw.ai/tools/browser-linux-troubleshooting.md
https://docs.openclaw.ai/tools/browser-login.md
https://docs.openclaw.ai/tools/chrome-extension.md
https://docs.openclaw.ai/tools/clawhub.md
https://docs.openclaw.ai/tools/creating-skills.md
https://docs.openclaw.ai/tools/diffs.md
https://docs.openclaw.ai/tools/elevated.md
https://docs.openclaw.ai/tools/exec.md
https://docs.openclaw.ai/tools/exec-approvals.md
https://docs.openclaw.ai/tools/firecrawl.md
https://docs.openclaw.ai/tools/index.md
https://docs.openclaw.ai/tools/llm-task.md
https://docs.openclaw.ai/tools/lobster.md
https://docs.openclaw.ai/tools/loop-detection.md
https://docs.openclaw.ai/tools/multi-agent-sandbox-tools.md
https://docs.openclaw.ai/tools/pdf.md
https://docs.openclaw.ai/tools/plugin.md
https://docs.openclaw.ai/tools/reactions.md
https://docs.openclaw.ai/tools/skills.md
https://docs.openclaw.ai/tools/skills-config.md
https://docs.openclaw.ai/tools/slash-commands.md
https://docs.openclaw.ai/tools/subagents.md
https://docs.openclaw.ai/tools/thinking.md
https://docs.openclaw.ai/tools/web.md
https://docs.openclaw.ai/tts.md
https://docs.openclaw.ai/vps.md
https://docs.openclaw.ai/web/control-ui.md
https://docs.openclaw.ai/web/dashboard.md
https://docs.openclaw.ai/web/index.md
https://docs.openclaw.ai/web/tui.md
https://docs.openclaw.ai/web/webchat.md
"@

$urls = $rawUrls -split "\r?\n" |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and $_ -match "^https://docs\.openclaw\.ai/.+\.md$" } |
    Sort-Object -Unique

if ($urls.Count -eq 0) {
    throw "No Markdown URLs were configured."
}

if ($Clean -and (Test-Path -LiteralPath $OutputDir)) {
    Remove-Item -LiteralPath $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$manifest = New-Object System.Collections.Generic.List[object]
$failures = New-Object System.Collections.Generic.List[object]

Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $true
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(60)
$client.DefaultRequestHeaders.UserAgent.ParseAdd("OpenClawDocsCategorizer/1.0")

try {
    foreach ($url in $urls) {
        $relativeDocPath = Get-RelativeDocPath -Url $url
        $category = Get-CategoryName -RelativeDocPath $relativeDocPath
        $fileName = Get-FlatFileName -Url $url
        $categoryDir = Join-Path $OutputDir $category
        $destination = Join-Path $categoryDir $fileName

        New-Item -ItemType Directory -Path $categoryDir -Force | Out-Null

        try {
            $response = $client.GetAsync($url).GetAwaiter().GetResult()
            $statusCode = [int]$response.StatusCode
            if (-not $response.IsSuccessStatusCode) {
                throw "HTTP $statusCode"
            }

            $contentType = ""
            if ($null -ne $response.Content.Headers.ContentType) {
                $contentType = $response.Content.Headers.ContentType.ToString()
            }

            $bytes = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
            [IO.File]::WriteAllBytes($destination, $bytes)

            $manifest.Add([PSCustomObject]@{
                    Category      = $category
                    FileName      = $fileName
                    RelativePath  = $relativeDocPath
                    Url           = $url
                    StatusCode    = $statusCode
                    ContentType   = $contentType
                    Bytes         = $bytes.Length
                    SavedAs       = (Join-Path $category $fileName)
                })

            Write-Host ("[{0}] {1}" -f $category, $fileName)
        }
        catch {
            $failures.Add([PSCustomObject]@{
                    Category     = $category
                    FileName     = $fileName
                    RelativePath = $relativeDocPath
                    Url          = $url
                    Error        = $_.Exception.Message
                })

            Write-Warning ("Failed {0}: {1}" -f $url, $_.Exception.Message)
        }
    }
}
finally {
    $client.Dispose()
    $handler.Dispose()
}

$manifestPath = Join-Path $OutputDir "manifest.csv"
$manifest | Sort-Object Category, FileName | Export-Csv -LiteralPath $manifestPath -NoTypeInformation

$categoryCounts = @($manifest |
    Group-Object Category |
    Sort-Object Name |
    ForEach-Object {
        [PSCustomObject]@{
            Category = $_.Name
            Files    = $_.Count
        }
    })

$categoryCounts | Export-Csv -LiteralPath (Join-Path $OutputDir "category-counts.csv") -NoTypeInformation

$summaryLines = New-Object System.Collections.Generic.List[string]
$summaryLines.Add("# OpenClaw Docs Category Summary")
$summaryLines.Add("")
$summaryLines.Add(("Generated: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")))
$summaryLines.Add("")
$summaryLines.Add(("Total Markdown files: {0}" -f $manifest.Count))
$summaryLines.Add(("Top-level categories: {0}" -f $categoryCounts.Count))
$summaryLines.Add("")
$summaryLines.Add("## Categories")
$summaryLines.Add("")
foreach ($categoryRow in $categoryCounts) {
    $summaryLines.Add(("- {0}: {1}" -f $categoryRow.Category, $categoryRow.Files))
}

[IO.File]::WriteAllLines((Join-Path $OutputDir "category-summary.md"), $summaryLines)

if ($failures.Count -gt 0) {
    $failuresPath = Join-Path $OutputDir "failures.csv"
    $failures | Sort-Object Category, FileName | Export-Csv -LiteralPath $failuresPath -NoTypeInformation
    throw ("Downloaded {0} files, but {1} failed. See {2}" -f $manifest.Count, $failures.Count, $failuresPath)
}

Write-Host ("Downloaded and grouped {0} Markdown files into {1} across {2} categories." -f $manifest.Count, $OutputDir, $categoryCounts.Count)


