package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.User;
import com.foodhub.model.UserAddress;
import com.foodhub.repository.UserAddressRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class UserAddressController {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;

    public UserAddressController(UserRepository userRepository, UserAddressRepository userAddressRepository) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAddresses(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            List<UserAddress> addresses = userAddressRepository.findByUserIdAndActiveTrueOrderByDefaultAddressDescUpdatedAtDesc(user.getId());
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch addresses: " + e.getMessage()));
        }
    }

    @GetMapping("/default")
    public ResponseEntity<?> getDefaultAddress(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            return userAddressRepository.findByUserIdAndDefaultAddressTrueAndActiveTrue(user.getId())
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "No default address available")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch default address: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                           @RequestBody AddressRequest request) {
        try {
            User user = resolveRequestUser(userId);
            String validationError = validateRequest(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            UserAddress address = new UserAddress();
            populateAddress(address, request, user.getId());

            if (Boolean.TRUE.equals(request.defaultAddress)
                    || userAddressRepository.findByUserIdAndDefaultAddressTrueAndActiveTrue(user.getId()).isEmpty()) {
                clearDefaultAddress(user.getId());
                address.setDefaultAddress(true);
            }

            UserAddress saved = userAddressRepository.save(address);
            syncUserProfile(user, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save address: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                           @PathVariable Long id,
                                           @RequestBody AddressRequest request) {
        try {
            User user = resolveRequestUser(userId);
            String validationError = validateRequest(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            UserAddress address = userAddressRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Address not found"));
            }

            populateAddress(address, request, user.getId());
            if (Boolean.TRUE.equals(request.defaultAddress)) {
                clearDefaultAddress(user.getId());
                address.setDefaultAddress(true);
            }

            UserAddress saved = userAddressRepository.save(address);
            if (Boolean.TRUE.equals(saved.getDefaultAddress())) {
                syncUserProfile(user, saved);
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update address: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);
            UserAddress address = userAddressRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Address not found"));
            }

            clearDefaultAddress(user.getId());
            address.setDefaultAddress(true);
            UserAddress saved = userAddressRepository.save(address);
            syncUserProfile(user, saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update default address: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                           @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);
            UserAddress address = userAddressRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Address not found"));
            }

            boolean wasDefault = Boolean.TRUE.equals(address.getDefaultAddress());
            address.setActive(false);
            address.setDefaultAddress(false);
            userAddressRepository.save(address);

            if (wasDefault) {
                userAddressRepository.findByUserIdAndActiveTrueOrderByDefaultAddressDescUpdatedAtDesc(user.getId())
                        .stream()
                        .findFirst()
                        .ifPresent(next -> {
                            clearDefaultAddress(user.getId());
                            next.setDefaultAddress(true);
                            userAddressRepository.save(next);
                            syncUserProfile(user, next);
                        });
            }

            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete address: " + e.getMessage()));
        }
    }

    private User resolveRequestUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not available"));
        }
        return userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Guest user not available"));
    }

    private void populateAddress(UserAddress address, AddressRequest request, Long userId) {
        address.setUserId(userId);
        address.setLabel(request.label.trim());
        address.setRecipientName(request.recipientName.trim());
        address.setPhoneNumber(request.phoneNumber.trim());
        address.setAddressLine(request.addressLine.trim());
        address.setLandmark(request.landmark == null ? null : request.landmark.trim());
        address.setCity(request.city.trim());
        address.setState(request.state.trim());
        address.setPincode(request.pincode.trim());
        address.setActive(true);
    }

    private void clearDefaultAddress(Long userId) {
        userAddressRepository.findByUserIdAndDefaultAddressTrueAndActiveTrue(userId)
                .ifPresent(existing -> {
                    existing.setDefaultAddress(false);
                    userAddressRepository.save(existing);
                });
    }

    private void syncUserProfile(User user, UserAddress address) {
        user.setName(address.getRecipientName());
        user.setPhoneNumber(address.getPhoneNumber());
        user.setAddress(formatAddress(address));
        user.setCity(address.getCity());
        user.setState(address.getState());
        user.setPincode(address.getPincode());
        userRepository.save(user);
    }

    private String formatAddress(UserAddress address) {
        StringBuilder builder = new StringBuilder(address.getAddressLine());
        if (address.getLandmark() != null && !address.getLandmark().isBlank()) {
            builder.append(", ").append(address.getLandmark());
        }
        builder.append(", ").append(address.getCity());
        builder.append(", ").append(address.getState());
        builder.append(" ").append(address.getPincode());
        return builder.toString();
    }

    private String validateRequest(AddressRequest request) {
        if (request == null) {
            return "Address details are required";
        }
        if (isBlank(request.label) || isBlank(request.recipientName) || isBlank(request.phoneNumber)
                || isBlank(request.addressLine) || isBlank(request.city)
                || isBlank(request.state) || isBlank(request.pincode)) {
            return "Label, recipient, phone, address, city, state, and pincode are required";
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static class AddressRequest {
        public String label;
        public String recipientName;
        public String phoneNumber;
        public String addressLine;
        public String landmark;
        public String city;
        public String state;
        public String pincode;
        public Boolean defaultAddress;
    }
}
