# 🍽️ Menu Features Documentation

Comprehensive guide to the Menu Items feature in FoodHub.

## 📋 Overview

The Menu Items feature provides complete management of restaurant menus with advanced filtering, search, and dietary preference support.

## ✨ Key Features

### 1. Basic Menu Management
- ✅ Create, read, update, delete menu items
- ✅ Unique item IDs for tracking
- ✅ Restaurant association
- ✅ Category organization
- ✅ Active/inactive status
- ✅ Availability toggles

### 2. Pricing & Discounts
- ✅ Base price management
- ✅ Discount percentage
- ✅ Auto-calculated discounted prices
- ✅ Price range filtering

### 3. Dietary Preferences
- ✅ Vegetarian indicator
- ✅ Vegan indicator
- ✅ Gluten-free indicator
- ✅ Spicy level (None, Mild, Medium, Hot, Extra Hot)

### 4. Stock Management
- ✅ Stock quantity tracking
- ✅ Limited stock flag
- ✅ Out-of-stock detection
- ✅ Low stock alerts

### 5. Popularity Tracking
- ✅ Order count
- ✅ Rating system (0-5 stars)
- ✅ Review count
- ✅ Best seller flag
- ✅ Featured item flag

### 6. Search & Filter
- ✅ Text search (name, description, tags)
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Dietary preference filtering
- ✅ Rating-based filtering
- ✅ Multi-criteria filtering

## 📊 Menu Item Fields

### Required Fields
```java
- restaurantId (Long)
- name (String, max 200 chars)
- price (Double)
- active (Boolean)
- available (Boolean)
```

### Optional Fields
```java
- itemId (String, auto-generated)
- description (Text)
- category (String, max 50 chars)
- image (String, URL, max 1000 chars)
- portionSize (String, max 50 chars)
- prepTime (String, e.g., "15-20 mins")
- calories (Integer)
- ingredients (Text)
- allergens (Text)
- tags (String, comma-separated)
```

### Dietary Fields
```java
- vegetarian (Boolean, default: false)
- vegan (Boolean, default: false)
- glutenFree (Boolean, default: false)
- spicy (Boolean, default: false)
- spiceLevel (String: None/Mild/Medium/Hot/Extra Hot)
```

### Pricing Fields
```java
- price (Double, required)
- discount (Double, percentage)
- discountedPrice (Double, auto-calculated)
```

### Tracking Fields
```java
- rating (Double, 0-5)
- orderCount (Integer)
- reviewCount (Integer)
- featured (Boolean)
- bestSeller (Boolean)
```

### Stock Fields
```java
- stockQuantity (Integer)
- isLimitedStock (Boolean)
```

## 🔍 API Endpoints

### Basic Operations

#### Get Menu Items by Restaurant
```http
GET /api/menu-items/restaurant/{restaurantId}
```

**Parameters:**
- `activeOnly` (boolean): Filter active items only
- `availableOnly` (boolean): Filter available items only
- `page` (int): Page number (default: 0)
- `size` (int): Items per page (default: 50)
- `sortBy` (string): Sort option

**Sort Options:**
- `price_asc` - Price low to high
- `price_desc` - Price high to low
- `rating` - Rating high to low
- `name` - Alphabetical
- `popular` - Most ordered first

**Example:**
```
GET /api/menu-items/restaurant/1?activeOnly=true&sortBy=price_asc&page=0&size=20
```

