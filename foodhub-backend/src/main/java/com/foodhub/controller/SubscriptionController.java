package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.User;
import com.foodhub.model.UserSubscription;
import com.foodhub.repository.UserRepository;
import com.foodhub.repository.UserSubscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private static final List<PlanDefinition> PLAN_DEFINITIONS = List.of(
            new PlanDefinition(
                    "LITE",
                    "Snap Lite",
                    "Free delivery on orders above Rs 149 and 10% extra discount on partner restaurants.",
                    "Starter savings",
                    49.0,
                    10,
                    50.0,
                    149.0
            ),
            new PlanDefinition(
                    "PLUS",
                    "Snap Plus",
                    "Free delivery on all eligible orders and 15% member discount up to Rs 80 per order.",
                    "Most popular",
                    99.0,
                    15,
                    80.0,
                    99.0
            ),
            new PlanDefinition(
                    "MAX",
                    "Snap Max",
                    "Premium support, free delivery, and 20% discount up to Rs 120 on every order.",
                    "Best value",
                    149.0,
                    20,
                    120.0,
                    99.0
            )
    );

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public SubscriptionController(UserRepository userRepository,
                                  UserSubscriptionRepository userSubscriptionRepository) {
        this.userRepository = userRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<PlanView>> getPlans() {
        List<PlanView> plans = PLAN_DEFINITIONS.stream()
                .map(PlanView::from)
                .toList();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMySubscription(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            return userSubscriptionRepository.findByUserId(user.getId())
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.ok(Map.of(
                            "active", false,
                            "autoRenew", false,
                            "message", "No active membership yet"
                    )));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch membership: " + e.getMessage()));
        }
    }

    @PostMapping("/me/activate")
    public ResponseEntity<?> activateSubscription(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                  @RequestBody ActivateSubscriptionRequest request) {
        try {
            User user = resolveRequestUser(userId);
            if (request == null || isBlank(request.planCode)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan code is required"));
            }

            PlanDefinition selectedPlan = findPlanDefinition(request.planCode)
                    .orElse(null);
            if (selectedPlan == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid subscription plan"));
            }

            UserSubscription subscription = userSubscriptionRepository.findByUserId(user.getId())
                    .orElseGet(UserSubscription::new);

            LocalDateTime now = LocalDateTime.now();
            subscription.setUserId(user.getId());
            subscription.setPlanCode(selectedPlan.planCode());
            subscription.setPlanName(selectedPlan.name());
            subscription.setDescription(selectedPlan.description());
            subscription.setMonthlyPrice(selectedPlan.monthlyPrice());
            subscription.setDiscountPercent(selectedPlan.discountPercent());
            subscription.setMaxDiscountPerOrder(selectedPlan.maxDiscountPerOrder());
            subscription.setMinOrderForFreeDelivery(selectedPlan.minOrderForFreeDelivery());
            subscription.setActive(true);
            subscription.setAutoRenew(request.autoRenew == null || request.autoRenew);
            subscription.setStartsAt(now);
            subscription.setNextBillingAt(now.plusDays(30));
            subscription.setCancelledAt(null);

            UserSubscription saved = userSubscriptionRepository.save(subscription);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to activate membership: " + e.getMessage()));
        }
    }

    @PatchMapping("/me/cancel")
    public ResponseEntity<?> cancelSubscription(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            UserSubscription subscription = userSubscriptionRepository.findByUserIdAndActiveTrue(user.getId())
                    .orElse(null);
            if (subscription == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No active membership found"));
            }

            subscription.setActive(false);
            subscription.setAutoRenew(false);
            subscription.setCancelledAt(LocalDateTime.now());
            UserSubscription saved = userSubscriptionRepository.save(subscription);
            return ResponseEntity.ok(Map.of(
                    "message", "Membership cancelled successfully",
                    "subscription", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel membership: " + e.getMessage()));
        }
    }

    private Optional<PlanDefinition> findPlanDefinition(String planCode) {
        String normalizedPlanCode = planCode.trim().toUpperCase(Locale.ROOT);
        return PLAN_DEFINITIONS.stream()
                .filter(plan -> plan.planCode().equals(normalizedPlanCode))
                .findFirst();
    }

    private User resolveRequestUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not available"));
        }
        return userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Guest user not available"));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static class ActivateSubscriptionRequest {
        public String planCode;
        public Boolean autoRenew;
    }

    private record PlanDefinition(String planCode,
                                  String name,
                                  String description,
                                  String highlight,
                                  Double monthlyPrice,
                                  Integer discountPercent,
                                  Double maxDiscountPerOrder,
                                  Double minOrderForFreeDelivery) {
    }

    public record PlanView(String planCode,
                           String name,
                           String description,
                           String highlight,
                           Double monthlyPrice,
                           Integer discountPercent,
                           Double maxDiscountPerOrder,
                           Double minOrderForFreeDelivery) {
        private static PlanView from(PlanDefinition plan) {
            return new PlanView(
                    plan.planCode(),
                    plan.name(),
                    plan.description(),
                    plan.highlight(),
                    plan.monthlyPrice(),
                    plan.discountPercent(),
                    plan.maxDiscountPerOrder(),
                    plan.minOrderForFreeDelivery()
            );
        }
    }
}
