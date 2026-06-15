# Menu Feature Guide

The menu API powers restaurant menus, search, dietary filtering, stock/availability controls, and admin menu management.

## Main Model Fields

Common fields:

```text
id
itemId
restaurantId
name
description
category
image
price
discount
discountedPrice
active
available
```

Dietary fields:

```text
vegetarian
vegan
glutenFree
spicy
spiceLevel
calories
ingredients
allergens
tags
```

Merchandising and stock fields:

```text
rating
orderCount
reviewCount
featured
bestSeller
prepTime
portionSize
stockQuantity
isLimitedStock
```

## Public Read Endpoints

```http
GET /api/menu-items
GET /api/menu-items/{id}
GET /api/menu-items/item/{itemId}
GET /api/menu-items/restaurant/{restaurantId}
GET /api/menu-items/restaurant-code/{restaurantCode}
GET /api/menu-items/restaurant/{restaurantId}/category/{category}
GET /api/menu-items/restaurant/{restaurantId}/categories
GET /api/menu-items/restaurant/{restaurantId}/top-rated?limit=10
GET /api/menu-items/restaurant/{restaurantId}/popular?limit=10
GET /api/menu-items/restaurant/{restaurantId}/featured
GET /api/menu-items/restaurant/{restaurantId}/best-sellers
GET /api/menu-items/restaurant/{restaurantId}/vegetarian
GET /api/menu-items/restaurant/{restaurantId}/vegan
GET /api/menu-items/restaurant/{restaurantId}/gluten-free
GET /api/menu-items/search?query=pizza
GET /api/menu-items/restaurant/{restaurantId}/filter
GET /api/menu-items/restaurant/{restaurantId}/stats
```

Restaurant menu queries support:

```http
activeOnly=true
availableOnly=true
page=0
size=50
sortBy=price_asc|price_desc|rating|name|popular
```

Advanced filter parameters:

```http
category=Pizza
vegetarian=true
vegan=true
glutenFree=true
minPrice=100
maxPrice=500
minRating=4
page=0
size=20
```

## Admin Write Endpoints

Menu writes require an admin bearer token.

```http
POST   /api/menu-items
PUT    /api/menu-items/{id}
PATCH  /api/menu-items/{id}/availability?available=true
PATCH  /api/menu-items/{id}/stock?quantity=50
PATCH  /api/menu-items/restaurant/{restaurantId}/activate
PATCH  /api/menu-items/restaurant/{restaurantId}/deactivate
DELETE /api/menu-items/{id}
DELETE /api/menu-items/restaurant/{restaurantId}
```

Create an item:

```bash
curl -X POST http://localhost:8081/api/menu-items \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\":1,
    \"name\":\"Margherita Pizza\",
    \"description\":\"Classic pizza with mozzarella and basil\",
    \"price\":199.0,
    \"category\":\"Pizza\",
    \"vegetarian\":true,
    \"active\":true,
    \"available\":true,
    \"prepTime\":\"20 mins\"
  }"
```

Update availability:

```bash
curl -X PATCH "http://localhost:8081/api/menu-items/1/availability?available=false" \
  -H "Authorization: Bearer <admin-token>"
```

## Sorting and Pagination Response

Paged endpoints return:

```json
{
  "items": [],
  "currentPage": 0,
  "totalItems": 0,
  "totalPages": 0
}
```

## Data Loading

Initial restaurant/category data is loaded from:

```text
src/main/resources/data/restaurants.json
src/main/resources/data/categories.json
```

Menu records are loaded by `MenuItemDataLoader` and stored in the configured database.

## Maintenance Notes

- Keep category names consistent across restaurants so filtering stays predictable.
- Prefer `restaurant-code/{restaurantCode}` for frontend routes because it uses the stable restaurant code.
- Use `active=false` for retired items and `available=false` for temporary out-of-stock items.
- Use pagination on large menus.
