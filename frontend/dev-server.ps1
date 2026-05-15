# Lance npm run dev depuis le dossier frontend.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "Front Next.js : http://localhost:3000" -ForegroundColor Green
npm run dev
