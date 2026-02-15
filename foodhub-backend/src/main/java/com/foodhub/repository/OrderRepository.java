package com.foodhub.repository;

import com.foodhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Order> findByRestaurantId(Long restaurantId);
    
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status);
    
    List<Order> findByRestaurantIdAndStatus(Long restaurantId, Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findUserOrderHistory(@Param("userId") Long userId);
    
    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId ORDER BY o.createdAt DESC")
    List<Order> findRestaurantOrderHistory(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findUserOrdersByStatus(@Param("userId") Long userId, @Param("status") Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findRestaurantOrdersBetweenDates(@Param("restaurantId") Long restaurantId,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Long countUserOrders(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurantId = :restaurantId")
    Long countRestaurantOrders(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.restaurantId = :restaurantId AND o.status = 'DELIVERED'")
    Double calculateRestaurantRevenue(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.userId = :userId AND o.status = 'DELIVERED'")
    Double calculateUserTotalSpent(@Param("userId") Long userId);
    
    boolean existsByOrderNumber(String orderNumber);
}