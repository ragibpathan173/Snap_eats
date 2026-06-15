# Contributing

This repo contains a static frontend and a Spring Boot backend. Keep changes scoped, run the relevant checks, and avoid committing generated local state.

## Local Setup

Run both services with Docker:

```bash
docker compose up --build
```

Or run them natively:

```powershell
cd foodhub-backend
.\start-dev.ps1
```

```powershell
cd frontend
.\start-dev.ps1
```

The native frontend runs at `http://localhost:3000/` and proxies `/api` to the backend on `http://localhost:8081/api`.

## Checks Before Opening a PR

Backend:

```bash
cd foodhub-backend
mvn test
```

Frontend/backend smoke test:

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```

Docker sanity check:

```bash
docker compose up --build
```

## Environment and Secrets

- Start from `.env.example` for local environment values.
- Do not commit real `.env` files, API keys, SMTP passwords, SMS tokens, database URLs, or personal contact details.
- For public deployments, set a strong `SECURITY_JWT_SECRET`, set `SECURITY_OTP_DEV_RETURN=false`, and configure real OTP delivery.
- Leave `DEMO_OWNER_ADMIN_EMAIL` and `DEMO_OWNER_ADMIN_PHONE` blank unless a deployment explicitly needs owner-admin bootstrap behavior.

## Generated Files

These should stay out of git:

- `foodhub-backend/target/`
- `foodhub-backend/data/`
- `.run-logs/`
- local `.env` files

## Documentation

When endpoint behavior changes, update the matching backend docs:

- `foodhub-backend/README.md`
- `foodhub-backend/API_TESTING.md`
- `foodhub-backend/MENU_FEATURE.md`

Update the root `README.md` when local setup, Docker, Render, or project structure changes.
