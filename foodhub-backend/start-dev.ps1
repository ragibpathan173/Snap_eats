param(
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"

Write-Host "Preparing SnapEats backend on port $Port..."

$listeners = cmd /c "netstat -ano | findstr :$Port | findstr LISTENING"
if ($listeners) {
    $pids = $listeners | ForEach-Object {
        ($_ -split "\s+")[-1]
    } | Where-Object { $_ -match "^\d+$" } | Select-Object -Unique

    foreach ($pid in $pids) {
        Write-Host "Stopping process on port $Port (PID $pid)..."
        cmd /c "taskkill /PID $pid /F" | Out-Null
    }
}

Write-Host "Starting Spring Boot..."
Write-Host ""
Write-Host "URLS:"
Write-Host "  API:      http://localhost:$Port/api/categories/active"
Write-Host "  Swagger:  http://localhost:$Port/swagger-ui.html"
Write-Host "  Health:   http://localhost:$Port/actuator/health/readiness"
Write-Host "  Frontend: Run ../frontend/start-dev.ps1 or use docker compose up --build"
Write-Host ""

Write-Host "Cleaning old build output so stale frontend assets are not served from the backend..."
Write-Host ""

mvn clean spring-boot:run "-Dspring-boot.run.arguments=--server.port=$Port"
