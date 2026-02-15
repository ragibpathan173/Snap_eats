package com.foodhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoodHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodHubApplication.class, args);
        System.out.println("\n╔═══════════════════════════════════════════╗");
        System.out.println("║   🍔 FoodHub Backend Started Successfully! ║");
        System.out.println("╚═══════════════════════════════════════════╝");
        System.out.println("📍 API Base URL:        http://localhost:8080/api");
        System.out.println("📚 Swagger UI:          http://localhost:8080/swagger-ui.html");
        System.out.println("🗄️  H2 Console:          http://localhost:8080/h2-console");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("📋 Available Endpoints:");
        System.out.println("   • Restaurants:       /api/restaurants");
        System.out.println("   • Categories:        /api/categories");
        System.out.println("   • Menu Items:        /api/menu-items");
        System.out.println("   • Users:             /api/users");
        System.out.println("   • Orders:            /api/orders");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
}