#### Create Menu Item
```http
POST /api/menu-items
```

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Margherita Pizza",
  "description": "Classic Italian pizza with fresh mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "vegetarian": true,
  "active": true,
  "available": true,
  "prepTime": "15-20 mins",
  "calories": 800,
  "image": "https://example.com/pizza.jpg"
}
```

### Dietary Filtering

#### Get Vegetarian Items
```http
GET /api/menu-items/restaurant/{restaurantId}/vegetarian
```

#### Get Vegan Items
```http
GET /api/menu-items/restaurant/{restaurantId}/vegan
```

#### Get Gluten-Free Items
```http
GET /api/menu-items/restaurant/{restaurantId}/gluten-free
```

### Popular Items

#### Get Top Rated Items
```http
GET /api/menu-items/restaurant/{restaurantId}/top-rated?limit=10
```

#### Get Popular Items (Most Ordered)
```http
GET /api/menu-items/restaurant/{restaurantId}/popular?limit=10
```

#### Get Best Sellers
```http
GET /api/menu-items/restaurant/{restaurantId}/best-sellers
```

#### Get Featured Items
```http
GET /api/menu-items/restaurant/{restaurantId}/featured
```

### Search & Filter

#### Search Menu Items
```http
GET /api/menu-items/search?query=pizza&restaurantId=1
```

Searches in:
- Item name
- Description
- Category
- Tags

#### Advanced Filter
```http
GET /api/menu-items/restaurant/{restaurantId}/filter
```

**Parameters:**
- `category` (string): Filter by category
- `vegetarian` (boolean): Vegetarian items only
- `vegan` (boolean): Vegan items only
- `glutenFree` (boolean): Gluten-free items only
- `minPrice` (double): Minimum price
- `maxPrice` (double): Maximum price
- `minRating` (double): Minimum rating
- `page`, `size`: Pagination

**Example:**
```
GET /api/menu-items/restaurant/1/filter?vegetarian=true&minPrice=10&maxPrice=20&minRating=4.0
```

### Stock Management

#### Update Availability
```http
PATCH /api/menu-items/{id}/availability?available=true
```

#### Update Stock
```http
PATCH /api/menu-items/{id}/stock?quantity=50
```

### Statistics

#### Get Menu Statistics
```http
GET /api/menu-items/restaurant/{restaurantId}/stats
```

**Response:**
```json
{
  "totalItems": 45,
  "activeItems": 42,
  "availableItems": 40,
  "vegetarianItems": 15,
  "veganItems": 8
}
```

### Bulk Operations

#### Activate All Items
```http
PATCH /api/menu-items/restaurant/{restaurantId}/activate
```

#### Deactivate All Items
```http
PATCH /api/menu-items/restaurant/{restaurantId}/deactivate
```

#### Delete All Items for Restaurant
```http
DELETE /api/menu-items/restaurant/{restaurantId}
```

## 💡 Use Cases

### Use Case 1: Customer Browsing
```
1. GET /api/menu-items/restaurant/1?activeOnly=true&sortBy=popular
2. GET /api/menu-items/restaurant/1/vegetarian
3. GET /api/menu-items/restaurant/1/filter?minPrice=10&maxPrice=20
```

### Use Case 2: Restaurant Owner Management
```
1. POST /api/menu-items (Create new item)
2. PATCH /api/menu-items/123/availability?available=false
3. GET /api/menu-items/restaurant/1/stats
```

### Use Case 3: Search Functionality
```
1. GET /api/menu-items/search?query=pizza
2. GET /api/menu-items/restaurant/1/category/Desserts
```

## 🎯 Best Practices

### 1. Always Set itemId
If not provided, it's auto-generated as `ITEM_{timestamp}`

### 2. Use Categories Consistently
Standardize category names across your menu

### 3. Keep Images Updated
Use high-quality images and CDN URLs

### 4. Manage Stock Properly
- Set `isLimitedStock=true` for items with inventory
- Update `stockQuantity` regularly
- Use availability toggle for temporary unavailability

### 5. Leverage Flags
- Mark popular items as `bestSeller`
- Promote special items as `featured`
- Track ratings and reviews

## 🚀 Performance Tips

1. **Pagination**: Always use pagination for large menus
2. **Indexing**: Database indexes on `restaurantId`, `category`, `active`
3. **Caching**: Consider caching popular/featured items
4. **Lazy Loading**: Load images lazily in frontend

---

**Menu Feature Complete! 🍕**