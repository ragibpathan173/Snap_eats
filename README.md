# SnapEats - API Integration Guide

This guide explains how to migrate your SnapEats application from hard-coded data to API-based data fetching.

## 📋 Overview

The following changes have been made:
1. **Extracted hard-coded data** from `snap_eats.js` into JSON files
2. **Created REST API endpoints** using Spring Boot controllers
3. **Updated frontend** to fetch data from the API

## 📁 File Structure

```
Backend (foodhub-backend/):
├── src/main/java/com/foodhub/
│   ├── controller/
│   │   ├── CategoryController.java          # API endpoints for categories
│   │   └── RestaurantController.java        # API endpoints for restaurants
│   ├── model/
│   │   ├── Category.java                    # Category entity
│   │   └── Restaurant.java                  # Restaurant entity
│   └── repository/
│       ├── CategoryRepository.java
│       └── RestaurantRepository.java
└── src/main/resources/
    ├── application.properties               # Backend configuration
    └── data/
        ├── categories.json                  # 18 categories
        └── restaurants.json                 # 56 restaurants

Frontend (served by Spring Boot static resources):
└── foodhub-backend/src/main/resources/static/
    ├── index.html
    ├── snap_eats.html
    ├── snap_eats.css
    └── snap_eats.js
```

## 🚀 Setup Instructions

### Step 1: Backend Setup

1. **Copy the JSON data files** to your Spring Boot project:
   ```
   foodhub-backend/src/main/resources/data/
   ├── categories.json
   └── restaurants.json
   ```

2. **Copy the controller files** to your project:
   ```
   foodhub-backend/src/main/java/com/foodhub/controller/
   ├── CategoryController.java
   └── RestaurantController.java
   ```

3. **Copy the model files** to your project:
   ```
   foodhub-backend/src/main/java/com/foodhub/model/
   ├── Category.java
   └── Restaurant.java
   ```

4. **Update application.properties**:
   ```properties
   server.port=8080
   
   # CORS Configuration
   spring.web.cors.allowed-origins=*
   spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
   ```

5. **Add Jackson dependency** (if not already present) in `pom.xml`:
   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-databind</artifactId>
   </dependency>
   ```

6. **Run the Spring Boot application**:
   ```bash
   cd foodhub-backend
   mvn spring-boot:run
   ```

### Step 2: Frontend Setup

The frontend is now served directly by Spring Boot from `src/main/resources/static`.

Open the app in a browser after starting the backend:
```text
http://localhost:8081/
```

## 🔌 API Endpoints

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/active` | Get active categories |
| GET | `/api/categories/{id}` | Get category by ID |
| GET | `/api/categories/filter/{filter}` | Get category by filter |
| GET | `/api/categories/name/{name}` | Get category by name |

### Restaurant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants/active` | Get active restaurants |
| GET | `/api/restaurants/{id}` | Get restaurant by ID |
| GET | `/api/restaurants/category/{category}` | Get restaurants by category |
| GET | `/api/restaurants/verified` | Get verified restaurants |
| GET | `/api/restaurants/rating/{minRating}` | Get restaurants by minimum rating |
| GET | `/api/restaurants/search?query={query}` | Search restaurants |
| GET | `/api/restaurants/top-rated` | Get top 10 rated restaurants |

## 📊 Data Structure

### Category JSON Format
```json
{
  "id": "CAT001",
  "categoryId": "CAT001",
  "name": "Food",
  "image": "https://...",
  "filter": "all",
  "count": "240+ stores",
  "active": true
}
```

### Restaurant JSON Format
```json
{
  "id": "REST001",
  "restaurantId": "REST001",
  "name": "La Bella Italia",
  "cuisine": "Italian, Pizza, Pasta",
  "rating": 4.5,
  "time": "30-35 mins",
  "discount": "50% OFF",
  "image": "https://...",
  "category": "italian",
  "verified": true,
  "active": true
}
```

## 🧪 Testing the API

You can test the API using:

### Using Browser
- Navigate to: `http://localhost:8080/api/categories`
- Navigate to: `http://localhost:8080/api/restaurants`

### Using cURL
```bash
# Get all categories
curl http://localhost:8080/api/categories

# Get restaurants by category
curl http://localhost:8080/api/restaurants/category/italian

# Search restaurants
curl "http://localhost:8080/api/restaurants/search?query=pizza"
```

### Using Postman
1. Create a new request
2. Set method to GET
3. Enter URL: `http://localhost:8080/api/categories`
4. Click Send

## 🔧 Configuration Options

### Change Backend Port
In `application.properties`:
```properties
server.port=9090
```

Then open the app from:
```text
http://localhost:9090/
```

### Enable CORS for Specific Origins
In `application.properties`:
```properties
spring.web.cors.allowed-origins=http://localhost:3000,http://example.com
```

## 📝 Key Changes from Hard-coded to API

### Before (Hard-coded)
```javascript
const categories = [
    { id: "CAT001", name: "Food", ... },
    { id: "CAT004", name: "Pizza", ... },
    // ... more hard-coded data
];
```

### After (API-based)
```javascript
async function fetchCategories() {
    const response = await fetch(`${API_BASE_URL}/categories/active`);
    categories = await response.json();
    renderCategories();
}
```

## 🎯 Benefits of This Approach

1. **Centralized Data Management**: All data is now in JSON files, easy to update
2. **Scalability**: Can easily switch to a database in the future
3. **API-First Design**: Frontend and backend are decoupled
4. **Reusability**: API can be used by mobile apps, other frontends, etc.
5. **Easier Testing**: Can test API independently of frontend

## 🔄 Future Enhancements

1. **Database Integration**: Replace JSON files with actual database (MySQL/PostgreSQL)
2. **CRUD Operations**: Add POST, PUT, DELETE endpoints to manage data
3. **Authentication**: Add JWT-based authentication
4. **Caching**: Implement Redis caching for better performance
5. **Pagination**: Add pagination for large datasets
6. **Filters**: Add more sophisticated filtering options

## ❗ Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check `@CrossOrigin(origins = "*")` is present in controllers
2. Verify application.properties has correct CORS settings
3. Restart the Spring Boot application

### Data Not Loading
1. Check backend is running: `http://localhost:8080/api/categories`
2. Check browser console for errors
3. Verify API_BASE_URL in frontend matches backend port
4. Check JSON files are in the correct location: `src/main/resources/data/`

### 404 Errors
1. Verify controller package path matches your project structure
2. Check component scanning in main Spring Boot application class
3. Restart the backend application

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Check backend logs for errors
3. Verify all files are in correct locations
4. Ensure all dependencies are installed

---

**Total Data Migrated:**
- ✅ 18 Categories
- ✅ 56 Restaurants
- ✅ All category filters
- ✅ All restaurant metadata (ratings, timing, discounts, etc.)
