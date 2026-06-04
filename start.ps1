# Start Skill Forge API + UI in one terminal
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

$py = Join-Path $Root "Scripts\python.exe"
if (-not (Test-Path $py)) {
    $py = Join-Path $Root ".venv\Scripts\python.exe"
}
if (-not (Test-Path $py)) {
    $py = "python"
}

& $py (Join-Path $Root "scripts\run_all.py") @args
