# Installa solo per l'utente corrente; NON richiede privilegi di amministratore.
$ErrorActionPreference = 'Stop'
$HostName = 'org.rtx_companion.dlss5swapper'
$AddonId = 'rtx-video-companion@example.org'
$Dest = Join-Path $env:LOCALAPPDATA 'RTXVideoCompanionBridge'

# Prefer Python launcher, then Python 3 on PATH.
$PyLauncher = Get-Command py -ErrorAction SilentlyContinue
$PythonCmd = ''
if ($PyLauncher) {
    & py -3 -c 'import sys; assert sys.version_info >= (3, 8)' 2>$null
    if ($LASTEXITCODE -eq 0) { $PythonCmd = 'py -3' }
}
if (-not $PythonCmd) {
    $Python = Get-Command python -ErrorAction SilentlyContinue
    if ($Python) {
        & python -c 'import sys; assert sys.version_info >= (3, 8)' 2>$null
        if ($LASTEXITCODE -eq 0) { $PythonCmd = 'python' }
    }
}
if (-not $PythonCmd) { throw 'Serve Python 3.8+ installato (python.org, py launcher o python nel PATH).' }
New-Item -Path $Dest -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $PSScriptRoot 'host.py') (Join-Path $Dest 'host.py') -Force
$ManualPath = Join-Path $PSScriptRoot 'swapper_path.txt'
if (Test-Path $ManualPath) {
    Copy-Item $ManualPath (Join-Path $Dest 'swapper_path.txt') -Force
}
$Runner = Join-Path $Dest 'run_host.bat'
$Script = "@echo off`r`ncd /d `"%~dp0`"`r`n$PythonCmd -u `"%~dp0host.py`"`r`n"
[System.IO.File]::WriteAllText($Runner, $Script, [System.Text.Encoding]::ASCII)
$ManifestPath = Join-Path $Dest ($HostName + '.json')
$Manifest = @{
    name = $HostName
    description = 'Local user-initiated launcher for DLSS5-Swapper'
    path = $Runner
    type = 'stdio'
    allowed_extensions = @($AddonId)
} | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($ManifestPath, $Manifest, (New-Object System.Text.UTF8Encoding($false)))
$Key = "HKCU:\Software\Mozilla\NativeMessagingHosts\$HostName"
New-Item -Path $Key -Force | Out-Null
Set-Item -Path $Key -Value $ManifestPath
Write-Host "Bridge installato in $Dest" -ForegroundColor Green
Write-Host 'Riavvia Firefox e premi Verifica collegamento nell estensione.'
Write-Host 'ATTENZIONE: questo apre Swapper; NON attiva DLSS 5 nei video YouTube.'
