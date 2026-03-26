# SnapEats

SnapEats is a food ordering web app built with a Spring Boot backend and a static HTML/CSS/JavaScript frontend. It includes restaurant discovery, menu browsing, cart and checkout flows, saved addresses, order history, and a richer Swiggy-inspired account experience.

## Highlights

- Restaurant browsing with category filters and search
- Menu item browsing with images, badges, and cart-aware quantity controls
- Cart flow with checkout, delivery address selection, and order placement
- Saved address book with default address support
- Header location picker with recent places, manual entry, and current location support
- Full-page account dashboard with:
  - Orders
  - SnapSubscription
  - Favorites
  - Payments
  - Addresses
  - Settings

## Project Structure

```text
Snap_eats/
├── README.md
├── foodhub-backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/foodhub/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── model/
│       │   └── repository/
│       └── resources/
│           ├── application.properties
│           ├── data/
│           └── static/
│               ├── snap_eats.html
│               ├── snap_eats.css
│               └── snap_eats.js
└── LICENSE
```

## Main UI Features

### Header
- Icon-based header navigation
- Expandable search bar
- Location picker from the `Other` chip
- Profile and cart access from the top bar

### Menu and Cart
- Restaurant menu modal with category chips
- `Add to cart` changes into quantity stepper when an item is already in cart
- Cart count syncs with menu item controls

### Address and Orders
- Save multiple addresses
- Choose a default delivery address
- View order history
- Cancel and reorder eligible orders

### Account Page
- Full-page account layout instead of a small popup
- Sidebar navigation for account sections
- Account hero section with user details

## Run Locally

### Prerequisites

- Java 17+
- Maven 3.6+

### Start the app

```bash
cd foodhub-backend
mvn spring-boot:run
```

Open:

```text
http://localhost:8080/
```

Direct page:

```text
http://localhost:8080/snap_eats.html
```

## Build and Test

```bash
cd foodhub-backend
mvn test
```

## API Overview

Common endpoints used by the frontend:

- `GET /api/categories/active`
- `GET /api/restaurants/active`
- `GET /api/restaurants/category/{category}`
- `GET /api/restaurants/search?query=...`
- `GET /api/menu-items/restaurant-code/{restaurantCode}`
- `POST /api/orders/checkout`
- `GET /api/orders/mine`
- `PATCH /api/orders/mine/{id}/cancel`
- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/{id}`
- `PATCH /api/addresses/{id}/default`
- `DELETE /api/addresses/{id}`
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`

## Recent UI Updates

- Improved header to a more app-like layout
- Added expandable header search interaction
- Added location selection modal
- Added cart quantity stepper on menu cards
- Added full-page profile/account experience
- Added account sidebar sections for orders, subscription, favorites, payments, addresses, and settings

## Notes

- Current location uses browser geolocation
- Location selection is stored in local storage on the frontend
- Some account sections are UI-ready placeholders for future backend expansion

## Backend Docs

More backend-specific details are available in:

- [foodhub-backend/README.md](/c:/Users/ragib/Snap_eats/foodhub-backend/README.md)
- [foodhub-backend/MENU_FEATURE.md](/c:/Users/ragib/Snap_eats/foodhub-backend/MENU_FEATURE.md)
