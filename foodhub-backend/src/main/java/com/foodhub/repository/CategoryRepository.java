package com.foodhub.repository;

import com.foodhub.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByCategoryId(String categoryId);
    
    List<Category> findByActiveTrue();
    
    List<Category> findByFilter(String filter);
    
    Optional<Category> findByName(String name);
    
    boolean existsByCategoryId(String categoryId);
}