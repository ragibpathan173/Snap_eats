package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.SavedPaymentMethod;
import com.foodhub.model.User;
import com.foodhub.repository.SavedPaymentMethodRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/methods")
@CrossOrigin(origins = "*")
public class SavedPaymentMethodController {

    private final UserRepository userRepository;
    private final SavedPaymentMethodRepository savedPaymentMethodRepository;

    public SavedPaymentMethodController(UserRepository userRepository,
                                        SavedPaymentMethodRepository savedPaymentMethodRepository) {
        this.userRepository = userRepository;
        this.savedPaymentMethodRepository = savedPaymentMethodRepository;
    }

    @GetMapping
    public ResponseEntity<?> getPaymentMethods(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            List<SavedPaymentMethod> methods = savedPaymentMethodRepository
                    .findByUserIdAndActiveTrueOrderByDefaultMethodDescUpdatedAtDesc(user.getId());
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch payment methods: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPaymentMethod(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                 @RequestBody PaymentMethodRequest request) {
        try {
            User user = resolveRequestUser(userId);
            String validationError = validateRequest(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            SavedPaymentMethod method = new SavedPaymentMethod();
            populateMethod(method, request, user.getId());

            if (Boolean.TRUE.equals(request.defaultMethod)
                    || savedPaymentMethodRepository.findByUserIdAndDefaultMethodTrueAndActiveTrue(user.getId()).isEmpty()) {
                clearDefaultMethod(user.getId());
                method.setDefaultMethod(true);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedPaymentMethodRepository.save(method));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save payment method: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentMethod(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                 @PathVariable Long id,
                                                 @RequestBody PaymentMethodRequest request) {
        try {
            User user = resolveRequestUser(userId);
            String validationError = validateRequest(request);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            SavedPaymentMethod method = savedPaymentMethodRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (method == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Payment method not found"));
            }

            populateMethod(method, request, user.getId());
            if (Boolean.TRUE.equals(request.defaultMethod)) {
                clearDefaultMethod(user.getId());
                method.setDefaultMethod(true);
            }

            return ResponseEntity.ok(savedPaymentMethodRepository.save(method));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update payment method: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<?> setDefaultPaymentMethod(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                     @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);
            SavedPaymentMethod method = savedPaymentMethodRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (method == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Payment method not found"));
            }

            clearDefaultMethod(user.getId());
            method.setDefaultMethod(true);
            return ResponseEntity.ok(savedPaymentMethodRepository.save(method));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update default payment method: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaymentMethod(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                 @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);
            SavedPaymentMethod method = savedPaymentMethodRepository.findByIdAndUserIdAndActiveTrue(id, user.getId())
                    .orElse(null);
            if (method == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Payment method not found"));
            }

            boolean wasDefault = Boolean.TRUE.equals(method.getDefaultMethod());
            method.setActive(false);
            method.setDefaultMethod(false);
            savedPaymentMethodRepository.save(method);

            if (wasDefault) {
                savedPaymentMethodRepository.findByUserIdAndActiveTrueOrderByDefaultMethodDescUpdatedAtDesc(user.getId())
                        .stream()
                        .findFirst()
                        .ifPresent(next -> {
                            clearDefaultMethod(user.getId());
                            next.setDefaultMethod(true);
                            savedPaymentMethodRepository.save(next);
                        });
            }

            return ResponseEntity.ok(Map.of("message", "Payment method deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete payment method: " + e.getMessage()));
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

    private void populateMethod(SavedPaymentMethod method, PaymentMethodRequest request, Long userId) {
        SavedPaymentMethod.MethodType methodType = parseMethodType(request.methodType);
        method.setUserId(userId);
        method.setMethodType(methodType);
        method.setLabel(resolveLabel(request, methodType));
        method.setActive(true);

        if (methodType == SavedPaymentMethod.MethodType.CARD) {
            String digits = sanitizeDigits(request.cardNumber != null ? request.cardNumber : request.cardLast4);
            method.setCardLast4(lastFour(digits));
            method.setCardBrand(resolveCardBrand(digits, request.cardBrand));
            method.setCardHolderName(request.cardHolderName == null ? null : request.cardHolderName.trim());
            method.setExpiryMonth(normalizeTwoDigits(request.expiryMonth));
            method.setExpiryYear(normalizeYear(request.expiryYear));
            method.setUpiId(null);
            method.setWalletProvider(null);
        } else if (methodType == SavedPaymentMethod.MethodType.UPI) {
            method.setUpiId(request.upiId == null ? null : request.upiId.trim().toLowerCase(Locale.ROOT));
            method.setCardHolderName(null);
            method.setCardBrand(null);
            method.setCardLast4(null);
            method.setExpiryMonth(null);
            method.setExpiryYear(null);
            method.setWalletProvider(null);
        } else {
            method.setWalletProvider(request.walletProvider == null ? null : request.walletProvider.trim());
            method.setUpiId(null);
            method.setCardHolderName(null);
            method.setCardBrand(null);
            method.setCardLast4(null);
            method.setExpiryMonth(null);
            method.setExpiryYear(null);
        }
    }

    private void clearDefaultMethod(Long userId) {
        savedPaymentMethodRepository.findByUserIdAndDefaultMethodTrueAndActiveTrue(userId)
                .ifPresent(existing -> {
                    existing.setDefaultMethod(false);
                    savedPaymentMethodRepository.save(existing);
                });
    }

    private String validateRequest(PaymentMethodRequest request) {
        if (request == null || isBlank(request.methodType)) {
            return "Payment type is required";
        }

        SavedPaymentMethod.MethodType methodType;
        try {
            methodType = parseMethodType(request.methodType);
        } catch (IllegalArgumentException ex) {
            return "Unsupported payment type";
        }

        if (methodType == SavedPaymentMethod.MethodType.CARD) {
            String digits = sanitizeDigits(request.cardNumber != null ? request.cardNumber : request.cardLast4);
            if (digits.length() < 4) {
                return "Enter a valid card number";
            }
            if (isBlank(request.cardHolderName) || isBlank(request.expiryMonth) || isBlank(request.expiryYear)) {
                return "Card holder name and expiry date are required";
            }
        } else if (methodType == SavedPaymentMethod.MethodType.UPI) {
            if (isBlank(request.upiId) || !request.upiId.contains("@")) {
                return "Enter a valid UPI ID";
            }
        } else if (isBlank(request.walletProvider)) {
            return "Wallet provider is required";
        }

        return null;
    }

    private SavedPaymentMethod.MethodType parseMethodType(String methodType) {
        return SavedPaymentMethod.MethodType.valueOf(methodType.trim().toUpperCase(Locale.ROOT));
    }

    private String resolveLabel(PaymentMethodRequest request, SavedPaymentMethod.MethodType methodType) {
        if (!isBlank(request.label)) {
            return request.label.trim();
        }
        if (methodType == SavedPaymentMethod.MethodType.CARD) {
            String digits = sanitizeDigits(request.cardNumber != null ? request.cardNumber : request.cardLast4);
            String brand = resolveCardBrand(digits, request.cardBrand);
            return brand + " ending " + lastFour(digits);
        }
        if (methodType == SavedPaymentMethod.MethodType.UPI) {
            return "UPI · " + request.upiId.trim().toLowerCase(Locale.ROOT);
        }
        return "Wallet · " + request.walletProvider.trim();
    }

    private String resolveCardBrand(String digits, String fallbackBrand) {
        if (!isBlank(fallbackBrand)) {
            return fallbackBrand.trim();
        }
        if (digits.startsWith("4")) {
            return "Visa";
        }
        if (digits.matches("^5[1-5].*")) {
            return "Mastercard";
        }
        if (digits.matches("^3[47].*")) {
            return "Amex";
        }
        if (digits.matches("^6(?:011|5).*")) {
            return "Discover";
        }
        if (digits.matches("^(506|508|60|65|81|82|353|356).*")) {
            return "RuPay";
        }
        return "Card";
    }

    private String sanitizeDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String lastFour(String digits) {
        if (digits == null || digits.isBlank()) {
            return "";
        }
        return digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
    }

    private String normalizeTwoDigits(String value) {
        String digits = sanitizeDigits(value);
        if (digits.isBlank()) {
            return null;
        }
        return digits.length() == 1 ? "0" + digits : digits.substring(0, Math.min(2, digits.length()));
    }

    private String normalizeYear(String value) {
        String digits = sanitizeDigits(value);
        if (digits.isBlank()) {
            return null;
        }
        if (digits.length() == 2) {
            return "20" + digits;
        }
        return digits.substring(0, Math.min(4, digits.length()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static class PaymentMethodRequest {
        public String methodType;
        public String label;
        public String cardHolderName;
        public String cardNumber;
        public String cardLast4;
        public String cardBrand;
        public String expiryMonth;
        public String expiryYear;
        public String upiId;
        public String walletProvider;
        public Boolean defaultMethod;
    }
}
