# Contributing

SnapEats is developed and tested as two local services: a Spring Boot backend and a React/Vite frontend.

## Local setup

Backend:

```powershell
cd foodhub-backend
.\start-dev.ps1
```

Frontend, in a second terminal:

```powershell
cd frontend
.\start-dev.ps1
```

The frontend runs at `http://localhost:3000/` and proxies `/api` to `http://localhost:8081/api`.

## Checks before a change

```powershell
cd foodhub-backend
mvn test
```

```powershell
cd frontend
npm.cmd run build
```

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```

## Local data and secrets

- Do not commit `.env` files, API keys, SMTP passwords, SMS tokens, or personal data.
- Backend H2 data is stored under `foodhub-backend/data/`.
- Generated build output and runtime logs are ignored by git.
