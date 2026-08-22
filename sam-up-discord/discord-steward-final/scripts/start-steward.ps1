param(
  [string]$ProjectPath = (Resolve-Path "$PSScriptRoot\..").Path
)

Set-Location -LiteralPath $ProjectPath
& npm.cmd run start
exit $LASTEXITCODE
