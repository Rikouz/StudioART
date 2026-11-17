[CmdletBinding()]
param([string]$TaskName = 'Supremo Lider - Evolucion Horaria')
$ErrorActionPreference = 'Stop'
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $task) { Write-Output "No existe la tarea '$TaskName'."; exit 0 }
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Output "Tarea '$TaskName' eliminada. No se borran ramas, informes ni proyectos."