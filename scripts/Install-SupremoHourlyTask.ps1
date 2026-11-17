[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$ProjectRoot,
  [string]$TaskName = 'Supremo Lider - Evolucion Horaria'
)
$ErrorActionPreference = 'Stop'
$project = (Resolve-Path -LiteralPath $ProjectRoot).Path
$scriptPath = Join-Path $project 'scripts/Start-SupremoEvolution.ps1'
if (-not (Test-Path $scriptPath)) { throw "No encuentro $scriptPath" }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Instala Git antes de programar la tarea.' }
if (-not (Get-Command codex -ErrorAction SilentlyContinue)) { throw 'Instala e inicia sesión en Codex CLI antes de programar la tarea.' }
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) { throw "Ya existe '$TaskName'. Usa otro nombre o elimina primero la tarea anterior." }
$ps = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $ps) { throw 'Se requiere PowerShell 7 (pwsh.exe).' }
$python = (Get-Command python -CommandType Application -ErrorAction Stop).Source
& $python (Join-Path $project 'scripts/evolve.py') --root $project --dry-run
if ($LASTEXITCODE -ne 0) { throw 'La simulación falló. Corrige la causa antes de programar.' }
& codex login status
if ($LASTEXITCODE -ne 0) { throw 'Inicia sesión en Codex CLI con esta cuenta de Windows.' }
$argument = '-NoProfile -NonInteractive -File "' + $scriptPath + '" -ProjectRoot "' + $project + '"'
$action = New-ScheduledTaskAction -Execute $ps -Argument $argument -WorkingDirectory $project
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 35) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Prepara una candidata horaria de Líder Supremo en un Git worktree aislado; no fusiona ni publica.' | Out-Null
Write-Output "Tarea '$TaskName' instalada. Inicia en 5 minutos y repite cada hora durante 10 años mientras el equipo esté disponible."
Write-Output 'El ciclo requiere sesión de usuario activa, Codex CLI autenticado y repositorio limpio. La primera candidata pendiente pausa los ciclos posteriores.'
