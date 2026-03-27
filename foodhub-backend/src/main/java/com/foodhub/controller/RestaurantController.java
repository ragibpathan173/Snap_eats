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
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {
    private static final List<Map<String, String>> LOCATION_FALLBACKS = List.of(
            Map.of("city", "New Delhi", "locality", "Jamia Nagar"),
            Map.of("city", "Bengaluru", "locality", "Koramangala"),
            Map.of("city", "Mumbai", "locality", "Bandra West"),
            Map.of("city", "Kolkata", "locality", "Salt Lake"),
            Map.of("city", "Hyderabad", "locality", "Hitech City"),
            Map.of("city", "Chennai", "locality", "Adyar"),
            Map.of("city", "Pune", "locality", "Baner"),
            Map.of("city", "Ahmedabad", "locality", "Navrangpura")
    );

    @Autowired
    private RestaurantRepository restaurantRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void loadInitialData() {
        if (restaurantRepository.count() == 0) {
            try {
                InputStream inputStream = new ClassPathResource("data/restaurants.json").getInputStream();
                List<Restaurant> restaurants = objectMapper.readValue(
                        inputStream,
                        new TypeReference<List<Restaurant>>() {}
                );
                restaurantRepository.saveAll(restaurants);
                System.out.println("✅ Loaded " + restaurants.size() + " restaurants from JSON into database");
            } catch (IOException e) {
                System.err.println("❌ Error loading restaurants from JSON: " + e.getMessage());
                e.printStackTrace();
            }
        }
        backfillRestaurantLocations();
    }

    private void backfillRestaurantLocations() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        boolean changed = false;

        for (Restaurant restaurant : restaurants) {
            String city = restaurant.getCity();
            String locality = restaurant.getLocality();
            if ((city != null && !city.isBlank()) && (locality != null && !locality.isBlank())) {
                continue;
            }

            int clusterIndex = resolveClusterIndex(restaurant.getRestaurantId(), restaurant.getName());
            Map<String, String> fallback = LOCATION_FALLBACKS.get(clusterIndex);
            if (city == null || city.isBlank()) {
                restaurant.setCity(fallback.get("city"));
                changed = true;
            }
            if (locality == null || locality.isBlank()) {
                restaurant.setLocality(fallback.get("locality"));
                changed = true;
            }
        }

        if (changed) {
            restaurantRepository.saveAll(restaurants);
            System.out.println("✅ Restaurant location fields backfilled for current dataset");
        }
    }

    private int resolveClusterIndex(String restaurantId, String name) {
        String candidate = restaurantId == null ? "" : restaurantId.replaceAll("[^0-9]", "");
        int numeric = 0;
        if (!candidate.isBlank()) {
            try {
                numeric = Integer.parseInt(candidate);
            } catch (NumberFormatException ignored) {
                numeric = 0;
            }
        }
        if (numeric <= 0) {
            numeric = Math.abs((name == null ? "" : name).hashCode());
        }
        return Math.floorMod(numeric - 1, LOCATION_FALLBACKS.size());
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Restaurant>> getActiveRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findByActiveTrue());
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

    // ✅ FIXED HERE
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCategory(@PathVariable String category) {
        List<Restaurant> restaurants =
                restaurantRepository.findByCategoryAndActiveTrue(category);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Restaurant>> getVerifiedRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findByVerifiedTrue());
    }

    @GetMapping("/rating/{minRating}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByRating(@PathVariable Double minRating) {
        return ResponseEntity.ok(
                restaurantRepository.findByRatingGreaterThanEqual(minRating)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String query) {
        return ResponseEntity.ok(
                restaurantRepository.searchRestaurants(query)
        );
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Restaurant>> getTopRatedRestaurants() {
        return ResponseEntity.ok(
                restaurantRepository.findTopRatedRestaurants()
                        .stream()
                        .limit(10)
                        .collect(Collectors.toList())
        );
    }
}
