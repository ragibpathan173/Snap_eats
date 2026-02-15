package com.foodhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "restaurants", indexes = {
        @Index(name = "idx_restaurant_id", columnList = "restaurantId"),
        @Index(name = "idx_active", columnList = "active"),
        @Index(name = "idx_verified", columnList = "verified"),
        @Index(name = "idx_category", columnList = "category"),
        @Index(name = "idx_rating", columnList = "rating")
})
@EntityListeners(AuditingEntityListener.class)
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore // 🔥 Ignore JSON id completely
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String restaurantId;

    // 🔥 Map JSON "id" → restaurantId
    @JsonProperty("id")
    public void setJsonId(String jsonId) {
        this.restaurantId = jsonId;
    }

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String cuisine;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column
    private Integer reviewCount = 0;

    @Column(length = 50)
    private String time;

    @Column(length = 50)
    private String discount;

    @Column(length = 1000)
    private String image;

    @Column(length = 500)
    private String logo;

    @Column(length = 50)
    private String category;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean isOpen = false;

    @Column(nullable = false)
    private Boolean acceptingOrders = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Restaurant() {}

    // Getters & Setters

    public Long getId() { return id; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getDiscount() { return discount; }
    public void setDiscount(String discount) { this.discount = discount; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getIsOpen() { return isOpen; }
    public void setIsOpen(Boolean open) { isOpen = open; }

    public Boolean getAcceptingOrders() { return acceptingOrders; }
    public void setAcceptingOrders(Boolean acceptingOrders) { this.acceptingOrders = acceptingOrders; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
