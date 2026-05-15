# Lance uvicorn depuis le dossier backend (utilise par start-local.ps1).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$py = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) {
    Write-Host "Python venv introuvable : $py" -ForegroundColor Red
    Write-Host "Executez d'abord start-local.ps1 a la racine du projet." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}
Write-Host "API FastAPI : http://127.0.0.1:8000/docs" -ForegroundColor Green
& $py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
