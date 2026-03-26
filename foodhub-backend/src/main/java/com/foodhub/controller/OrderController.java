package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.Order;
import com.foodhub.model.OrderItem;
import com.foodhub.model.Restaurant;
import com.foodhub.model.User;
import com.foodhub.repository.OrderItemRepository;
import com.foodhub.repository.OrderRepository;
import com.foodhub.repository.RestaurantRepository;
import com.foodhub.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

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
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            if (request == null || request.items == null || request.items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart items are required"));
            }

            Restaurant restaurant = resolveRestaurant(request);
            if (restaurant == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid restaurant reference is required"));
            }

            User checkoutUser = userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                    .orElseThrow(() -> new IllegalStateException("Guest checkout user not available"));

            if (request.customerName != null && !request.customerName.isBlank()) {
                checkoutUser.setName(request.customerName.trim());
            }
            if (request.contactNumber != null && !request.contactNumber.isBlank()) {
                checkoutUser.setPhoneNumber(request.contactNumber.trim());
            }
            if (request.deliveryAddress != null && !request.deliveryAddress.isBlank()) {
                checkoutUser.setAddress(request.deliveryAddress.trim());
            }
            userRepository.save(checkoutUser);

            double subtotal = request.items.stream()
                    .mapToDouble(item -> (item.price == null ? 0.0 : item.price) * Math.max(1, item.quantity == null ? 1 : item.quantity))
                    .sum();
            double deliveryFee = request.deliveryFee == null ? 40.0 : request.deliveryFee;
            double discount = request.discount == null ? 0.0 : request.discount;

            Order order = new Order();
            order.setOrderNumber("ORD" + System.currentTimeMillis());
            order.setUserId(checkoutUser.getId());
            order.setRestaurantId(restaurant.getId());
            order.setTotalAmount(roundAmount(subtotal));
            order.setDeliveryFee(roundAmount(deliveryFee));
            order.setDiscount(roundAmount(discount));
            order.setFinalAmount(roundAmount(subtotal + deliveryFee - discount));
            order.setPaymentMethod(parsePaymentMethod(request.paymentMethod));
            order.setPaymentStatus(order.getPaymentMethod() == Order.PaymentMethod.CASH
                    ? Order.PaymentStatus.PENDING
                    : Order.PaymentStatus.COMPLETED);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setDeliveryAddress(request.deliveryAddress);
            order.setContactNumber(request.contactNumber);
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

    private Order.PaymentMethod parsePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return Order.PaymentMethod.CASH;
        }
        return Order.PaymentMethod.valueOf(paymentMethod.trim().toUpperCase());
    }

    private double roundAmount(double value) {
        return Math.round(value * 100.0) / 100.0;
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

    public static class CheckoutRequest {
        public Long restaurantId;
        public String restaurantCode;
        public String customerName;
        public String contactNumber;
        public String deliveryAddress;
        public String specialInstructions;
        public String paymentMethod;
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
}
