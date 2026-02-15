package com.foodhub.model;

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
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String restaurantId;

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

    @Column(length = 1000)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private LocalTime openingTime;

    @Column
    private LocalTime closingTime;

    @Column
    private Double minimumOrderAmount;

    @Column
    private Double deliveryFee;

    @Column
    private Double deliveryRadius;

    @Column
    private Integer averageDeliveryTime;

    @Column
    private Integer totalOrders = 0;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false)
    private Boolean popular = false;

    @Column(length = 500)
    private String tags;

    @Column(length = 500)
    private String paymentMethods;

    @Column(length = 500)
    private String website;

    @Column(length = 200)
    private String socialMedia;

    @Column(length = 100)
    private String ownerName;

    @Column(length = 20)
    private String licenseNumber;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Restaurant() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
    public void setIsOpen(Boolean isOpen) { this.isOpen = isOpen; }

    public Boolean getAcceptingOrders() { return acceptingOrders; }
    public void setAcceptingOrders(Boolean acceptingOrders) { this.acceptingOrders = acceptingOrders; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public Double getMinimumOrderAmount() { return minimumOrderAmount; }
    public void setMinimumOrderAmount(Double minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }

    public Double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee; }

    public Double getDeliveryRadius() { return deliveryRadius; }
    public void setDeliveryRadius(Double deliveryRadius) { this.deliveryRadius = deliveryRadius; }

    public Integer getAverageDeliveryTime() { return averageDeliveryTime; }
    public void setAverageDeliveryTime(Integer averageDeliveryTime) { this.averageDeliveryTime = averageDeliveryTime; }

    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getPaymentMethods() { return paymentMethods; }
    public void setPaymentMethods(String paymentMethods) { this.paymentMethods = paymentMethods; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getSocialMedia() { return socialMedia; }
    public void setSocialMedia(String socialMedia) { this.socialMedia = socialMedia; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public void incrementOrderCount() {
        this.totalOrders = (this.totalOrders == null ? 0 : this.totalOrders) + 1;
    }

    public void incrementReviewCount() {
        this.reviewCount = (this.reviewCount == null ? 0 : this.reviewCount) + 1;
    }

    public void updateRating(Double newRating) {
        if (newRating != null && newRating >= 0 && newRating <= 5) {
            if (this.reviewCount == null || this.reviewCount == 0) {
                this.rating = newRating;
            } else {
                Double totalRating = (this.rating * this.reviewCount) + newRating;
                this.rating = totalRating / (this.reviewCount + 1);
                this.rating = Math.round(this.rating * 100.0) / 100.0;
            }
        }
    }

    public boolean isCurrentlyOpen() {
        if (openingTime == null || closingTime == null) {
            return isOpen;
        }
        
        LocalTime now = LocalTime.now();
        
        if (closingTime.isBefore(openingTime)) {
            return !now.isBefore(openingTime) || !now.isAfter(closingTime);
        } else {
            return !now.isBefore(openingTime) && !now.isAfter(closingTime);
        }
    }

    public boolean canAcceptOrders() {
        return Boolean.TRUE.equals(active) && 
               Boolean.TRUE.equals(acceptingOrders) && 
               isCurrentlyOpen();
    }

    public String getFullAddress() {
        StringBuilder fullAddress = new StringBuilder();
        
        if (address != null && !address.isEmpty()) {
            fullAddress.append(address);
        }
        if (city != null && !city.isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(city);
        }
        if (state != null && !state.isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(state);
        }
        if (postalCode != null && !postalCode.isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(" ");
            fullAddress.append(postalCode);
        }
        if (country != null && !country.isEmpty()) {
            if (fullAddress.length() > 0) fullAddress.append(", ");
            fullAddress.append(country);
        }
        
        return fullAddress.toString();
    }

    public boolean hasLocation() {
        return latitude != null && longitude != null;
    }
}