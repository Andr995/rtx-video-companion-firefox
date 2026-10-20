$ErrorActionPreference = 'Stop'
$HostName = 'org.rtx_companion.dlss5swapper'
$Key = "HKCU:\Software\Mozilla\NativeMessagingHosts\$HostName"
if (Test-Path $Key) { Remove-Item $Key -Recurse -Force }
$Dest = Join-Path $env:LOCALAPPDATA 'RTXVideoCompanionBridge'
if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
Write-Host 'Bridge locale rimosso. Nessuna modifica a DLSS5-Swapper.'
