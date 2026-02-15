package com.foodhub.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodhub.model.Restaurant;
import com.foodhub.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantRepository restaurantRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Load initial data from JSON file into database on startup
     * This runs only once when the application starts
     */
    @PostConstruct
    public void loadInitialData() {
        // Only load if database is empty
        if (restaurantRepository.count() == 0) {
            try {
                InputStream inputStream = new ClassPathResource("data/restaurants.json").getInputStream();
                List<Restaurant> restaurants = objectMapper.readValue(inputStream, new TypeReference<List<Restaurant>>() {});
                restaurantRepository.saveAll(restaurants);
                System.out.println("✅ Loaded " + restaurants.size() + " restaurants from JSON into database");
            } catch (IOException e) {
                System.err.println("❌ Error loading restaurants from JSON: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Restaurant>> getActiveRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findByActiveTrue();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return restaurantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/restaurantId/{restaurantId}")
    public ResponseEntity<Restaurant> getRestaurantByRestaurantId(@PathVariable String restaurantId) {
        return restaurantRepository.findByRestaurantId(restaurantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCategory(@PathVariable String category) {
        List<Restaurant> restaurants = restaurantRepository.findByCategoryAndActiveTrue(category, true);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Restaurant>> getVerifiedRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findByVerifiedTrue();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/rating/{minRating}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByRating(@PathVariable Double minRating) {
        List<Restaurant> restaurants = restaurantRepository.findByRatingGreaterThanEqual(minRating);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String query) {
        List<Restaurant> restaurants = restaurantRepository.searchRestaurants(query);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Restaurant>> getTopRatedRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findTopRatedRestaurants();
        return ResponseEntity.ok(restaurants.stream().limit(10).collect(Collectors.toList()));
    }
}