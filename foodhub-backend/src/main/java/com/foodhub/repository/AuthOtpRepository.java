package com.foodhub.repository;

import com.foodhub.model.AuthOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthOtpRepository extends JpaRepository<AuthOtp, Long> {

    Optional<AuthOtp> findTopByIdentifierKeyAndConsumedFalseOrderByCreatedAtDesc(String identifierKey);

    List<AuthOtp> findByIdentifierKeyAndConsumedFalse(String identifierKey);

    void deleteByIdentifierKeyStartingWith(String prefix);
}
