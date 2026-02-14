package com.foodhub.repository;

import com.foodhub.model.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    
    List<MenuCategory> findByRestaurantId(Long restaurantId);
    
    List<MenuCategory> findByRestaurantIdAndActiveTrue(Long restaurantId);
    
    List<MenuCategory> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
    
    boolean existsByRestaurantIdAndName(Long restaurantId, String name);
}
