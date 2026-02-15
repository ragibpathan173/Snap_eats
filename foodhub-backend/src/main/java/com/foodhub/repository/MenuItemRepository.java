package com.foodhub.repository;

import com.foodhub.model.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long>, JpaSpecificationExecutor<MenuItem> {
    
    // ===== Basic Queries =====
    
    Optional<MenuItem> findByItemId(String itemId);
    
    boolean existsByItemId(String itemId);
    
    // ===== Restaurant-based Queries =====
    
    List<MenuItem> findByRestaurantId(Long restaurantId);
    
    Page<MenuItem> findByRestaurantId(Long restaurantId, Pageable pageable);
    
    List<MenuItem> findByRestaurantIdAndActiveTrue(Long restaurantId);
    
    Page<MenuItem> findByRestaurantIdAndActiveTrue(Long restaurantId, Pageable pageable);
    
    List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueAndAvailableTrue(Long restaurantId);
    
    Page<MenuItem> findByRestaurantIdAndActiveTrueAndAvailableTrue(Long restaurantId, Pageable pageable);
    
    // ===== Category-based Queries =====
    
    List<MenuItem> findByRestaurantIdAndCategory(Long restaurantId, String category);
    
    List<MenuItem> findByRestaurantIdAndCategoryAndActiveTrue(Long restaurantId, String category);
    
    List<MenuItem> findByRestaurantIdAndCategoryAndActiveTrueAndAvailableTrue(Long restaurantId, String category);
    
    @Query("SELECT DISTINCT m.category FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true")
    List<String> findDistinctCategoriesByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // ===== Dietary Preference Queries =====
    
    List<MenuItem> findByRestaurantIdAndVegetarianTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndVegetarianTrueAndActiveTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndVeganTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndVeganTrueAndActiveTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndGlutenFreeTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndGlutenFreeTrueAndActiveTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndSpicyTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndSpiceLevel(Long restaurantId, String spiceLevel);
    
    // ===== Price-based Queries =====
    
    List<MenuItem> findByRestaurantIdAndPriceBetween(Long restaurantId, Double minPrice, Double maxPrice);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueAndPriceBetween(Long restaurantId, Double minPrice, Double maxPrice);
    
    List<MenuItem> findByRestaurantIdAndPriceLessThanEqual(Long restaurantId, Double maxPrice);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.discount > 0 AND m.active = true")
    List<MenuItem> findDiscountedItems(@Param("restaurantId") Long restaurantId);
    
    // ===== Search Queries =====
    
    @Query("SELECT m FROM MenuItem m WHERE m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<MenuItem> searchMenuItems(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT m FROM MenuItem m WHERE m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<MenuItem> searchMenuItems(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<MenuItem> searchMenuItemsByRestaurant(@Param("restaurantId") Long restaurantId, 
                                                @Param("searchTerm") String searchTerm);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<MenuItem> searchMenuItemsByRestaurant(@Param("restaurantId") Long restaurantId, 
                                                @Param("searchTerm") String searchTerm,
                                                Pageable pageable);
    
    // ===== Popularity & Rating Queries =====
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true " +
           "ORDER BY m.orderCount DESC")
    List<MenuItem> findPopularItems(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true " +
           "ORDER BY m.orderCount DESC")
    List<MenuItem> findTopPopularItems(@Param("restaurantId") Long restaurantId, Pageable pageable);
    
    // Fixed method name to match controller usage
    List<MenuItem> findByRestaurantIdOrderByRatingDesc(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueOrderByRatingDesc(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueAndRatingGreaterThanEqual(Long restaurantId, Double minRating);
    
    // Keep the old method name for backward compatibility
    List<MenuItem> findByRestaurantIdAndRatingGreaterThanEqual(Long restaurantId, Double minRating);
    
    Page<MenuItem> findByRestaurantIdAndActiveTrueOrderByRatingDesc(Long restaurantId, Pageable pageable);
    
    List<MenuItem> findByRestaurantIdAndBestSellerTrueAndActiveTrue(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndFeaturedTrueAndActiveTrue(Long restaurantId);
    
    // ===== Sorting Queries =====
    
    List<MenuItem> findByRestaurantIdAndActiveTrueOrderByPriceAsc(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueOrderByPriceDesc(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueOrderByNameAsc(Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndActiveTrueOrderByCreatedAtDesc(Long restaurantId);
    
    // ===== Count Queries =====
    
    Long countByRestaurantId(Long restaurantId);
    
    Long countByRestaurantIdAndActiveTrue(Long restaurantId);
    
    Long countByRestaurantIdAndAvailableTrue(Long restaurantId);
    
    Long countByRestaurantIdAndCategory(Long restaurantId, String category);
    
    Long countByRestaurantIdAndVegetarianTrue(Long restaurantId);
    
    Long countByRestaurantIdAndVeganTrue(Long restaurantId);
    
    // ===== Advanced Queries =====
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND " +
           "m.isLimitedStock = true AND m.stockQuantity <= :threshold AND m.active = true")
    List<MenuItem> findLowStockItems(@Param("restaurantId") Long restaurantId, 
                                     @Param("threshold") Integer threshold);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND " +
           "m.isLimitedStock = true AND (m.stockQuantity IS NULL OR m.stockQuantity = 0) AND m.active = true")
    List<MenuItem> findOutOfStockItems(@Param("restaurantId") Long restaurantId);
    
    List<MenuItem> findByRestaurantIdAndCaloriesBetween(Long restaurantId, Integer minCalories, Integer maxCalories);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND " +
           "(m.allergens IS NULL OR m.allergens = '') AND m.active = true")
    List<MenuItem> findItemsWithoutAllergens(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true " +
           "AND (:category IS NULL OR m.category = :category) " +
           "AND (:vegetarian IS NULL OR m.vegetarian = :vegetarian) " +
           "AND (:vegan IS NULL OR m.vegan = :vegan) " +
           "AND (:glutenFree IS NULL OR m.glutenFree = :glutenFree) " +
           "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR m.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR m.rating >= :minRating)")
    List<MenuItem> findByMultipleCriteria(
            @Param("restaurantId") Long restaurantId,
            @Param("category") String category,
            @Param("vegetarian") Boolean vegetarian,
            @Param("vegan") Boolean vegan,
            @Param("glutenFree") Boolean glutenFree,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating
    );
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = true " +
           "AND (:category IS NULL OR m.category = :category) " +
           "AND (:vegetarian IS NULL OR m.vegetarian = :vegetarian) " +
           "AND (:vegan IS NULL OR m.vegan = :vegan) " +
           "AND (:glutenFree IS NULL OR m.glutenFree = :glutenFree) " +
           "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR m.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR m.rating >= :minRating)")
    Page<MenuItem> findByMultipleCriteria(
            @Param("restaurantId") Long restaurantId,
            @Param("category") String category,
            @Param("vegetarian") Boolean vegetarian,
            @Param("vegan") Boolean vegan,
            @Param("glutenFree") Boolean glutenFree,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );
    
    // ===== Bulk Update Queries =====
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.available = :available WHERE m.id = :id")
    void updateAvailability(@Param("id") Long id, @Param("available") Boolean available);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.stockQuantity = :quantity WHERE m.id = :id")
    void updateStockQuantity(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.orderCount = m.orderCount + 1 WHERE m.id = :id")
    void incrementOrderCount(@Param("id") Long id);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.active = false WHERE m.restaurantId = :restaurantId")
    void deactivateAllByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.active = true WHERE m.restaurantId = :restaurantId")
    void activateAllByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // ===== Delete Queries =====
    
    @Transactional
    void deleteByRestaurantId(Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM MenuItem m WHERE m.restaurantId = :restaurantId AND m.active = false")
    void deleteInactiveItems(@Param("restaurantId") Long restaurantId);
}