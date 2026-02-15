package com.foodhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu_items", indexes = {
    @Index(name = "idx_item_id", columnList = "itemId"),
    @Index(name = "idx_restaurant_id", columnList = "restaurantId"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_active", columnList = "active")
})
@EntityListeners(AuditingEntityListener.class)
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String itemId;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(length = 50)
    private String category;

    @Column(length = 1000)
    private String image;

    @Column(nullable = false)
    private Boolean vegetarian = false;

    @Column(nullable = false)
    private Boolean vegan = false;

    @Column(nullable = false)
    private Boolean glutenFree = false;

    @Column(nullable = false)
    private Boolean spicy = false;

    @Column(length = 20)
    private String spiceLevel;

    @Column
    private Integer calories;

    @Column(length = 20)
    private String prepTime;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false)
    private Boolean active = true;

    @Column
    private Double rating = 0.0;

    @Column
    private Integer orderCount = 0;

    @Column
    private Integer reviewCount = 0;

    @Column(length = 50)
    private String portionSize;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String allergens;

    @Column
    private Double discount;

    @Column
    private Double discountedPrice;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false)
    private Boolean bestSeller = false;

    @Column(length = 500)
    private String tags;

    @Column
    private Integer stockQuantity;

    @Column(nullable = false)
    private Boolean isLimitedStock = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public MenuItem() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Boolean getVegetarian() { return vegetarian; }
    public void setVegetarian(Boolean vegetarian) { this.vegetarian = vegetarian; }

    public Boolean getVegan() { return vegan; }
    public void setVegan(Boolean vegan) { this.vegan = vegan; }

    public Boolean getGlutenFree() { return glutenFree; }
    public void setGlutenFree(Boolean glutenFree) { this.glutenFree = glutenFree; }

    public Boolean getSpicy() { return spicy; }
    public void setSpicy(Boolean spicy) { this.spicy = spicy; }

    public String getSpiceLevel() { return spiceLevel; }
    public void setSpiceLevel(String spiceLevel) { this.spiceLevel = spiceLevel; }

    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }

    public String getPrepTime() { return prepTime; }
    public void setPrepTime(String prepTime) { this.prepTime = prepTime; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getOrderCount() { return orderCount; }
    public void setOrderCount(Integer orderCount) { this.orderCount = orderCount; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getPortionSize() { return portionSize; }
    public void setPortionSize(String portionSize) { this.portionSize = portionSize; }

    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }

    public String getAllergens() { return allergens; }
    public void setAllergens(String allergens) { this.allergens = allergens; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(Double discountedPrice) { this.discountedPrice = discountedPrice; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getBestSeller() { return bestSeller; }
    public void setBestSeller(Boolean bestSeller) { this.bestSeller = bestSeller; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Boolean getIsLimitedStock() { return isLimitedStock; }
    public void setIsLimitedStock(Boolean isLimitedStock) { this.isLimitedStock = isLimitedStock; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    @PrePersist
    @PreUpdate
    public void calculateDiscountedPrice() {
        if (discount != null && discount > 0 && price != null) {
            this.discountedPrice = price - (price * discount / 100);
            this.discountedPrice = Math.round(this.discountedPrice * 100.0) / 100.0;
        } else {
            this.discountedPrice = price;
        }
    }
}