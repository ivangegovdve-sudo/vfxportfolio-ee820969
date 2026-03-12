param(
    [string]$SourceDir = (Join-Path (Get-Location) "artifacts\openclaw-docs-grouped"),
    [string]$OutputDir = (Join-Path (Get-Location) "artifacts\openclaw-docs-bundles"),
    [switch]$Clean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $SourceDir "manifest.csv"
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Manifest not found at $manifestPath"
}

if ($Clean -and (Test-Path -LiteralPath $OutputDir)) {
    Remove-Item -LiteralPath $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$rows = Import-Csv -LiteralPath $manifestPath
$categories = @($rows |
    Group-Object Category |
    Sort-Object Name)

foreach ($categoryGroup in $categories) {
    $category = $categoryGroup.Name
    $bundlePath = Join-Path $OutputDir ($category + ".md")
    $lines = New-Object System.Collections.Generic.List[string]

    $lines.Add("# $category")
    $lines.Add("")
    $lines.Add(('Source category: `{0}`' -f $category))
    $lines.Add("")
    $lines.Add("Files included: $($categoryGroup.Count)")
    $lines.Add("")
    $lines.Add("---")
    $lines.Add("")

    $sortedRows = @($categoryGroup.Group | Sort-Object RelativePath)
    foreach ($row in $sortedRows) {
        $sourceFile = Join-Path $SourceDir $row.SavedAs
        if (-not (Test-Path -LiteralPath $sourceFile)) {
            throw "Expected source file not found: $sourceFile"
        }

        $content = (Get-Content -LiteralPath $sourceFile -Raw).Trim()

        $lines.Add(('## File: `{0}`' -f $row.RelativePath))
        $lines.Add("")
        $lines.Add("Source URL: $($row.Url)")
        $lines.Add("")
        $lines.Add("---")
        $lines.Add("")

        if ($content.Length -gt 0) {
            foreach ($contentLine in ($content -split "`r?`n")) {
                $lines.Add($contentLine)
            }
            $lines.Add("")
        }

        $lines.Add("---")
        $lines.Add("")
    }

    [IO.File]::WriteAllLines($bundlePath, $lines)
    Write-Host ("Bundled {0} -> {1}" -f $category, $bundlePath)
}

Write-Host ("Created {0} bundled Markdown files in {1}" -f $categories.Count, $OutputDir)


