$Vault = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Src = "$Vault/ATLAS/skills"
$Dst = "$Vault/.pi/skills"
Write-Host "Sync $Src -> $Dst"
python "$Vault/ATLAS/scripts/sync-skills.py"
Write-Host "Listo. En Pi haz /reload"
