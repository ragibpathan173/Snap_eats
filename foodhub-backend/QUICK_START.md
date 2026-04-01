# ⚡ FoodHub Quick Start Guide

Get FoodHub up and running in 5 minutes!

## 🎯 Prerequisites

✅ Java 17 or higher  
✅ Maven 3.6+  
✅ Your favorite IDE (IntelliJ IDEA recommended)

## 🚀 Steps

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd foodhub-backend
```

### 2. Build
```bash
mvn clean install
```

### 3. Run
```bash
mvn clean spring-boot:run
```

### 4. Verify
Open browser: http://localhost:8081/api/categories/active

You should see 18 categories loaded! 🎉

## 📍 Important URLs

| Service | URL |
|---------|-----|
| API Base | http://localhost:8081/api |
| Swagger UI | http://localhost:8081/swagger-ui.html |
| H2 Console | http://localhost:8081/h2-console |

## 🗄️ H2 Database Login
```
JDBC URL: jdbc:h2:file:./data/foodhub
Username: sa
Password: (leave blank)
```

## 🧪 Quick API Tests

### Get Categories
```bash
curl http://localhost:8081/api/categories/active
```

### Get Restaurants
```bash
curl http://localhost:8081/api/restaurants/active
```

### Search Restaurants
```bash
curl "http://localhost:8081/api/restaurants/search?query=pizza"
```

## 🎨 Connect Frontend

The frontend now lives in the repo-level `frontend/` folder and is served separately from the backend.

If you are calling the backend directly during local development, your frontend should call:
```javascript
const API_URL = 'http://localhost:8081/api';

// Get categories
fetch(`${API_URL}/categories/active`)
  .then(res => res.json())
  .then(data => console.log(data));
```

If you are serving `frontend/` through Docker Compose or another reverse proxy, keep the default `/api` value from `frontend/config.js`.

## ✅ Verify Data Loaded

Check console output:
```
✅ Loaded 18 categories from JSON into database
✅ Loaded 56 restaurants from JSON into database
```

## 🎉 You're Ready!

Your backend is running with:
- ✅ 18 Categories
- ✅ 56 Restaurants
- ✅ Complete REST API
- ✅ Search & Filter
- ✅ CORS enabled

## 🔧 Common Issues

### Port 8081 already in use?
Change port in `application.properties`:
```properties
server.port=18081
```

### Database not connecting?
Check `application.properties`:
```properties
spring.datasource.url=jdbc:h2:file:./data/foodhub;DB_CLOSE_ON_EXIT=FALSE
spring.jpa.hibernate.ddl-auto=update
```

## 📚 Next Steps

1. Read [API_TESTING.md](API_TESTING.md) for testing
2. Read [MENU_FEATURE.md](MENU_FEATURE.md) for menu management
3. Check [README.md](README.md) for full documentation

---

**Happy Coding! 🚀**
