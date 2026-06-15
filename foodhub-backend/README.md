# SnapEats Backend

Spring Boot backend for the SnapEats food ordering app. The backend exposes REST APIs for restaurant discovery, menu browsing, OTP/password authentication, checkout, orders, addresses, subscriptions, favorites, and saved payment methods.

The frontend lives in the repo-level `../frontend` folder and is served separately.

## Tech Stack

- Java 17
- Spring Boot 3.2
- Spring Web, Security, Data JPA, Validation, Actuator, Mail
- Flyway migrations
- H2 for local development
- PostgreSQL/MySQL runtime drivers for deployment targets
- Maven
- Swagger/OpenAPI via springdoc

## Quick Start

Prerequisites:

- Java 17+
- Maven 3.6+

Run the backend:

```bash
cd foodhub-backend
mvn clean spring-boot:run
```

Open:

- API base: `http://localhost:8081/api`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- H2 console: `http://localhost:8081/h2-console`
- Readiness: `http://localhost:8081/actuator/health/readiness`
- Liveness: `http://localhost:8081/actuator/health/liveness`

H2 login:

```text
JDBC URL: jdbc:h2:file:./data/foodhub
Username: sa
Password: leave blank
```

## Local Frontend

From a second terminal in the repo root:

```powershell
cd frontend
.\start-dev.ps1
```

The frontend runs at `http://localhost:3000/` and proxies `/api` to `http://localhost:8081/api`.

## Configuration

Important properties are environment-aware in `src/main/resources/application.properties`.

| Purpose | Property | Environment variable | Default |
| --- | --- | --- | --- |
| HTTP port | `server.port` | `SERVER_PORT` or `PORT` | `8081` |
| Database URL | `spring.datasource.url` | `SPRING_DATASOURCE_URL` | local H2 file |
| JWT secret | `security.jwt.secret` | `SECURITY_JWT_SECRET` | dev secret |
| JWT lifetime | `security.jwt.expiration-ms` | `SECURITY_JWT_EXPIRATION_MS` | `86400000` |
| Return OTP in responses | `security.otp.dev-return` | `SECURITY_OTP_DEV_RETURN` | `true` |
| Email OTP delivery | `otp.delivery.email.enabled` | `OTP_DELIVERY_EMAIL_ENABLED` | `false` |
| SMS OTP delivery | `otp.delivery.sms.enabled` | `OTP_DELIVERY_SMS_ENABLED` | `false` |
| Optional owner-admin email | `demo.owner-admin.email` | `DEMO_OWNER_ADMIN_EMAIL` | blank |
| Optional owner-admin phone | `demo.owner-admin.phone` | `DEMO_OWNER_ADMIN_PHONE` | blank |

Do not use the development defaults for a real public deployment. Set a strong `SECURITY_JWT_SECRET`, disable `SECURITY_OTP_DEV_RETURN`, and configure real email or SMS delivery before accepting real users.

## Authentication

Public auth endpoints:

```http
POST /api/users/auth/otp/request
POST /api/users/auth/otp/verify
POST /api/users/register
POST /api/users/login
POST /api/users/forgot-password/request-otp
POST /api/users/forgot-password/reset
```

OTP request:

```json
{
  "identifier": "customer@example.com"
}
```

In dev mode, the response includes `devOtp`. Verify it with:

```json
{
  "identifier": "customer@example.com",
  "otp": "123456",
  "name": "Customer Name"
}
```

Successful auth returns:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "role": "USER"
  }
}
```

For protected routes, send:

```http
Authorization: Bearer <token>
```

The JWT filter injects `X-User-Id` from the token when the request does not already provide it.

## Core Endpoints

Public catalog endpoints:

```http
GET /api/categories
GET /api/categories/active
GET /api/restaurants/active
GET /api/restaurants/search?query=pizza
GET /api/restaurants/top-rated
GET /api/menu-items/restaurant-code/{restaurantCode}
GET /api/menu-items/search?query=pizza
```

Customer/account endpoints require a bearer token:

```http
GET    /api/users/me
PUT    /api/users/me
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
PATCH  /api/addresses/{id}/default
DELETE /api/addresses/{id}
GET    /api/orders/mine
POST   /api/orders/checkout
PATCH  /api/orders/mine/{id}/cancel
GET    /api/subscriptions/plans
GET    /api/subscriptions/me
POST   /api/subscriptions/me/activate
PATCH  /api/subscriptions/me/cancel
GET    /api/payments/methods
POST   /api/payments/methods
```

Admin menu write endpoints require an admin bearer token:

```http
POST   /api/menu-items
PUT    /api/menu-items/{id}
PATCH  /api/menu-items/{id}/availability
PATCH  /api/menu-items/{id}/stock
DELETE /api/menu-items/{id}
```

## Testing

Run integration tests:

```bash
mvn test
```

Compile without running tests:

```bash
mvn -DskipTests compile
```

From the repo root, after starting backend and frontend:

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```

## Data and Migrations

- Local H2 files are created under `foodhub-backend/data/` and are ignored by git.
- Flyway migrations live under `src/main/resources/db/migration`.
- PostgreSQL-specific migrations live under `src/main/resources/db/migration-postgresql`.
- Seed catalog data lives under `src/main/resources/data`.

## Docker

From the repo root:

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:8080/`
- Swagger: `http://localhost:8081/swagger-ui.html`

Use custom ports when needed:

```bash
FRONTEND_PORT=18080 BACKEND_PORT=18081 docker compose up --build
```
