# 🧪 API Testing Guide

Complete guide for testing all FoodHub API endpoints.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Base URL](#base-url)
- [Categories API](#categories-api)
- [Restaurants API](#restaurants-api)
- [Menu Items API](#menu-items-api)
- [Orders API](#orders-api)
- [Users API](#users-api)
- [Postman Collection](#postman-collection)

## Prerequisites

- Backend running on http://localhost:8080
- Postman or cURL installed
- Browser for GET requests

## Base URL
```
http://localhost:8080/api
```

---

## 📂 Categories API

### Get All Categories
```bash
GET /api/categories
```

**cURL:**
```bash
curl http://localhost:8080/api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "categoryId": "CAT001",
    "name": "Food",
    "image": "https://...",
    "filter": "all",
    "count": "240+ stores",
    "active": true
  }
]
```

### Get Active Categories
```bash
GET /api/categories/active
```

**Browser:** http://localhost:8080/api/categories/active

---

## 🍽️ Restaurants API

### Get All Active Restaurants
```bash
GET /api/restaurants/active
```

**cURL:**
```bash
curl http://localhost:8080/api/restaurants/active
```

### Get Restaurants by Category
```bash
GET /api/restaurants/category/{category}
```

**Example:**
```bash
curl http://localhost:8080/api/restaurants/category/italian
```

### Search Restaurants
```bash
GET /api/restaurants/search?query={searchTerm}
```

**Example:**
```bash
curl "http://localhost:8080/api/restaurants/search?query=pizza"
```

### Get Top Rated Restaurants
```bash
GET /api/restaurants/top-rated
```

**Browser:** http://localhost:8080/api/restaurants/top-rated

---

## 🍕 Menu Items API

### Get Menu Items by Restaurant
```bash
GET /api/menu-items/restaurant/{restaurantId}
```

**Example:**
```bash
curl http://localhost:8080/api/menu-items/restaurant/1
```

**With Filters:**
```bash
GET /api/menu-items/restaurant/1?activeOnly=true&sortBy=price_asc&page=0&size=10
```

### Create Menu Item
```bash
POST /api/menu-items
Content-Type: application/json
```

**cURL:**
```bash
curl -X POST http://localhost:8080/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": 1,
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza",
    "price": 12.99,
    "category": "Pizza",
    "vegetarian": true,
    "active": true,
    "available": true
  }'
```

### Search Menu Items
```bash
GET /api/menu-items/search?query={searchTerm}
```

**Example:**
```bash
curl "http://localhost:8080/api/menu-items/search?query=pizza"
```

### Get Vegetarian Items
```bash
GET /api/menu-items/restaurant/{restaurantId}/vegetarian
```

### Filter Menu Items
```bash
GET /api/menu-items/restaurant/{restaurantId}/filter?vegetarian=true&minPrice=10&maxPrice=20
```

---

## 📦 Orders API

### Create Order
```bash
POST /api/orders
Content-Type: application/json
```

**cURL:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "restaurantId": 1,
    "totalAmount": 50.00,
    "deliveryFee": 5.00,
    "discount": 0.00,
    "paymentMethod": "CARD",
    "deliveryAddress": "123 Main St, City",
    "contactNumber": "+1234567890"
  }'
```

### Get User Orders
```bash
GET /api/orders/user/{userId}
```

**Example:**
```bash
curl http://localhost:8080/api/orders/user/1
```

### Update Order Status
```bash
PATCH /api/orders/{id}/status?status=CONFIRMED
```

**cURL:**
```bash
curl -X PATCH "http://localhost:8080/api/orders/1/status?status=CONFIRMED"
```

**Available Statuses:**
- PENDING
- CONFIRMED
- PREPARING
- OUT_FOR_DELIVERY
- DELIVERED
- CANCELLED

---

## 👤 Users API

### Register User
```bash
POST /api/users/register
Content-Type: application/json
```

**cURL:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

### Get User by ID
```bash
GET /api/users/{id}
```

### Update User
```bash
PUT /api/users/{id}
Content-Type: application/json
```

### Search Users
```bash
GET /api/users/search?query={searchTerm}
```

---

## 📊 Postman Collection

### Import This Collection
```json
{
  "info": {
    "name": "FoodHub API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Categories",
      "item": [
        {
          "name": "Get Active Categories",
          "request": {
            "method": "GET",
            "url": "http://localhost:8080/api/categories/active"
          }
        }
      ]
    },
    {
      "name": "Restaurants",
      "item": [
        {
          "name": "Get Active Restaurants",
          "request": {
            "method": "GET",
            "url": "http://localhost:8080/api/restaurants/active"
          }
        },
        {
          "name": "Search Restaurants",
          "request": {
            "method": "GET",
            "url": "http://localhost:8080/api/restaurants/search?query=pizza"
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 Common Test Scenarios

### Scenario 1: Browse Restaurants
1. Get active categories
2. Get restaurants by category
3. View restaurant details
4. Get restaurant menu items

### Scenario 2: Place an Order
1. Register user
2. Browse menu items
3. Create order
4. Track order status

### Scenario 3: Restaurant Management
1. Create menu item
2. Update menu item availability
3. Get order statistics

---

## ✅ Expected Responses

### Success Response (200 OK)
```json
{
  "id": 1,
  "name": "Restaurant Name",
  ...
}
```

### Created Response (201 Created)
```json
{
  "id": 1,
  "message": "Created successfully"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Invalid request data"
}
```

### Not Found (404)
```json
{
  "error": "Resource not found"
}
```

---

## 🔍 Testing Tips

1. **Use Browser DevTools** - Network tab to inspect requests
2. **Check Logs** - Monitor backend console for errors
3. **Test Edge Cases** - Invalid IDs, missing fields, etc.
4. **Verify Data** - Check H2 console after operations
5. **Test Pagination** - Use page & size parameters

---

**Happy Testing! 🚀**