package com.foodhub.repository;

import com.foodhub.model.FavoriteMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteMenuItemRepository extends JpaRepository<FavoriteMenuItem, Long> {

    List<FavoriteMenuItem> findByUserIdAndActiveTrueOrderByUpdatedAtDesc(Long userId);

    Optional<FavoriteMenuItem> findByUserIdAndMenuItemId(Long userId, Long menuItemId);

    Optional<FavoriteMenuItem> findByUserIdAndMenuItemIdAndActiveTrue(Long userId, Long menuItemId);
}
