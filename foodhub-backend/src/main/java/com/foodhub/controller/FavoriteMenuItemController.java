package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.FavoriteMenuItem;
import com.foodhub.model.MenuItem;
import com.foodhub.model.Restaurant;
import com.foodhub.model.User;
import com.foodhub.repository.FavoriteMenuItemRepository;
import com.foodhub.repository.MenuItemRepository;
import com.foodhub.repository.RestaurantRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites/menu-items")
@CrossOrigin(origins = "*")
public class FavoriteMenuItemController {

    private final FavoriteMenuItemRepository favoriteMenuItemRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public FavoriteMenuItemController(FavoriteMenuItemRepository favoriteMenuItemRepository,
                                      UserRepository userRepository,
                                      MenuItemRepository menuItemRepository,
                                      RestaurantRepository restaurantRepository) {
        this.favoriteMenuItemRepository = favoriteMenuItemRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping
    public ResponseEntity<?> getFavoriteMenuItems(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);

            List<FavoriteMenuItemResponse> favorites = favoriteMenuItemRepository
                    .findByUserIdAndActiveTrueOrderByUpdatedAtDesc(user.getId())
                    .stream()
                    .map(this::toResponse)
                    .filter(response -> response != null)
                    .toList();

            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch favorite dishes: " + e.getMessage()));
        }
    }

    @PostMapping("/{itemId}")
    public ResponseEntity<?> addFavoriteMenuItem(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                 @PathVariable String itemId) {
        try {
            User user = resolveRequestUser(userId);
            MenuItem menuItem = menuItemRepository.findByItemId(itemId).orElse(null);
            if (menuItem == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Menu item not found"));
            }

            FavoriteMenuItem favorite = favoriteMenuItemRepository.findByUserIdAndMenuItemId(user.getId(), menuItem.getId())
                    .orElseGet(FavoriteMenuItem::new);
            favorite.setUserId(user.getId());
            favorite.setMenuItemId(menuItem.getId());
            favorite.setActive(true);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(toResponse(favoriteMenuItemRepository.save(favorite)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add favorite dish: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeFavoriteMenuItem(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                    @PathVariable String itemId) {
        try {
            User user = resolveRequestUser(userId);
            MenuItem menuItem = menuItemRepository.findByItemId(itemId).orElse(null);
            if (menuItem == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Menu item not found"));
            }

            FavoriteMenuItem favorite = favoriteMenuItemRepository
                    .findByUserIdAndMenuItemIdAndActiveTrue(user.getId(), menuItem.getId())
                    .orElse(null);
            if (favorite == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Favorite dish not found"));
            }

            favorite.setActive(false);
            favorite.setUpdatedAt(LocalDateTime.now());
            favoriteMenuItemRepository.save(favorite);
            return ResponseEntity.ok(Map.of("message", "Favorite dish removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove favorite dish: " + e.getMessage()));
        }
    }

    private FavoriteMenuItemResponse toResponse(FavoriteMenuItem favorite) {
        MenuItem menuItem = menuItemRepository.findById(favorite.getMenuItemId()).orElse(null);
        if (menuItem == null) {
            return null;
        }

        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId()).orElse(null);

        FavoriteMenuItemResponse response = new FavoriteMenuItemResponse();
        response.id = favorite.getId();
        response.itemId = menuItem.getItemId();
        response.name = menuItem.getName();
        response.description = menuItem.getDescription();
        response.price = menuItem.getDiscountedPrice() != null ? menuItem.getDiscountedPrice() : menuItem.getPrice();
        response.basePrice = menuItem.getPrice();
        response.category = menuItem.getCategory();
        response.image = menuItem.getImage();
        response.vegetarian = menuItem.getVegetarian();
        response.vegan = menuItem.getVegan();
        response.discount = menuItem.getDiscount();
        response.restaurantId = restaurant != null ? restaurant.getRestaurantId() : null;
        response.restaurantName = restaurant != null ? restaurant.getName() : "Restaurant";
        response.restaurantImage = restaurant != null ? restaurant.getImage() : null;
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

    public static class FavoriteMenuItemResponse {
        public Long id;
        public String itemId;
        public String name;
        public String description;
        public Double price;
        public Double basePrice;
        public String category;
        public String image;
        public Boolean vegetarian;
        public Boolean vegan;
        public Double discount;
        public String restaurantId;
        public String restaurantName;
        public String restaurantImage;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
    }
}
