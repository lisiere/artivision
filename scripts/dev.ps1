# Prepare backend + frontend puis lance API + Next dans le meme terminal (concurrently).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Racine : $root" -ForegroundColor Cyan

# --- Backend ---
Set-Location (Join-Path $root "backend")
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creation du venv Python..." -ForegroundColor Yellow
    python -m venv .venv
}
Write-Host "Dependances Python (pip)..." -ForegroundColor DarkGray
& ".\.venv\Scripts\python.exe" -m pip install -q --upgrade pip
& ".\.venv\Scripts\pip.exe" install -q -r requirements.txt
if (-not (Test-Path ".\.env") -and (Test-Path ".\.env.example")) {
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "backend/.env cree - renseignez GEMINI_API_KEY et HUGGINGFACE_API_KEY." -ForegroundColor Yellow
}

# --- Frontend ---
Set-Location (Join-Path $root "frontend")
if (-not (Test-Path ".\node_modules")) {
    Write-Host "npm install (frontend)..." -ForegroundColor Yellow
    npm install --no-fund --no-audit
}
if (-not (Test-Path ".\.env.local") -and (Test-Path ".\.env.example")) {
    Copy-Item ".\.env.example" ".\.env.local"
    Write-Host "frontend/.env.local cree - NEXT_PUBLIC_API_URL vide = proxy Next." -ForegroundColor Yellow
}

# --- Racine : concurrently ---
Set-Location $root
if (-not (Test-Path ".\node_modules\concurrently")) {
    Write-Host "npm install (racine, concurrently)..." -ForegroundColor Yellow
    npm install --no-fund --no-audit
}

$py = Join-Path $root "backend\.venv\Scripts\python.exe"
$apiCmd = "cd /d `"$root\backend`" && `"$py`" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
$webCmd = "cd /d `"$root\frontend`" && npm run dev"

Write-Host ""
Write-Host "  Vitrine : http://localhost:3000/" -ForegroundColor Green
Write-Host "  Outil   : http://localhost:3000/app" -ForegroundColor Green
Write-Host "  API     : http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "  (port 3001 si 3000 pris)" -ForegroundColor DarkGray
Write-Host "  Ctrl+C arrete les deux services." -ForegroundColor DarkGray
Write-Host ""

$conc = Join-Path $root "node_modules\.bin\concurrently.cmd"
if (-not (Test-Path $conc)) {
    $conc = "npx"
    & npx concurrently -n "api,web" -c "blue,magenta" $apiCmd $webCmd
} else {
    & $conc -n "api,web" -c "blue,magenta" $apiCmd $webCmd
}
