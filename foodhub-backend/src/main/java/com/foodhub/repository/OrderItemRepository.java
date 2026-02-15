package com.foodhub.repository;

import com.foodhub.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderId = :orderId")
    List<OrderItem> findAllByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Double calculateOrderTotal(@Param("orderId") Long orderId);
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Long countOrderItems(@Param("orderId") Long orderId);
    
    Long countByOrderId(Long orderId);
    
    void deleteByOrderId(Long orderId);
}