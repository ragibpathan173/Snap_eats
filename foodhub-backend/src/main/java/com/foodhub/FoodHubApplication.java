package com.foodhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class FoodHubApplication {

    private final Environment environment;

    public FoodHubApplication(Environment environment) {
        this.environment = environment;
    }

    public static void main(String[] args) {
        SpringApplication.run(FoodHubApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void printStartupSummary() {
        String port = environment.getProperty("local.server.port",
                environment.getProperty("server.port", "8081"));
        String baseUrl = "http://localhost:" + port;

        System.out.println();
        System.out.println("============================================");
        System.out.println(" FoodHub Backend Started Successfully");
        System.out.println("============================================");
        System.out.println(" API Base URL:        " + baseUrl + "/api");
        System.out.println(" Swagger UI:          " + baseUrl + "/swagger-ui.html");
        System.out.println(" H2 Console:          " + baseUrl + "/h2-console");
        System.out.println(" Health (liveness):   " + baseUrl + "/actuator/health/liveness");
        System.out.println(" Health (readiness):  " + baseUrl + "/actuator/health/readiness");
        System.out.println("============================================");
        System.out.println();
    }
}
