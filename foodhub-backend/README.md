# 🍔 FoodHub Backend API

A comprehensive food delivery platform backend built with Spring Boot 3.2.0, providing RESTful APIs for restaurant management, menu items, orders, and user management.

In the combined SnapEats repo, the frontend lives in the sibling `../frontend` folder and is served separately from this backend module.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)

## ✨ Features

### Restaurant Management
- ✅ CRUD operations for restaurants
- ✅ Category-based filtering
- ✅ Search functionality
- ✅ Rating system
- ✅ Location-based queries
- ✅ Auto-load from JSON data

### Menu Items
- ✅ Comprehensive menu management
- ✅ Dietary preferences (vegetarian, vegan, gluten-free)
- ✅ Stock management
- ✅ Pricing & discounts
- ✅ Search & filter by multiple criteria
- ✅ Popularity tracking

### Order Management
- ✅ Order creation & tracking
- ✅ Order status management
- ✅ Payment integration ready
- ✅ Order history
- ✅ Analytics & statistics

### User Management
- ✅ User registration & authentication
- ✅ Role-based access (User, Admin, Restaurant Owner)
- ✅ Profile management
- ✅ Password encryption with BCrypt

### Categories
- ✅ Dynamic category system
- ✅ 18+ predefined food categories
- ✅ Category-based filtering
- ✅ Active/inactive status

## 🛠 Tech Stack

- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** H2 (Development), MySQL (Production Ready)
- **ORM:** Hibernate/JPA
- **Security:** Spring Security + BCrypt
- **Documentation:** Swagger/OpenAPI 3.0
- **Build Tool:** Maven
- **Authentication:** JWT (Ready to implement)

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/foodhub-backend.git
cd foodhub-backend
```

2. **Build the project**
```bash
mvn clean install
```

3. **Run the application**
```bash
mvn clean spring-boot:run
```

4. **Access the application**
- API Base URL: http://localhost:8081/api
- Swagger UI: http://localhost:8081/swagger-ui.html
- H2 Console: http://localhost:8081/h2-console
- Health (liveness): http://localhost:8081/actuator/health/liveness
- Health (readiness): http://localhost:8081/actuator/health/readiness
- Frontend (repo root workflow): serve `../frontend` separately or run `docker compose up --build` from the repo root

### H2 Database Access
- JDBC URL: `jdbc:h2:file:./data/foodhub`
- Username: `sa`
- Password: *(leave blank)*

## 📚 API Documentation

### Categories
```http
GET    /api/categories              # Get all categories
GET    /api/categories/active       # Get active categories
GET    /api/categories/{id}         # Get category by ID
```

### Restaurants
```http
GET    /api/restaurants                    # Get all restaurants
GET    /api/restaurants/active             # Get active restaurants
GET    /api/restaurants/{id}               # Get restaurant by ID
GET    /api/restaurants/category/{category} # Get by category
GET    /api/restaurants/search?query=...   # Search restaurants
GET    /api/restaurants/top-rated          # Get top rated
```

### Menu Items
```http
GET    /api/menu-items                              # Get all menu items
GET    /api/menu-items/{id}                         # Get menu item by ID
GET    /api/menu-items/restaurant/{restaurantId}   # Get by restaurant
GET    /api/menu-items/search?query=...            # Search menu items
POST   /api/menu-items                              # Create menu item
PUT    /api/menu-items/{id}                         # Update menu item
DELETE /api/menu-items/{id}                         # Delete menu item
```

### Orders
```http
GET    /api/orders                    # Get all orders
GET    /api/orders/{id}               # Get order by ID
GET    /api/orders/user/{userId}      # Get user orders
POST   /api/orders                    # Create order
PUT    /api/orders/{id}               # Update order
PATCH  /api/orders/{id}/status        # Update order status
```

### Users
```http
GET    /api/users                     # Get all users
GET    /api/users/{id}                # Get user by ID
POST   /api/users/register            # Register new user
PUT    /api/users/{id}                # Update user
DELETE /api/users/{id}                # Delete user
```

## 🗄️ Database Schema

### Main Entities

#### Restaurant
- id, restaurantId, name, cuisine, rating
- address, city, state, country
- verified, active, category
- deliveryFee, minimumOrderAmount
- openingTime, closingTime

#### MenuItem
- id, itemId, restaurantId, name
- description, price, category
- vegetarian, vegan, glutenFree
- available, active, rating
- discount, stockQuantity

#### Order
- id, orderNumber, userId, restaurantId
- totalAmount, deliveryFee, finalAmount
- status, paymentMethod, paymentStatus
- deliveryAddress, specialInstructions

#### User
- id, name, email, password
- phoneNumber, address, city, state
- role (USER, ADMIN, RESTAURANT_OWNER)
- active

## 📁 Project Structure
```
src/main/java/com/foodhub/
├── FoodHubApplication.java          # Main application class
├── config/                           # Configuration classes
│   ├── CorsConfig.java              # CORS configuration
│   ├── JpaConfig.java               # JPA auditing config
│   └── SecurityConfig.java          # Security configuration
├── controller/                       # REST controllers
│   ├── CategoryController.java
│   ├── MenuItemController.java
│   ├── OrderController.java
│   ├── RestaurantController.java
│   └── UserController.java
├── model/                            # Entity classes
│   ├── Category.java
│   ├── MenuItem.java
│   ├── Order.java
│   ├── Restaurant.java
│   └── User.java
└── repository/                       # Data repositories
    ├── CategoryRepository.java
    ├── MenuItemRepository.java
    ├── OrderRepository.java
    ├── RestaurantRepository.java
    └── UserRepository.java
```

## ⚙️ Configuration

### application.properties
```properties
# Server
server.port=8081

# Database (H2)
spring.datasource.url=jdbc:h2:file:./data/foodhub;DB_CLOSE_ON_EXIT=FALSE;AUTO_SERVER=TRUE
spring.jpa.hibernate.ddl-auto=update
spring.flyway.enabled=true

# For MySQL (Production)
# spring.datasource.url=jdbc:mysql://localhost:3306/foodhub
# spring.datasource.username=root
# spring.datasource.password=yourpassword
# spring.jpa.hibernate.ddl-auto=update
```

## 🧪 Testing

Run tests with:
```bash
mvn test
```

## 📦 Build for Production
```bash
mvn clean package
java -jar target/foodhub-backend-1.0.0.jar
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Spring Boot team for the amazing framework
- All contributors who helped with the project

## 📧 Contact

Your Name - your.email@example.com

Project Link: https://github.com/yourusername/foodhub-backend

---

**Built with ❤️ using Spring Boot**
