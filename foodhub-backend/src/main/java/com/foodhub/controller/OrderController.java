package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.Order;
import com.foodhub.model.OrderItem;
import com.foodhub.model.Restaurant;
import com.foodhub.model.User;
import com.foodhub.model.UserAddress;
import com.foodhub.model.UserSubscription;
import com.foodhub.repository.OrderItemRepository;
import com.foodhub.repository.OrderRepository;
import com.foodhub.repository.RestaurantRepository;
import com.foodhub.repository.UserAddressRepository;
import com.foodhub.repository.UserRepository;
import com.foodhub.repository.UserSubscriptionRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private static final double BASE_DELIVERY_FEE = 40.0;
    private static final Map<String, CouponRule> COUPON_RULES = Map.of(
            "WELCOME50", new CouponRule("WELCOME50", CouponType.FLAT, 50.0, 199.0, 50.0),
            "SNAP20", new CouponRule("SNAP20", CouponType.PERCENT, 20.0, 299.0, 120.0),
            "MEAL30", new CouponRule("MEAL30", CouponType.FLAT, 30.0, 149.0, 30.0)
    );

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    // ===== CREATE =====
    
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order) {
        try {
            // Generate order number if not provided
            if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
                order.setOrderNumber("ORD" + System.currentTimeMillis());
            }

            // Check if order number already exists
            if (orderRepository.existsByOrderNumber(order.getOrderNumber())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Order number already exists"));
            }

            // Calculate final amount
            double finalAmount = order.getTotalAmount() + order.getDeliveryFee() - order.getDiscount();
            order.setFinalAmount(finalAmount);

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                      @RequestBody CheckoutRequest request) {
        try {
            if (request == null || request.items == null || request.items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart items are required"));
            }

            Restaurant restaurant = resolveRestaurant(request);
            if (restaurant == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid restaurant reference is required"));
            }

            User checkoutUser = resolveRequestUser(userId);

            if (request.customerName != null && !request.customerName.isBlank()) {
                checkoutUser.setName(request.customerName.trim());
            }
            UserAddress deliveryAddress = resolveDeliveryAddress(request, checkoutUser);
            if (deliveryAddress == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please save a delivery address and choose a default one"));
            }

            checkoutUser.setPhoneNumber(deliveryAddress.getPhoneNumber());
            checkoutUser.setAddress(formatAddress(deliveryAddress));
            checkoutUser.setCity(deliveryAddress.getCity());
            checkoutUser.setState(deliveryAddress.getState());
            checkoutUser.setPincode(deliveryAddress.getPincode());
            userRepository.save(checkoutUser);

            double subtotal = request.items.stream()
                    .mapToDouble(item -> (item.price == null ? 0.0 : item.price) * Math.max(1, item.quantity == null ? 1 : item.quantity))
                    .sum();
            Optional<UserSubscription> activeSubscription = userSubscriptionRepository.findByUserIdAndActiveTrue(checkoutUser.getId());
            double deliveryFee = calculateDeliveryFee(subtotal, activeSubscription.orElse(null));
            double subscriptionDiscount = calculateSubscriptionDiscount(subtotal, activeSubscription.orElse(null));
            CouponEvaluation couponEvaluation = evaluateCoupon(subtotal, request.couponCode, checkoutUser.getId());
            if (couponEvaluation.errorMessage() != null && !couponEvaluation.errorMessage().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", couponEvaluation.errorMessage()));
            }
            double couponDiscount = couponEvaluation.discountAmount();
            double discount = subscriptionDiscount + couponDiscount;
            double finalAmount = Math.max(0.0, subtotal + deliveryFee - discount);

            Order order = new Order();
            order.setOrderNumber("ORD" + System.currentTimeMillis());
            order.setUserId(checkoutUser.getId());
            order.setRestaurantId(restaurant.getId());
            order.setTotalAmount(roundAmount(subtotal));
            order.setDeliveryFee(roundAmount(deliveryFee));
            order.setDiscount(roundAmount(discount));
            order.setFinalAmount(roundAmount(finalAmount));
            order.setPaymentMethod(parsePaymentMethod(request.paymentMethod));
            order.setPaymentStatus(order.getPaymentMethod() == Order.PaymentMethod.CASH
                    ? Order.PaymentStatus.PENDING
                    : Order.PaymentStatus.COMPLETED);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setDeliveryAddress(formatAddress(deliveryAddress));
            order.setContactNumber(deliveryAddress.getPhoneNumber());
            order.setSpecialInstructions(request.specialInstructions);
            order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(35));

            Order savedOrder = orderRepository.save(order);

            List<OrderItem> savedItems = new ArrayList<>();
            for (CheckoutItemRequest itemRequest : request.items) {
                OrderItem orderItem = new OrderItem();
                int quantity = Math.max(1, itemRequest.quantity == null ? 1 : itemRequest.quantity);
                double price = itemRequest.price == null ? 0.0 : itemRequest.price;
                orderItem.setOrderId(savedOrder.getId());
                orderItem.setItemName(itemRequest.name);
                orderItem.setQuantity(quantity);
                orderItem.setPrice(roundAmount(price));
                orderItem.setTotalPrice(roundAmount(price * quantity));
                orderItem.setCustomizations(itemRequest.notes);
                savedItems.add(orderItem);
            }
            orderItemRepository.saveAll(savedItems);

            Map<String, Object> response = new HashMap<>();
            response.put("order", savedOrder);
            response.put("items", savedItems);
            response.put("appliedCouponCode", couponEvaluation.couponCode());
            response.put("message", "Order placed successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to place order: " + e.getMessage()));
        }
    }

    // ===== READ =====
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Optional<Order> order = orderRepository.findById(id);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch order: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable Long id) {
        try {
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found with id: " + id));
            }
            return ResponseEntity.ok(orderItemRepository.findByOrderId(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch order items: " + e.getMessage()));
        }
    }

    @GetMapping("/order-number/{orderNumber}")
    public ResponseEntity<?> getOrderByOrderNumber(@PathVariable String orderNumber) {
        try {
            Optional<Order> order = orderRepository.findByOrderNumber(orderNumber);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found with order number: " + orderNumber));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch order: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long userId) {
        try {
            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getOrdersByRestaurant(@PathVariable Long restaurantId) {
        try {
            List<Order> orders = orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderRepository.findByStatus(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===== UPDATE =====
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @Valid @RequestBody Order orderDetails) {
        try {
            Optional<Order> optionalOrder = orderRepository.findById(id);
            
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found with id: " + id));
            }

            Order existingOrder = optionalOrder.get();

            if (orderDetails.getStatus() != null) {
                existingOrder.setStatus(orderDetails.getStatus());
            }
            if (orderDetails.getPaymentStatus() != null) {
                existingOrder.setPaymentStatus(orderDetails.getPaymentStatus());
            }
            if (orderDetails.getDeliveryAddress() != null) {
                existingOrder.setDeliveryAddress(orderDetails.getDeliveryAddress());
            }
            if (orderDetails.getSpecialInstructions() != null) {
                existingOrder.setSpecialInstructions(orderDetails.getSpecialInstructions());
            }
            if (orderDetails.getEstimatedDeliveryTime() != null) {
                existingOrder.setEstimatedDeliveryTime(orderDetails.getEstimatedDeliveryTime());
            }

            Order updatedOrder = orderRepository.save(existingOrder);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update order: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Optional<Order> optionalOrder = orderRepository.findById(id);
            
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found"));
            }

            Order order = optionalOrder.get();
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);

            // If delivered, set actual delivery time
            if (orderStatus == Order.OrderStatus.DELIVERED) {
                order.setActualDeliveryTime(LocalDateTime.now());
            }

            orderRepository.save(order);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update order status: " + e.getMessage()));
        }
    }

    // ===== DELETE =====
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found with id: " + id));
            }

            orderRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete order: " + e.getMessage()));
        }
    }

    // ===== STATISTICS =====
    
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserOrderStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOrders", orderRepository.countUserOrders(userId));
            stats.put("totalSpent", orderRepository.calculateUserTotalSpent(userId));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/restaurant/{restaurantId}/stats")
    public ResponseEntity<?> getRestaurantOrderStats(@PathVariable Long restaurantId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOrders", orderRepository.countRestaurantOrders(restaurantId));
            stats.put("totalRevenue", orderRepository.calculateRestaurantRevenue(restaurantId));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyOrders(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);

            List<OrderSummaryResponse> responses = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                    .stream()
                    .map(this::buildOrderSummary)
                    .toList();

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch your orders: " + e.getMessage()));
        }
    }

    @GetMapping("/mine/{id}")
    public ResponseEntity<?> getMyOrderById(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                            @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);

            Optional<Order> order = orderRepository.findById(id);
            if (order.isEmpty() || !order.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            return ResponseEntity.ok(buildOrderSummary(order.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch your order: " + e.getMessage()));
        }
    }

    @PatchMapping("/mine/{id}/cancel")
    public ResponseEntity<?> cancelMyOrder(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                           @PathVariable Long id) {
        try {
            User user = resolveRequestUser(userId);

            Optional<Order> optionalOrder = orderRepository.findById(id);
            if (optionalOrder.isEmpty() || !optionalOrder.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            Order order = optionalOrder.get();
            if (!(order.getStatus() == Order.OrderStatus.PENDING
                    || order.getStatus() == Order.OrderStatus.CONFIRMED)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only newly placed orders can be cancelled"));
            }

            order.setStatus(Order.OrderStatus.CANCELLED);
            if (order.getPaymentStatus() == Order.PaymentStatus.COMPLETED) {
                order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            }

            return ResponseEntity.ok(buildOrderSummary(orderRepository.save(order)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel your order: " + e.getMessage()));
        }
    }

    private Order.PaymentMethod parsePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return Order.PaymentMethod.CASH;
        }
        return Order.PaymentMethod.valueOf(paymentMethod.trim().toUpperCase());
    }

    private double roundAmount(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double calculateDeliveryFee(double subtotal, UserSubscription subscription) {
        if (subtotal <= 0) {
            return 0.0;
        }
        if (subscription == null || !Boolean.TRUE.equals(subscription.getActive())) {
            return BASE_DELIVERY_FEE;
        }

        double minOrderForFreeDelivery = subscription.getMinOrderForFreeDelivery() == null
                ? Double.MAX_VALUE
                : subscription.getMinOrderForFreeDelivery();
        return subtotal >= minOrderForFreeDelivery ? 0.0 : BASE_DELIVERY_FEE;
    }

    private double calculateSubscriptionDiscount(double subtotal, UserSubscription subscription) {
        if (subtotal <= 0 || subscription == null || !Boolean.TRUE.equals(subscription.getActive())) {
            return 0.0;
        }

        int discountPercent = subscription.getDiscountPercent() == null ? 0 : Math.max(0, subscription.getDiscountPercent());
        if (discountPercent <= 0) {
            return 0.0;
        }

        double rawDiscount = subtotal * discountPercent / 100.0;
        double maxDiscountCap = subscription.getMaxDiscountPerOrder() == null
                ? rawDiscount
                : Math.max(0.0, subscription.getMaxDiscountPerOrder());
        return Math.min(rawDiscount, maxDiscountCap);
    }

    private CouponEvaluation evaluateCoupon(double subtotal, String couponCode, Long userId) {
        if (subtotal <= 0) {
            return new CouponEvaluation(0.0, "", "");
        }

        String normalizedCode = normalizeCouponCode(couponCode);
        if (normalizedCode.isBlank()) {
            return new CouponEvaluation(0.0, "", "");
        }

        CouponRule couponRule = COUPON_RULES.get(normalizedCode);
        if (couponRule == null) {
            return new CouponEvaluation(0.0, "", "Invalid coupon code.");
        }
        if (subtotal < couponRule.minOrderAmount()) {
            return new CouponEvaluation(0.0, "", "Coupon requires minimum order of Rs " + roundAmount(couponRule.minOrderAmount()) + ".");
        }

        if ("WELCOME50".equals(normalizedCode)) {
            long existingOrders = orderRepository.countUserOrders(userId);
            if (existingOrders > 0) {
                return new CouponEvaluation(0.0, "", "WELCOME50 is valid only for new users.");
            }
        }

        if (couponRule.type() == CouponType.PERCENT) {
            double rawDiscount = subtotal * (couponRule.discountValue() / 100.0);
            return new CouponEvaluation(Math.min(rawDiscount, couponRule.maxDiscountAmount()), normalizedCode, "");
        }
        return new CouponEvaluation(Math.min(couponRule.discountValue(), couponRule.maxDiscountAmount()), normalizedCode, "");
    }

    private String normalizeCouponCode(String couponCode) {
        return couponCode == null ? "" : couponCode.trim().toUpperCase(Locale.ROOT);
    }

    private Restaurant resolveRestaurant(CheckoutRequest request) {
        if (request.restaurantId != null) {
            return restaurantRepository.findById(request.restaurantId).orElse(null);
        }
        if (request.restaurantCode != null && !request.restaurantCode.isBlank()) {
            return restaurantRepository.findByRestaurantId(request.restaurantCode).orElse(null);
        }
        return null;
    }

    private User resolveRequestUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not available"));
        }
        return userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Guest checkout user not available"));
    }

    private UserAddress resolveDeliveryAddress(CheckoutRequest request, User user) {
        if (request.addressId != null) {
            return userAddressRepository.findByIdAndUserIdAndActiveTrue(request.addressId, user.getId()).orElse(null);
        }
        return userAddressRepository.findByUserIdAndDefaultAddressTrueAndActiveTrue(user.getId()).orElse(null);
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

    private OrderSummaryResponse buildOrderSummary(Order order) {
        Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId()).orElse(null);
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        OrderSummaryResponse response = new OrderSummaryResponse();
        response.id = order.getId();
        response.orderNumber = order.getOrderNumber();
        response.restaurantId = restaurant != null ? restaurant.getRestaurantId() : null;
        response.restaurantName = restaurant != null ? restaurant.getName() : "Restaurant";
        response.restaurantImage = restaurant != null ? restaurant.getImage() : null;
        response.status = order.getStatus();
        response.paymentMethod = order.getPaymentMethod();
        response.paymentStatus = order.getPaymentStatus();
        response.deliveryAddress = order.getDeliveryAddress();
        response.contactNumber = order.getContactNumber();
        response.specialInstructions = order.getSpecialInstructions();
        response.totalAmount = order.getTotalAmount();
        response.deliveryFee = order.getDeliveryFee();
        response.discount = order.getDiscount();
        response.finalAmount = order.getFinalAmount();
        response.estimatedDeliveryTime = order.getEstimatedDeliveryTime();
        response.actualDeliveryTime = order.getActualDeliveryTime();
        response.createdAt = order.getCreatedAt();
        response.updatedAt = order.getUpdatedAt();
        response.items = items;
        response.itemCount = items.stream().mapToInt(OrderItem::getQuantity).sum();
        response.canCancel = order.getStatus() == Order.OrderStatus.PENDING || order.getStatus() == Order.OrderStatus.CONFIRMED;
        response.canReorder = !items.isEmpty() && restaurant != null;
        return response;
    }

    public static class CheckoutRequest {
        public Long restaurantId;
        public String restaurantCode;
        public Long addressId;
        public String customerName;
        public String specialInstructions;
        public String paymentMethod;
        public String couponCode;
        public Double deliveryFee;
        public Double discount;
        public List<CheckoutItemRequest> items;
    }

    public static class CheckoutItemRequest {
        public String itemId;
        public String name;
        public Integer quantity;
        public Double price;
        public String notes;
    }

    public static class OrderSummaryResponse {
        public Long id;
        public String orderNumber;
        public String restaurantId;
        public String restaurantName;
        public String restaurantImage;
        public Order.OrderStatus status;
        public Order.PaymentMethod paymentMethod;
        public Order.PaymentStatus paymentStatus;
        public String deliveryAddress;
        public String contactNumber;
        public String specialInstructions;
        public Double totalAmount;
        public Double deliveryFee;
        public Double discount;
        public Double finalAmount;
        public LocalDateTime estimatedDeliveryTime;
        public LocalDateTime actualDeliveryTime;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
        public Integer itemCount;
        public Boolean canCancel;
        public Boolean canReorder;
        public List<OrderItem> items;
    }

    private enum CouponType {
        FLAT, PERCENT
    }

    private record CouponRule(String code,
                              CouponType type,
                              Double discountValue,
                              Double minOrderAmount,
                              Double maxDiscountAmount) {
    }

    private record CouponEvaluation(double discountAmount, String couponCode, String errorMessage) {
    }
}
