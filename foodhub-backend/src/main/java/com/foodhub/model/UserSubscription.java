package com.foodhub.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_subscriptions", indexes = {
        @Index(name = "idx_subscription_user", columnList = "userId"),
        @Index(name = "idx_subscription_active", columnList = "userId, active")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_subscription_user", columnNames = "userId")
})
@EntityListeners(AuditingEntityListener.class)
public class UserSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 40)
    private String planCode;

    @Column(nullable = false, length = 120)
    private String planName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double monthlyPrice;

    @Column(nullable = false)
    private Integer discountPercent;

    @Column(nullable = false)
    private Double maxDiscountPerOrder;

    @Column(nullable = false)
    private Double minOrderForFreeDelivery;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean autoRenew = true;

    @Column(nullable = false)
    private LocalDateTime startsAt;

    private LocalDateTime nextBillingAt;

    private LocalDateTime cancelledAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(Double monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public Integer getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Integer discountPercent) {
        this.discountPercent = discountPercent;
    }

    public Double getMaxDiscountPerOrder() {
        return maxDiscountPerOrder;
    }

    public void setMaxDiscountPerOrder(Double maxDiscountPerOrder) {
        this.maxDiscountPerOrder = maxDiscountPerOrder;
    }

    public Double getMinOrderForFreeDelivery() {
        return minOrderForFreeDelivery;
    }

    public void setMinOrderForFreeDelivery(Double minOrderForFreeDelivery) {
        this.minOrderForFreeDelivery = minOrderForFreeDelivery;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    public LocalDateTime getNextBillingAt() {
        return nextBillingAt;
    }

    public void setNextBillingAt(LocalDateTime nextBillingAt) {
        this.nextBillingAt = nextBillingAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
