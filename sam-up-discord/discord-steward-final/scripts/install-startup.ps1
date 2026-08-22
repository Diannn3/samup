param(
  [string]$ProjectPath = (Resolve-Path "$PSScriptRoot\..").Path
)

$taskName = "Discord Steward"
$powerShell = (Get-Command powershell.exe).Source
$startScript = Join-Path $ProjectPath "scripts\start-steward.ps1"
$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`" -ProjectPath `"$ProjectPath`""
$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments -WorkingDirectory $ProjectPath
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Local Discord Steward daemon and dashboard" -Force
Write-Host "Installed startup task: $taskName"
