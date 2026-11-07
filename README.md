# SnapEats

SnapEats is a local food-ordering application with a Spring Boot API and a React/Vite frontend.

## Requirements

- Java 17 or newer
- Maven 3.6 or newer
- Node.js 22 or newer

## Run locally

Start the backend in one terminal:

```powershell
cd foodhub-backend
.\start-dev.ps1
```

Start the frontend in a second terminal:

```powershell
cd frontend
.\start-dev.ps1
```

Open `http://localhost:3000/`.

The frontend proxies `/api` requests to the backend at `http://localhost:8081`.

## Useful local URLs

- Frontend: `http://localhost:3000/`
- API: `http://localhost:8081/api`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- Readiness: `http://localhost:8081/actuator/health/readiness`
- H2 console: `http://localhost:8081/h2-console`

## Build and test

Frontend:

```powershell
cd frontend
npm.cmd ci
npm.cmd run build
```

Backend:

```powershell
cd foodhub-backend
mvn test
```

Smoke test after starting both services:

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```

The backend uses a local H2 database under `foodhub-backend/data/`. This directory is local runtime state and is ignored by git.
