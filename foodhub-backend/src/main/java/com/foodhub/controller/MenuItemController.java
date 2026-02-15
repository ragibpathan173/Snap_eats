package com.foodhub.controller;

import com.foodhub.model.MenuItem;
import com.foodhub.repository.MenuItemRepository;
import com.foodhub.repository.RestaurantRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")
public class MenuItemController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    // ===== CREATE =====
    
    @PostMapping
    public ResponseEntity<?> createMenuItem(@Valid @RequestBody MenuItem menuItem) {
        try {
            // Verify restaurant exists
            if (!restaurantRepository.existsById(menuItem.getRestaurantId())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Restaurant not found with id: " + menuItem.getRestaurantId()));
            }

            // Check if itemId already exists
            if (menuItem.getItemId() != null && menuItemRepository.existsByItemId(menuItem.getItemId())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Menu item with this ID already exists"));
            }

            // Generate itemId if not provided
            if (menuItem.getItemId() == null || menuItem.getItemId().isEmpty()) {
                menuItem.setItemId("ITEM_" + System.currentTimeMillis());
            }

            MenuItem savedItem = menuItemRepository.save(menuItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create menu item: " + e.getMessage()));
        }
    }

    // ===== READ - All Menu Items =====
    
    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        try {
            List<MenuItem> menuItems = menuItemRepository.findAll();
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===== READ - Menu Item by ID =====
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable Long id) {
        try {
            Optional<MenuItem> menuItem = menuItemRepository.findById(id);
            if (menuItem.isPresent()) {
                return ResponseEntity.ok(menuItem.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch menu item: " + e.getMessage()));
        }
    }

    // ===== READ - Menu Item by Item ID =====
    
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getMenuItemByItemId(@PathVariable String itemId) {
        try {
            Optional<MenuItem> menuItem = menuItemRepository.findByItemId(itemId);
            if (menuItem.isPresent()) {
                return ResponseEntity.ok(menuItem.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with itemId: " + itemId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch menu item: " + e.getMessage()));
        }
    }

    // ===== READ - Menu Items by Restaurant =====
    
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getMenuItemsByRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly,
            @RequestParam(required = false, defaultValue = "false") Boolean availableOnly,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size,
            @RequestParam(required = false) String sortBy) {
        try {
            Pageable pageable;
            if (sortBy != null) {
                Sort sort;
                switch (sortBy.toLowerCase()) {
                    case "price_asc":
                        sort = Sort.by("price").ascending();
                        break;
                    case "price_desc":
                        sort = Sort.by("price").descending();
                        break;
                    case "rating":
                        sort = Sort.by("rating").descending();
                        break;
                    case "name":
                        sort = Sort.by("name").ascending();
                        break;
                    case "popular":
                        sort = Sort.by("orderCount").descending();
                        break;
                    default:
                        sort = Sort.by("id").ascending();
                }
                pageable = PageRequest.of(page, size, sort);
            } else {
                pageable = PageRequest.of(page, size);
            }

            Page<MenuItem> menuItems;
            if (activeOnly && availableOnly) {
                menuItems = menuItemRepository.findByRestaurantIdAndActiveTrueAndAvailableTrue(restaurantId, pageable);
            } else if (activeOnly) {
                menuItems = menuItemRepository.findByRestaurantIdAndActiveTrue(restaurantId, pageable);
            } else {
                menuItems = menuItemRepository.findByRestaurantId(restaurantId, pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("items", menuItems.getContent());
            response.put("currentPage", menuItems.getNumber());
            response.put("totalItems", menuItems.getTotalElements());
            response.put("totalPages", menuItems.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch menu items: " + e.getMessage()));
        }
    }

    // ===== READ - Menu Items by Category =====
    
    @GetMapping("/restaurant/{restaurantId}/category/{category}")
    public ResponseEntity<?> getMenuItemsByCategory(
            @PathVariable Long restaurantId,
            @PathVariable String category,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly) {
        try {
            List<MenuItem> menuItems;
            if (activeOnly) {
                menuItems = menuItemRepository.findByRestaurantIdAndCategoryAndActiveTrue(restaurantId, category);
            } else {
                menuItems = menuItemRepository.findByRestaurantIdAndCategory(restaurantId, category);
            }
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch menu items: " + e.getMessage()));
        }
    }

    // ===== READ - Categories by Restaurant =====
    
    @GetMapping("/restaurant/{restaurantId}/categories")
    public ResponseEntity<?> getCategoriesByRestaurant(@PathVariable Long restaurantId) {
        try {
            List<String> categories = menuItemRepository.findDistinctCategoriesByRestaurantId(restaurantId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch categories: " + e.getMessage()));
        }
    }

    // ===== READ - Top Rated Items =====
    
    @GetMapping("/restaurant/{restaurantId}/top-rated")
    public ResponseEntity<?> getTopRatedItems(
            @PathVariable Long restaurantId,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            Page<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndActiveTrueOrderByRatingDesc(restaurantId, pageable);
            return ResponseEntity.ok(menuItems.getContent());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch top rated items: " + e.getMessage()));
        }
    }

    // ===== READ - Popular Items =====
    
    @GetMapping("/restaurant/{restaurantId}/popular")
    public ResponseEntity<?> getPopularItems(
            @PathVariable Long restaurantId,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<MenuItem> menuItems = menuItemRepository.findTopPopularItems(restaurantId, pageable);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch popular items: " + e.getMessage()));
        }
    }

    // ===== READ - Featured Items =====
    
    @GetMapping("/restaurant/{restaurantId}/featured")
    public ResponseEntity<?> getFeaturedItems(@PathVariable Long restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndFeaturedTrueAndActiveTrue(restaurantId);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch featured items: " + e.getMessage()));
        }
    }

    // ===== READ - Best Sellers =====
    
    @GetMapping("/restaurant/{restaurantId}/best-sellers")
    public ResponseEntity<?> getBestSellers(@PathVariable Long restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndBestSellerTrueAndActiveTrue(restaurantId);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch best sellers: " + e.getMessage()));
        }
    }

    // ===== READ - Dietary Preferences =====
    
    @GetMapping("/restaurant/{restaurantId}/vegetarian")
    public ResponseEntity<?> getVegetarianItems(@PathVariable Long restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndVegetarianTrueAndActiveTrue(restaurantId);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch vegetarian items: " + e.getMessage()));
        }
    }

    @GetMapping("/restaurant/{restaurantId}/vegan")
    public ResponseEntity<?> getVeganItems(@PathVariable Long restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndVeganTrueAndActiveTrue(restaurantId);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch vegan items: " + e.getMessage()));
        }
    }

    @GetMapping("/restaurant/{restaurantId}/gluten-free")
    public ResponseEntity<?> getGlutenFreeItems(@PathVariable Long restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndGlutenFreeTrueAndActiveTrue(restaurantId);
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch gluten-free items: " + e.getMessage()));
        }
    }

    // ===== SEARCH =====
    
    @GetMapping("/search")
    public ResponseEntity<?> searchMenuItems(
            @RequestParam String query,
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MenuItem> menuItems;
            
            if (restaurantId != null) {
                menuItems = menuItemRepository.searchMenuItemsByRestaurant(restaurantId, query, pageable);
            } else {
                menuItems = menuItemRepository.searchMenuItems(query, pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("items", menuItems.getContent());
            response.put("currentPage", menuItems.getNumber());
            response.put("totalItems", menuItems.getTotalElements());
            response.put("totalPages", menuItems.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to search menu items: " + e.getMessage()));
        }
    }

    // ===== FILTER =====
    
    @GetMapping("/restaurant/{restaurantId}/filter")
    public ResponseEntity<?> filterMenuItems(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean vegetarian,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MenuItem> menuItems = menuItemRepository.findByMultipleCriteria(
                restaurantId, category, vegetarian, vegan, glutenFree, 
                minPrice, maxPrice, minRating, pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("items", menuItems.getContent());
            response.put("currentPage", menuItems.getNumber());
            response.put("totalItems", menuItems.getTotalElements());
            response.put("totalPages", menuItems.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to filter menu items: " + e.getMessage()));
        }
    }

    // ===== UPDATE =====
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItem menuItemDetails) {
        try {
            Optional<MenuItem> optionalMenuItem = menuItemRepository.findById(id);
            
            if (optionalMenuItem.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with id: " + id));
            }

            MenuItem existingMenuItem = optionalMenuItem.get();

            // Update fields
            if (menuItemDetails.getName() != null) {
                existingMenuItem.setName(menuItemDetails.getName());
            }
            if (menuItemDetails.getDescription() != null) {
                existingMenuItem.setDescription(menuItemDetails.getDescription());
            }
            if (menuItemDetails.getPrice() != null) {
                existingMenuItem.setPrice(menuItemDetails.getPrice());
            }
            if (menuItemDetails.getCategory() != null) {
                existingMenuItem.setCategory(menuItemDetails.getCategory());
            }
            if (menuItemDetails.getImage() != null) {
                existingMenuItem.setImage(menuItemDetails.getImage());
            }
            if (menuItemDetails.getVegetarian() != null) {
                existingMenuItem.setVegetarian(menuItemDetails.getVegetarian());
            }
            if (menuItemDetails.getVegan() != null) {
                existingMenuItem.setVegan(menuItemDetails.getVegan());
            }
            if (menuItemDetails.getGlutenFree() != null) {
                existingMenuItem.setGlutenFree(menuItemDetails.getGlutenFree());
            }
            if (menuItemDetails.getSpicy() != null) {
                existingMenuItem.setSpicy(menuItemDetails.getSpicy());
            }
            if (menuItemDetails.getSpiceLevel() != null) {
                existingMenuItem.setSpiceLevel(menuItemDetails.getSpiceLevel());
            }
            if (menuItemDetails.getCalories() != null) {
                existingMenuItem.setCalories(menuItemDetails.getCalories());
            }
            if (menuItemDetails.getPrepTime() != null) {
                existingMenuItem.setPrepTime(menuItemDetails.getPrepTime());
            }
            if (menuItemDetails.getAvailable() != null) {
                existingMenuItem.setAvailable(menuItemDetails.getAvailable());
            }
            if (menuItemDetails.getActive() != null) {
                existingMenuItem.setActive(menuItemDetails.getActive());
            }
            if (menuItemDetails.getPortionSize() != null) {
                existingMenuItem.setPortionSize(menuItemDetails.getPortionSize());
            }
            if (menuItemDetails.getIngredients() != null) {
                existingMenuItem.setIngredients(menuItemDetails.getIngredients());
            }
            if (menuItemDetails.getAllergens() != null) {
                existingMenuItem.setAllergens(menuItemDetails.getAllergens());
            }
            if (menuItemDetails.getDiscount() != null) {
                existingMenuItem.setDiscount(menuItemDetails.getDiscount());
            }
            if (menuItemDetails.getDiscountedPrice() != null) {
                existingMenuItem.setDiscountedPrice(menuItemDetails.getDiscountedPrice());
            }
            if (menuItemDetails.getFeatured() != null) {
                existingMenuItem.setFeatured(menuItemDetails.getFeatured());
            }
            if (menuItemDetails.getBestSeller() != null) {
                existingMenuItem.setBestSeller(menuItemDetails.getBestSeller());
            }
            if (menuItemDetails.getTags() != null) {
                existingMenuItem.setTags(menuItemDetails.getTags());
            }
            if (menuItemDetails.getStockQuantity() != null) {
                existingMenuItem.setStockQuantity(menuItemDetails.getStockQuantity());
            }
            if (menuItemDetails.getIsLimitedStock() != null) {
                existingMenuItem.setIsLimitedStock(menuItemDetails.getIsLimitedStock());
            }

            MenuItem updatedMenuItem = menuItemRepository.save(existingMenuItem);
            return ResponseEntity.ok(updatedMenuItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update menu item: " + e.getMessage()));
        }
    }

    // ===== UPDATE - Availability =====
    
    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) {
        try {
            if (!menuItemRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with id: " + id));
            }

            menuItemRepository.updateAvailability(id, available);
            Optional<MenuItem> updatedItem = menuItemRepository.findById(id);
            
            return ResponseEntity.ok(updatedItem.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update availability: " + e.getMessage()));
        }
    }

    // ===== UPDATE - Stock =====
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            if (!menuItemRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with id: " + id));
            }

            menuItemRepository.updateStockQuantity(id, quantity);
            Optional<MenuItem> updatedItem = menuItemRepository.findById(id);
            
            return ResponseEntity.ok(updatedItem.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update stock: " + e.getMessage()));
        }
    }

    // ===== DELETE =====
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        try {
            if (!menuItemRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Menu item not found with id: " + id));
            }

            menuItemRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete menu item: " + e.getMessage()));
        }
    }

    // ===== DELETE - By Restaurant =====
    
    @DeleteMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> deleteMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        try {
            menuItemRepository.deleteByRestaurantId(restaurantId);
            return ResponseEntity.ok(Map.of("message", "All menu items deleted for restaurant: " + restaurantId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete menu items: " + e.getMessage()));
        }
    }

    // ===== STATISTICS =====
    
    @GetMapping("/restaurant/{restaurantId}/stats")
    public ResponseEntity<?> getMenuItemStats(@PathVariable Long restaurantId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalItems", menuItemRepository.countByRestaurantId(restaurantId));
            stats.put("activeItems", menuItemRepository.countByRestaurantIdAndActiveTrue(restaurantId));
            stats.put("availableItems", menuItemRepository.countByRestaurantIdAndAvailableTrue(restaurantId));
            stats.put("vegetarianItems", menuItemRepository.countByRestaurantIdAndVegetarianTrue(restaurantId));
            stats.put("veganItems", menuItemRepository.countByRestaurantIdAndVeganTrue(restaurantId));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    // ===== BULK OPERATIONS =====
    
    @PatchMapping("/restaurant/{restaurantId}/activate")
    public ResponseEntity<?> activateAllItems(@PathVariable Long restaurantId) {
        try {
            menuItemRepository.activateAllByRestaurantId(restaurantId);
            return ResponseEntity.ok(Map.of("message", "All menu items activated for restaurant: " + restaurantId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to activate items: " + e.getMessage()));
        }
    }

    @PatchMapping("/restaurant/{restaurantId}/deactivate")
    public ResponseEntity<?> deactivateAllItems(@PathVariable Long restaurantId) {
        try {
            menuItemRepository.deactivateAllByRestaurantId(restaurantId);
            return ResponseEntity.ok(Map.of("message", "All menu items deactivated for restaurant: " + restaurantId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to deactivate items: " + e.getMessage()));
        }
    }
}