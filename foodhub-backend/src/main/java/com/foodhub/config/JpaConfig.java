package com.foodhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Configuration
 * 
 * This enables automatic population of @CreatedDate and @LastModifiedDate fields
 * in entities that use @EntityListeners(AuditingEntityListener.class)
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // JPA auditing is now enabled for automatic timestamp management
}