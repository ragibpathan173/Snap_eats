package com.foodhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Configuration
 * Location: src/main/java/com/foodhub/config/JpaConfig.java
 * 
 * This enables automatic population of @CreatedDate and @LastModifiedDate fields
 */
@Configuration
public class JpaConfig {
    // This class enables JPA auditing for automatic timestamp management
}