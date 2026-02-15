package com.foodhub.repository;

import com.foodhub.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByRestaurantId(String restaurantId);

    List<Restaurant> findByActiveTrue();

    List<Restaurant> findByCategory(String category);

    // ✅ FIXED (removed Boolean parameter)
    List<Restaurant> findByCategoryAndActiveTrue(String category);

    List<Restaurant> findByVerifiedTrue();

    List<Restaurant> findByRatingGreaterThanEqual(Double rating);

    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Restaurant> searchRestaurants(@Param("searchTerm") String searchTerm);

    @Query("SELECT r FROM Restaurant r WHERE r.active = true ORDER BY r.rating DESC")
    List<Restaurant> findTopRatedRestaurants();

    boolean existsByRestaurantId(String restaurantId);
}
