package com.foodhub.repository;

import com.foodhub.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findTopByEmailAndConsumedFalseOrderByCreatedAtDesc(String email);

    List<PasswordResetOtp> findByEmailAndConsumedFalse(String email);

    void deleteByEmail(String email);
}
