package com.foodhub.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_category_id", columnList = "categoryId"),
    @Index(name = "idx_active_category", columnList = "active"),
    @Index(name = "idx_filter_category", columnList = "filter")
})
@EntityListeners(AuditingEntityListener.class)
public class Category {

    @Id
    @Column(length = 20)
    private String id;   // ✅ Changed from Long to String
                       // ✅ Removed @GeneratedValue

    @Column(unique = true, nullable = false, length = 50)
    private String categoryId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String image;

    @Column(length = 50)
    private String filter;

    @Column(length = 100)
    private String count;

    @Column(nullable = false)
    private Boolean active = true;

    @Column
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Category() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getFilter() { return filter; }
    public void setFilter(String filter) { this.filter = filter; }

    public String getCount() { return count; }
    public void setCount(String count) { this.count = count; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
