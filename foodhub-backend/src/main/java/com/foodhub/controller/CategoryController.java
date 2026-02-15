package com.foodhub.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodhub.model.Category;
import com.foodhub.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Load initial data from JSON file into database on startup
     * This runs only once when the application starts
     */
    @PostConstruct
    public void loadInitialData() {
        // Only load if database is empty
        if (categoryRepository.count() == 0) {
            try {
                InputStream inputStream = new ClassPathResource("data/categories.json").getInputStream();
                List<Category> categories = objectMapper.readValue(inputStream, new TypeReference<List<Category>>() {});
                categoryRepository.saveAll(categories);
                System.out.println("✅ Loaded " + categories.size() + " categories from JSON into database");
            } catch (IOException e) {
                System.err.println("❌ Error loading categories from JSON: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        List<Category> categories = categoryRepository.findByActiveTrue();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoryId/{categoryId}")
    public ResponseEntity<Category> getCategoryByCategoryId(@PathVariable String categoryId) {
        return categoryRepository.findByCategoryId(categoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter/{filter}")
    public ResponseEntity<Category> getCategoryByFilter(@PathVariable String filter) {
        return categoryRepository.findByFilter(filter)
                .stream()
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Category> getCategoryByName(@PathVariable String name) {
        return categoryRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}