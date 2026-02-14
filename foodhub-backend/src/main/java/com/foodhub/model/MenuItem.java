package com.foodhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(length = 500)
    private String image;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Boolean vegetarian = false;

    @Column(nullable = false)
    private Boolean vegan = false;

    @Column(nullable = false)
    private Boolean bestseller = false;

    @Column(nullable = false)
    private Boolean available = true;

    @Column
    private Integer preparationTime;

    @Column
    private Double rating = 0.0;

    @Column
    private Integer calories;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SpiceLevel spiceLevel;

    @Column(length = 500)
    private String allergens;

    @Column
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum SpiceLevel {
        MILD, MEDIUM, HOT, EXTRA_HOT
    }
}