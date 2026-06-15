# API Testing Guide

This guide uses the local backend at `http://localhost:8081`.

If the frontend dev server or Docker frontend is running, the same API is also available through the frontend proxy at `/api`.

## Health and Catalog Smoke Checks

```bash
curl http://localhost:8081/actuator/health/readiness
curl http://localhost:8081/api/categories/active
curl http://localhost:8081/api/restaurants/active
curl "http://localhost:8081/api/restaurants/search?query=pizza"
```

## Authentication Flow

Request an OTP:

```bash
curl -X POST http://localhost:8081/api/users/auth/otp/request \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"customer@example.com\"}"
```

In development, the response includes `devOtp`.

Verify the OTP:

```bash
curl -X POST http://localhost:8081/api/users/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"customer@example.com\",\"otp\":\"123456\",\"name\":\"Customer Name\"}"
```

The response includes `token` and `user`. Protected endpoints need:

```http
Authorization: Bearer <token>
```

Password login is also available for seeded/demo users:

```bash
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"guest@snap-eats.local\",\"password\":\"guest-pass\"}"
```

## PowerShell Auth Example

```powershell
$otpResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8081/api/users/auth/otp/request" `
  -ContentType "application/json" `
  -Body '{"identifier":"customer@example.com"}'

$session = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8081/api/users/auth/otp/verify" `
  -ContentType "application/json" `
  -Body (@{
    identifier = "customer@example.com"
    otp = $otpResponse.devOtp
    name = "Customer Name"
  } | ConvertTo-Json)

$headers = @{ Authorization = "Bearer $($session.token)" }
Invoke-RestMethod -Headers $headers -Uri "http://localhost:8081/api/users/me"
```

## Addresses

Create an address:

```bash
curl -X POST http://localhost:8081/api/addresses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{
    \"label\":\"Home\",
    \"recipientName\":\"Customer Name\",
    \"phoneNumber\":\"9876543210\",
    \"addressLine\":\"221B Residency Road\",
    \"landmark\":\"Near Cubbon Park\",
    \"city\":\"Bangalore\",
    \"state\":\"Karnataka\",
    \"pincode\":\"560001\",
    \"defaultAddress\":true
  }"
```

Other useful address calls:

```http
GET    /api/addresses
GET    /api/addresses/default
PUT    /api/addresses/{id}
PATCH  /api/addresses/{id}/default
DELETE /api/addresses/{id}
```

## Restaurant and Menu Browsing

```bash
curl http://localhost:8081/api/restaurants/active
curl "http://localhost:8081/api/restaurants/search?query=biryani"
curl http://localhost:8081/api/menu-items/restaurant-code/REST001
curl "http://localhost:8081/api/menu-items/search?query=paneer"
```

Restaurant routes:

```http
GET /api/restaurants
GET /api/restaurants/active
GET /api/restaurants/{id}
GET /api/restaurants/restaurantId/{restaurantId}
GET /api/restaurants/category/{category}
GET /api/restaurants/verified
GET /api/restaurants/rating/{minRating}
GET /api/restaurants/search?query=...
GET /api/restaurants/top-rated
```

Menu browsing routes:

```http
GET /api/menu-items
GET /api/menu-items/{id}
GET /api/menu-items/item/{itemId}
GET /api/menu-items/restaurant/{restaurantId}
GET /api/menu-items/restaurant-code/{restaurantCode}
GET /api/menu-items/restaurant/{restaurantId}/category/{category}
GET /api/menu-items/restaurant/{restaurantId}/categories
GET /api/menu-items/restaurant/{restaurantId}/top-rated
GET /api/menu-items/restaurant/{restaurantId}/popular
GET /api/menu-items/restaurant/{restaurantId}/featured
GET /api/menu-items/restaurant/{restaurantId}/best-sellers
GET /api/menu-items/restaurant/{restaurantId}/vegetarian
GET /api/menu-items/restaurant/{restaurantId}/vegan
GET /api/menu-items/restaurant/{restaurantId}/gluten-free
GET /api/menu-items/search?query=...
GET /api/menu-items/restaurant/{restaurantId}/filter
```

## Checkout

Checkout requires a bearer token and a saved default address, unless `addressId` is provided.

```bash
curl -X POST http://localhost:8081/api/orders/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantCode\":\"REST001\",
    \"paymentMethod\":\"CASH\",
    \"couponCode\":\"WELCOME50\",
    \"items\":[
      {\"itemId\":\"ITEM001\",\"name\":\"Margherita Pizza\",\"quantity\":2,\"price\":199.0}
    ]
  }"
```

Useful order calls:

```http
GET   /api/orders/mine
GET   /api/orders/mine/{id}
PATCH /api/orders/mine/{id}/cancel
GET   /api/orders/{id}/items
```

Admin/legacy order calls also exist:

```http
GET    /api/orders
GET    /api/orders/{id}
GET    /api/orders/order-number/{orderNumber}
GET    /api/orders/user/{userId}
GET    /api/orders/restaurant/{restaurantId}
GET    /api/orders/status/{status}
PUT    /api/orders/{id}
PATCH  /api/orders/{id}/status?status=DELIVERED
DELETE /api/orders/{id}
```

## Subscriptions

```bash
curl http://localhost:8081/api/subscriptions/plans
curl -H "Authorization: Bearer <token>" http://localhost:8081/api/subscriptions/me
```

Activate:

```bash
curl -X POST http://localhost:8081/api/subscriptions/me/activate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"planCode\":\"PLUS\",\"autoRenew\":true}"
```

Cancel:

```bash
curl -X PATCH http://localhost:8081/api/subscriptions/me/cancel \
  -H "Authorization: Bearer <token>"
```

## Saved Payment Methods

Card:

```bash
curl -X POST http://localhost:8081/api/payments/methods \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{
    \"methodType\":\"CARD\",
    \"cardHolderName\":\"Customer Name\",
    \"cardNumber\":\"4111111111111111\",
    \"expiryMonth\":\"12\",
    \"expiryYear\":\"2030\",
    \"defaultMethod\":true
  }"
```

UPI:

```bash
curl -X POST http://localhost:8081/api/payments/methods \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"methodType\":\"UPI\",\"upiId\":\"customer@upi\",\"defaultMethod\":true}"
```

Other payment calls:

```http
GET    /api/payments/methods
PUT    /api/payments/methods/{id}
PATCH  /api/payments/methods/{id}/default
DELETE /api/payments/methods/{id}
```

## Automated Checks

Backend integration tests:

```bash
cd foodhub-backend
mvn test
```

Frontend/backend smoke test from the repo root:

```powershell
.\scripts\frontend_smoke_test.ps1 -FrontendBaseUrl http://localhost:3000 -BackendBaseUrl http://localhost:8081
```
