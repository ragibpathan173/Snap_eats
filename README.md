# SnapEats

SnapEats is a Swiggy-inspired food ordering web application built with a Spring Boot backend and a static HTML/CSS/JavaScript frontend.

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
`-- foodhub-backend/
    |-- pom.xml
    |-- src/main/java/com/foodhub/
    |   |-- config/
    |   |-- controller/
    |   |-- model/
    |   |-- repository/
    |   `-- service/
    `-- src/main/resources/
        |-- application.properties
        `-- static/
            |-- index.html
            |-- snap_eats.html
            |-- snap_eats.css
            `-- snap_eats.js
```

## Run Locally

### Prerequisites

- Java 17+
- Maven 3.6+

### Start backend + frontend

```bash
cd foodhub-backend
mvn spring-boot:run
```

Open:

- `http://localhost:8081/`

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
