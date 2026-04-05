package com.foodhub.controller;

import com.foodhub.config.GeneratedArtworkService;
import com.foodhub.model.MenuItem;
import com.foodhub.model.Restaurant;
import com.foodhub.repository.MenuItemRepository;
import com.foodhub.repository.RestaurantRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@CrossOrigin(origins = "*")
public class GeneratedImageController {

    private static final MediaType SVG_MEDIA_TYPE = MediaType.valueOf("image/svg+xml");

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final GeneratedArtworkService generatedArtworkService;

    public GeneratedImageController(RestaurantRepository restaurantRepository,
                                    MenuItemRepository menuItemRepository,
                                    GeneratedArtworkService generatedArtworkService) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.generatedArtworkService = generatedArtworkService;
    }

    @GetMapping(value = "/api/restaurants/{restaurantId}/image", produces = "image/svg+xml")
    public ResponseEntity<String> getRestaurantImage(@PathVariable String restaurantId) {
        Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId).orElse(null);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(SVG_MEDIA_TYPE)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(12)).cachePublic())
                .body(generatedArtworkService.buildRestaurantSvg(restaurant));
    }

    @GetMapping(value = "/api/menu-items/item/{itemId}/image", produces = "image/svg+xml")
    public ResponseEntity<String> getMenuItemImage(@PathVariable String itemId) {
        MenuItem menuItem = menuItemRepository.findByItemId(itemId).orElse(null);
        if (menuItem == null) {
            return ResponseEntity.notFound().build();
        }

        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId()).orElse(null);
        return ResponseEntity.ok()
                .contentType(SVG_MEDIA_TYPE)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(12)).cachePublic())
                .body(generatedArtworkService.buildMenuItemSvg(restaurant, menuItem));
    }
}
