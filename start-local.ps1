# Demarre tout en local : depuis la racine, preferez `npm run dev` (un seul terminal).
# Alternative : double-clic sur start-local.cmd, ou : powershell -ExecutionPolicy Bypass -File .\start-local.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path $backend)) { throw "Dossier backend introuvable : $backend" }
if (-not (Test-Path $frontend)) { throw "Dossier frontend introuvable : $frontend" }

Write-Host "Racine projet : $root"

# --- Backend : venv + pip ---
Set-Location $backend
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creation du venv Python..."
    python -m venv .venv
}
Write-Host "Installation des dependances Python..."
& ".\.venv\Scripts\python.exe" -m pip install -q --upgrade pip
& ".\.venv\Scripts\pip.exe" install -q -r requirements.txt

if (-not (Test-Path ".\.env") -and (Test-Path ".\.env.example")) {
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "Fichier .env cree depuis .env.example - renseignez GEMINI_API_KEY et HUGGINGFACE_API_KEY dedans."
}

$backendLauncher = Join-Path $backend "dev-server.ps1"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendLauncher | Out-Null
Write-Host "Fenetre API ouverte (uvicorn)."

# --- Frontend : npm ---
Set-Location $frontend
if (-not (Test-Path ".\.env.local") -and (Test-Path ".\.env.example")) {
    Copy-Item ".\.env.example" ".\.env.local"
    Write-Host "Fichier .env.local cree - laissez NEXT_PUBLIC_API_URL vide pour le proxy Next -> API (recommande)."
}

Write-Host "npm install (peut prendre une minute)..."
npm install

$frontendLauncher = Join-Path $frontend "dev-server.ps1"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $frontendLauncher | Out-Null
Write-Host "Fenetre front ouverte (npm run dev)."
Write-Host ""
Write-Host "Ouvrez : http://localhost:3000  |  API : http://127.0.0.1:8000/docs"
Write-Host "Fermez les fenetres pour arreter les serveurs."
