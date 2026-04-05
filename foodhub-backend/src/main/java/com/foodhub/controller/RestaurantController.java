package com.foodhub.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodhub.config.RealFoodPhotoService;
import com.foodhub.model.Restaurant;
import com.foodhub.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {
    private static final List<Map<String, String>> LOCATION_FALLBACKS = List.of(
            Map.of("city", "Delhi", "locality", "Jamia Nagar"),
            Map.of("city", "Bangalore", "locality", "Koramangala"),
            Map.of("city", "Gurgaon", "locality", "Sector 29"),
            Map.of("city", "Hyderabad", "locality", "Jubilee Hills"),
            Map.of("city", "Mumbai", "locality", "Bandra West"),
            Map.of("city", "Pune", "locality", "Baner"),
            Map.of("city", "Chennai", "locality", "Adyar"),
            Map.of("city", "Kolkata", "locality", "Salt Lake")
    );

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RealFoodPhotoService realFoodPhotoService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void loadInitialData() {
        try {
            List<Restaurant> restaurants = readRestaurantsFromJson();
            syncRestaurantsFromJson(restaurants);
        } catch (IOException e) {
            System.err.println("Failed to load restaurants from JSON: " + e.getMessage());
            e.printStackTrace();
        }
        backfillRestaurantLocations();
    }

    private List<Restaurant> readRestaurantsFromJson() throws IOException {
        try (InputStream inputStream = new ClassPathResource("data/restaurants.json").getInputStream()) {
            return objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Restaurant>>() {}
            );
        }
    }

    private void syncRestaurantsFromJson(List<Restaurant> seededRestaurants) {
        List<Restaurant> existingRestaurants = restaurantRepository.findAll();
        Map<String, Restaurant> existingByRestaurantId = existingRestaurants.stream()
                .filter(restaurant -> restaurant.getRestaurantId() != null && !restaurant.getRestaurantId().isBlank())
                .collect(Collectors.toMap(
                        Restaurant::getRestaurantId,
                        restaurant -> restaurant,
                        (left, right) -> left,
                        HashMap::new
                ));

        List<Restaurant> restaurantsToSave = new ArrayList<>();
        Set<String> activeRestaurantIds = new HashSet<>();
        int createdCount = 0;
        int updatedCount = 0;

        for (Restaurant seededRestaurant : seededRestaurants) {
            String restaurantId = Objects.toString(seededRestaurant.getRestaurantId(), "").trim();
            if (restaurantId.isBlank()) {
                continue;
            }

            Restaurant target = existingByRestaurantId.get(restaurantId);
            if (target == null) {
                target = new Restaurant();
                target.setRestaurantId(restaurantId);
                createdCount++;
            } else {
                updatedCount++;
            }

            copyRestaurantFields(target, seededRestaurant);
            restaurantsToSave.add(target);
            activeRestaurantIds.add(restaurantId);
        }

        List<Restaurant> restaurantsToDeactivate = existingRestaurants.stream()
                .filter(restaurant -> restaurant.getRestaurantId() != null && !restaurant.getRestaurantId().isBlank())
                .filter(restaurant -> !activeRestaurantIds.contains(restaurant.getRestaurantId()))
                .filter(restaurant -> Boolean.TRUE.equals(restaurant.getActive()))
                .peek(restaurant -> restaurant.setActive(false))
                .collect(Collectors.toList());

        if (!restaurantsToSave.isEmpty()) {
            restaurantRepository.saveAll(restaurantsToSave);
        }
        if (!restaurantsToDeactivate.isEmpty()) {
            restaurantRepository.saveAll(restaurantsToDeactivate);
        }

        System.out.println("Synced " + activeRestaurantIds.size() + " restaurants from JSON (" + createdCount + " new, " + updatedCount + " updated, " + restaurantsToDeactivate.size() + " deactivated)");
    }

    private void copyRestaurantFields(Restaurant target, Restaurant source) {
        String desiredImageUrl = realFoodPhotoService.restaurantPhotoUrl(source);

        target.setRestaurantId(source.getRestaurantId());
        target.setName(source.getName());
        target.setCuisine(source.getCuisine());
        target.setRating(source.getRating());
        target.setReviewCount(source.getReviewCount() == null ? 0 : source.getReviewCount());
        target.setTime(source.getTime());
        target.setDiscount(source.getDiscount());
        if (realFoodPhotoService.shouldReplaceManagedImage(target.getImage(), desiredImageUrl)) {
            target.setImage(desiredImageUrl);
        }
        target.setLogo(source.getLogo());
        target.setCategory(source.getCategory());
        target.setCity(source.getCity());
        target.setLocality(source.getLocality());
        target.setVerified(Boolean.TRUE.equals(source.getVerified()));
        target.setActive(Boolean.TRUE.equals(source.getActive()));
        target.setIsOpen(source.getIsOpen() == null ? Boolean.TRUE : source.getIsOpen());
        target.setAcceptingOrders(source.getAcceptingOrders() == null ? Boolean.TRUE : source.getAcceptingOrders());
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
    public ResponseEntity<List<Restaurant>> getActiveRestaurants(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {
        List<Restaurant> restaurants = restaurantRepository.findByActiveTrue()
                .stream()
                .filter(restaurant -> matchesCategory(restaurant, category))
                .filter(restaurant -> matchesSearchQuery(restaurant, query))
                .filter(restaurant -> matchesLocation(restaurant, city, locality))
                .collect(Collectors.toList());

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

    // ✅ FIXED HERE
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String query) {
        return getActiveRestaurants(city, locality, category, query);
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
    public ResponseEntity<List<Restaurant>> searchRestaurants(
            @RequestParam String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String category) {
        return getActiveRestaurants(city, locality, category, query);
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

    private boolean matchesCategory(Restaurant restaurant, String category) {
        String normalizedCategory = normalize(category);
        if (normalizedCategory.isBlank() || "all".equals(normalizedCategory)) {
            return true;
        }
        return normalize(restaurant.getCategory()).equals(normalizedCategory);
    }

    private boolean matchesSearchQuery(Restaurant restaurant, String query) {
        String normalizedQuery = normalize(query);
        if (normalizedQuery.isBlank()) {
            return true;
        }

        String searchable = String.join(" ",
                normalize(restaurant.getName()),
                normalize(restaurant.getCuisine()),
                normalize(restaurant.getCategory()),
                normalize(restaurant.getCity()),
                normalize(restaurant.getLocality())
        );
        return searchable.contains(normalizedQuery);
    }

    private boolean matchesLocation(Restaurant restaurant, String city, String locality) {
        String normalizedCity = normalize(city);
        String normalizedLocality = normalize(locality);
        if (normalizedCity.isBlank() && normalizedLocality.isBlank()) {
            return true;
        }

        String restaurantCity = normalize(restaurant.getCity());
        String restaurantLocality = normalize(restaurant.getLocality());

        boolean cityMatch = normalizedCity.isBlank()
                || restaurantCity.contains(normalizedCity)
                || normalizedCity.contains(restaurantCity)
                || restaurantLocality.contains(normalizedCity);

        boolean localityMatch = normalizedLocality.isBlank()
                || restaurantLocality.contains(normalizedLocality)
                || normalizedLocality.contains(restaurantLocality)
                || restaurantCity.contains(normalizedLocality);

        return cityMatch && localityMatch;
    }

    private String normalize(String value) {
        return Objects.toString(value, "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
