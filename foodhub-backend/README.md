# SnapEats Backend

Spring Boot backend for restaurant discovery, menus, OTP authentication, checkout, orders, addresses, subscriptions, favorites, and saved payment methods.

## Requirements

- Java 17 or newer
- Maven 3.6 or newer

## Run locally

```powershell
cd foodhub-backend
.\start-dev.ps1
```

Useful URLs:

- API: `http://localhost:8081/api`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- Readiness: `http://localhost:8081/actuator/health/readiness`
- H2 console: `http://localhost:8081/h2-console`

The local database uses H2 at `jdbc:h2:file:./data/foodhub`, username `sa`, with a blank password.

## Tests

```powershell
mvn test
```

## Configuration

Development defaults are stored in `src/main/resources/application.properties`. OTP responses include a development OTP, email/SMS delivery is disabled, and the local H2 database is used.

See [QUICK_START.md](QUICK_START.md), [API_TESTING.md](API_TESTING.md), and [MENU_FEATURE.md](MENU_FEATURE.md) for local API examples.
