package com.foodhub.repository;

import com.foodhub.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdAndActiveTrueOrderByDefaultAddressDescUpdatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserIdAndActiveTrue(Long id, Long userId);

    Optional<UserAddress> findByUserIdAndDefaultAddressTrueAndActiveTrue(Long userId);
}
