package com.foodhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
// @EnableJpaAuditing
public class FoodHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodHubApplication.class, args);
        System.out.println("\n=================================");
        System.out.println("🍔 FoodHub Backend Started!");
        System.out.println("=================================");
        System.out.println("API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("H2 Console: http://localhost:8080/h2-console");
        System.out.println("=================================\n");
    }
}