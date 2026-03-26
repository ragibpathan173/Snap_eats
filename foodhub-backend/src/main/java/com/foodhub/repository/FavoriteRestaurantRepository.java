package com.foodhub.repository;

import com.foodhub.model.FavoriteRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRestaurantRepository extends JpaRepository<FavoriteRestaurant, Long> {

    List<FavoriteRestaurant> findByUserIdAndActiveTrueOrderByUpdatedAtDesc(Long userId);

    Optional<FavoriteRestaurant> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

    Optional<FavoriteRestaurant> findByUserIdAndRestaurantIdAndActiveTrue(Long userId, Long restaurantId);
}
