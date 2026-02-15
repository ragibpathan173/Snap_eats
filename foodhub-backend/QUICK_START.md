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
mvn spring-boot:run
```

### 4. Verify
Open browser: http://localhost:8080/api/categories/active

You should see 18 categories loaded! 🎉

## 📍 Important URLs

| Service | URL |
|---------|-----|
| API Base | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| H2 Console | http://localhost:8080/h2-console |

## 🗄️ H2 Database Login
```
JDBC URL: jdbc:h2:mem:foodhub
Username: sa
Password: (leave blank)
```

## 🧪 Quick API Tests

### Get Categories
```bash
curl http://localhost:8080/api/categories/active
```

### Get Restaurants
```bash
curl http://localhost:8080/api/restaurants/active
```

### Search Restaurants
```bash
curl "http://localhost:8080/api/restaurants/search?query=pizza"
```

## 🎨 Connect Frontend

Your frontend should call:
```javascript
const API_URL = 'http://localhost:8080/api';

// Get categories
fetch(`${API_URL}/categories/active`)
  .then(res => res.json())
  .then(data => console.log(data));
```

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

### Port 8080 already in use?
Change port in `application.properties`:
```properties
server.port=8081
```

### Database not connecting?
Check `application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:foodhub
spring.jpa.hibernate.ddl-auto=create-drop
```

## 📚 Next Steps

1. Read [API_TESTING.md](API_TESTING.md) for testing
2. Read [MENU_FEATURE.md](MENU_FEATURE.md) for menu management
3. Check [README.md](README.md) for full documentation

---

**Happy Coding! 🚀**