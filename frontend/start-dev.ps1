param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required to run the frontend dev server."
}

Write-Host "Starting SnapEats frontend dev server on http://localhost:$Port/"
Write-Host "One app link: http://localhost:$Port/"
Write-Host "Proxying /api to http://localhost:8081/api"
Write-Host "Tip: start the backend separately with .\\foodhub-backend\\start-dev.ps1"
Write-Host ""

node (Join-Path $PSScriptRoot "dev-server.mjs") --port $Port
