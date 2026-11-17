[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$ProjectRoot,
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$python = (Get-Command python -CommandType Application -ErrorAction Stop).Source
$runner = Join-Path $PSScriptRoot 'evolve.py'
$arguments = @($runner, '--root', $ProjectRoot)
if ($DryRun) { $arguments += '--dry-run' }
& $python @arguments
exit $LASTEXITCODE
