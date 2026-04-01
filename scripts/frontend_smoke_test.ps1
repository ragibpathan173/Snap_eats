param(
    [string]$FrontendBaseUrl = "http://localhost:8080",
    [string]$BackendBaseUrl = "http://localhost:8081"
)

$ErrorActionPreference = "Stop"

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if (-not $Condition) {
        throw $Message
    }
}

Write-Host "Running SnapEats smoke checks against frontend $FrontendBaseUrl and backend $BackendBaseUrl ..."

$health = Invoke-RestMethod -Method Get -Uri "$BackendBaseUrl/actuator/health/readiness"
Assert-Condition ($health.status -eq "UP") "Health endpoint is not UP"

$homeHtml = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$FrontendBaseUrl/"
Assert-Condition ($homeHtml.StatusCode -eq 200) "Frontend root did not return 200"
Assert-Condition ($homeHtml.Content -match "SnapEats") "Frontend content mismatch"

$restaurants = Invoke-RestMethod -Method Get -Uri "$FrontendBaseUrl/api/restaurants/active"
Assert-Condition ($restaurants.Count -gt 0) "No active restaurants returned"

$categories = Invoke-RestMethod -Method Get -Uri "$FrontendBaseUrl/api/categories/active"
Assert-Condition ($categories.Count -gt 0) "No active categories returned"

Write-Host "Smoke checks passed."
