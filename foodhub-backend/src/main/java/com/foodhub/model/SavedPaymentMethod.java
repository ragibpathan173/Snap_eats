package com.foodhub.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_payment_methods", indexes = {
        @Index(name = "idx_payment_user", columnList = "userId"),
        @Index(name = "idx_payment_default", columnList = "userId, defaultMethod"),
        @Index(name = "idx_payment_active", columnList = "userId, active")
})
@EntityListeners(AuditingEntityListener.class)
public class SavedPaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MethodType methodType;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(length = 120)
    private String cardHolderName;

    @Column(length = 40)
    private String cardBrand;

    @Column(length = 4)
    private String cardLast4;

    @Column(length = 2)
    private String expiryMonth;

    @Column(length = 4)
    private String expiryYear;

    @Column(length = 120)
    private String upiId;

    @Column(length = 80)
    private String walletProvider;

    @Column(nullable = false)
    private Boolean defaultMethod = false;

    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public MethodType getMethodType() { return methodType; }
    public void setMethodType(MethodType methodType) { this.methodType = methodType; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }

    public String getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(String expiryMonth) { this.expiryMonth = expiryMonth; }

    public String getExpiryYear() { return expiryYear; }
    public void setExpiryYear(String expiryYear) { this.expiryYear = expiryYear; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getWalletProvider() { return walletProvider; }
    public void setWalletProvider(String walletProvider) { this.walletProvider = walletProvider; }

    public Boolean getDefaultMethod() { return defaultMethod; }
    public void setDefaultMethod(Boolean defaultMethod) { this.defaultMethod = defaultMethod; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum MethodType {
        CARD, UPI, WALLET
    }
}
