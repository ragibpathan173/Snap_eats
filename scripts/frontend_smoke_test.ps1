param(
    [string]$BaseUrl = "http://localhost:8081"
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

Write-Host "Running SnapEats smoke checks against $BaseUrl ..."

$health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/actuator/health"
Assert-Condition ($health.status -eq "UP") "Health endpoint is not UP"

$homeHtml = Invoke-WebRequest -Method Get -Uri "$BaseUrl/snap_eats.html"
Assert-Condition ($homeHtml.StatusCode -eq 200) "snap_eats.html did not return 200"
Assert-Condition ($homeHtml.Content -match "SnapEats") "snap_eats.html content mismatch"

$restaurants = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/restaurants/active"
Assert-Condition ($restaurants.Count -gt 0) "No active restaurants returned"

$categories = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/categories/active"
Assert-Condition ($categories.Count -gt 0) "No active categories returned"

Write-Host "Smoke checks passed."

