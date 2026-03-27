package com.foodhub.repository;

import com.foodhub.model.SavedPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPaymentMethodRepository extends JpaRepository<SavedPaymentMethod, Long> {

    List<SavedPaymentMethod> findByUserIdAndActiveTrueOrderByDefaultMethodDescUpdatedAtDesc(Long userId);

    Optional<SavedPaymentMethod> findByIdAndUserIdAndActiveTrue(Long id, Long userId);

    Optional<SavedPaymentMethod> findByUserIdAndDefaultMethodTrueAndActiveTrue(Long userId);
}
