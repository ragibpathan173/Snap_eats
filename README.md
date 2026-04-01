# SnapEats

SnapEats is a Swiggy-inspired food ordering web application with a separate Spring Boot backend and static HTML/CSS/JavaScript frontend.

It includes restaurant discovery, OTP-first login/signup (email or phone), cart and checkout, addresses, offers/coupons, subscription perks, and a full account experience.

## Core Features

- OTP authentication for both login and signup
- Email OTP and phone OTP delivery support (with dev fallback mode)
- Restaurant listing, category filtering, and search
- Menu browsing with cart-aware quantity controls
- Cart checkout with address + payment selection
- Coupon support in cart and offers module
- Welcome coupon logic for new users
- Restaurant offers and global offers
- Subscription perks (e.g., free delivery rules)
- Account modules:
  - Orders
  - SnapEatPro
  - Favorites
  - Payments
  - Addresses
  - Settings
- Corporate modal/page sections with image-free visual fallbacks (no broken image placeholders)

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA (Hibernate)
- H2 database (dev)
- Flyway migrations
- Maven
- Vanilla HTML, CSS, JavaScript

## Project Structure

```text
Snap_eats/
|-- README.md
|-- frontend/
|   |-- Dockerfile
|   |-- index.html
|   |-- snap_eats.html
|   |-- snap_eats.css
|   |-- snap_eats.js
|   `-- images/
`-- foodhub-backend/
    |-- pom.xml
    `-- src/main/
        |-- java/com/foodhub/
        `-- resources/
            |-- application.properties
            `-- db/migration/
```

## Run With Docker

Docker is the easiest way to run the separated frontend and backend together.

```bash
docker compose up --build
```

Open:

- `http://localhost:8080/`
- `http://localhost:8081/swagger-ui.html`

If either port is already in use, pick different host ports:

```bash
FRONTEND_PORT=18080 BACKEND_PORT=18081 docker compose up --build
```

Useful commands:

```bash
docker compose down
docker compose down -v
```

Notes:

- The frontend is served from its own container and proxies `/api` requests to the backend container.
- H2 data is persisted in the named Docker volume `snap_eats_data`.
- `docker compose down -v` removes the persisted dev database volume.

## Run Natively

### Backend

Prerequisites:

- Java 17+
- Maven 3.6+

```bash
cd foodhub-backend
mvn clean spring-boot:run
```

### Frontend

Start the native frontend dev server in a second terminal:

```powershell
cd frontend
.\start-dev.ps1
```

This serves the app at `http://localhost:3000/`.

The frontend auto-targets `http://localhost:8081/api` in this native flow, while still keeping `/api` for Docker on `http://localhost:8080/`.

Smoke test for native mode:

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```

## OTP Delivery Configuration

You can run in dev mode (returns OTP in API response) or configure real delivery.

### Dev mode

```properties
security.otp.dev-return=true
otp.delivery.email.enabled=false
otp.delivery.sms.enabled=false
```

### Real email delivery (SMTP)

```properties
security.otp.dev-return=false
otp.delivery.email.enabled=true
otp.delivery.email.from=your-email@gmail.com
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Real SMS delivery

```properties
otp.delivery.sms.enabled=true
otp.delivery.sms.webhook-url=https://your-sms-provider-webhook
otp.delivery.sms.auth-token=your-token
```

## API Snapshot

Common APIs used by frontend:

- `GET /api/categories/active`
- `GET /api/restaurants/active`
- `GET /api/restaurants/search?query=...`
- `GET /api/menu-items/restaurant-code/{restaurantCode}`
- `POST /api/users/login/request-otp`
- `POST /api/users/login/verify-otp`
- `POST /api/users/signup/request-otp`
- `POST /api/users/signup/verify-otp`
- `GET /api/users/me`
- `POST /api/orders/checkout`
- `GET /api/orders/mine`
- `GET /api/addresses`
- `POST /api/addresses`

## Testing

```bash
cd foodhub-backend
mvn test
```

## Notes

- Current location and some UI preferences are stored in browser local storage.
- Some account sections include live data while a few are UI-ready for further backend expansion.
- The project is actively evolving with UI/UX improvements and reliability fixes.
