# Backend Quick Start

Use this guide when you only need the backend running locally.

## Prerequisites

- Java 17+
- Maven 3.6+

## Start the Backend

```bash
cd foodhub-backend
mvn clean spring-boot:run
```

Or on Windows:

```powershell
cd foodhub-backend
.\start-dev.ps1
```

## Verify It Works

Open these URLs:

- `http://localhost:8081/actuator/health/readiness`
- `http://localhost:8081/swagger-ui.html`
- `http://localhost:8081/api/categories/active`
- `http://localhost:8081/api/restaurants/active`

The local database is H2:

```text
URL: jdbc:h2:file:./data/foodhub
Username: sa
Password: leave blank
```

## Try Dev OTP Login

Request an OTP:

```bash
curl -X POST http://localhost:8081/api/users/auth/otp/request \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"customer@example.com\"}"
```

When `security.otp.dev-return=true`, copy `devOtp` from the response and verify:

```bash
curl -X POST http://localhost:8081/api/users/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"customer@example.com\",\"otp\":\"123456\",\"name\":\"Customer Name\"}"
```

The verify response contains a JWT. Use it as:

```http
Authorization: Bearer <token>
```

## Start the Frontend Too

From the repo root, in another terminal:

```powershell
cd frontend
.\start-dev.ps1
```

Open `http://localhost:3000/`.

## Common Fixes

Port `8081` is busy:

```powershell
.\start-dev.ps1 -Port 18081
```

Local database looks stale:

```powershell
Remove-Item -Recurse -Force .\data
```

Only do this for local development data.

## Next Steps

- Read [README.md](README.md) for backend architecture and configuration.
- Read [API_TESTING.md](API_TESTING.md) for request examples.
- Read [MENU_FEATURE.md](MENU_FEATURE.md) for menu endpoint details.
