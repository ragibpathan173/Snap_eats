package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.FavoriteRestaurant;
import com.foodhub.model.Restaurant;
import com.foodhub.model.User;
import com.foodhub.repository.FavoriteRestaurantRepository;
import com.foodhub.repository.RestaurantRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites/restaurants")
@CrossOrigin(origins = "*")
public class FavoriteRestaurantController {

    private final FavoriteRestaurantRepository favoriteRestaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public FavoriteRestaurantController(FavoriteRestaurantRepository favoriteRestaurantRepository,
                                        UserRepository userRepository,
                                        RestaurantRepository restaurantRepository) {
        this.favoriteRestaurantRepository = favoriteRestaurantRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping
    public ResponseEntity<?> getFavoriteRestaurants(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);

            List<FavoriteRestaurantResponse> favorites = favoriteRestaurantRepository
                    .findByUserIdAndActiveTrueOrderByUpdatedAtDesc(user.getId())
                    .stream()
                    .map(this::toResponse)
                    .filter(response -> response != null)
                    .toList();

            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch favorites: " + e.getMessage()));
        }
    }

    @PostMapping("/{restaurantId}")
    public ResponseEntity<?> addFavoriteRestaurant(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                   @PathVariable String restaurantId) {
        try {
            User user = resolveRequestUser(userId);
            Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId).orElse(null);
            if (restaurant == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Restaurant not found"));
            }

            FavoriteRestaurant favorite = favoriteRestaurantRepository.findByUserIdAndRestaurantId(user.getId(), restaurant.getId())
                    .orElseGet(FavoriteRestaurant::new);
            favorite.setUserId(user.getId());
            favorite.setRestaurantId(restaurant.getId());
            favorite.setActive(true);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(toResponse(favoriteRestaurantRepository.save(favorite)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add favorite: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<?> removeFavoriteRestaurant(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                      @PathVariable String restaurantId) {
        try {
            User user = resolveRequestUser(userId);
            Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId).orElse(null);
            if (restaurant == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Restaurant not found"));
            }
            FavoriteRestaurant favorite = favoriteRestaurantRepository
                    .findByUserIdAndRestaurantIdAndActiveTrue(user.getId(), restaurant.getId())
                    .orElse(null);
            if (favorite == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Favorite not found"));
            }

            favorite.setActive(false);
            favorite.setUpdatedAt(LocalDateTime.now());
            favoriteRestaurantRepository.save(favorite);
            return ResponseEntity.ok(Map.of("message", "Favorite removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove favorite: " + e.getMessage()));
        }
    }

    private FavoriteRestaurantResponse toResponse(FavoriteRestaurant favorite) {
        Restaurant restaurant = restaurantRepository.findById(favorite.getRestaurantId()).orElse(null);
        if (restaurant == null) {
            return null;
        }

        FavoriteRestaurantResponse response = new FavoriteRestaurantResponse();
        response.id = favorite.getId();
        response.restaurantId = restaurant.getRestaurantId();
        response.name = restaurant.getName();
        response.cuisine = restaurant.getCuisine();
        response.rating = restaurant.getRating();
        response.time = restaurant.getTime();
        response.discount = restaurant.getDiscount();
        response.image = restaurant.getImage();
        response.category = restaurant.getCategory();
        response.verified = restaurant.getVerified();
        response.createdAt = favorite.getCreatedAt();
        response.updatedAt = favorite.getUpdatedAt();
        return response;
    }

    private User resolveRequestUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not available"));
        }
        return userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Guest user not available"));
    }

    public static class FavoriteRestaurantResponse {
        public Long id;
        public String restaurantId;
        public String name;
        public String cuisine;
        public Double rating;
        public String time;
        public String discount;
        public String image;
        public String category;
        public Boolean verified;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
    }
}
