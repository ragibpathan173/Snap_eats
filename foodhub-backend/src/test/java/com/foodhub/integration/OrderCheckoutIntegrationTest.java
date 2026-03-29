package com.foodhub.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderCheckoutIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldCheckoutAndListOrdersForAuthenticatedUser() throws Exception {
        String userToken = loginAs("guest@snap-eats.local", "guest-pass");

        MvcResult addressesResult = mockMvc.perform(get("/api/addresses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode addresses = readJson(addressesResult);
        Assertions.assertTrue(addresses.isArray() && addresses.size() > 0, "Expected seeded user address");
        long addressId = addresses.get(0).path("id").asLong();

        MvcResult restaurantsResult = mockMvc.perform(get("/api/restaurants/active"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode restaurants = readJson(restaurantsResult);
        Assertions.assertTrue(restaurants.isArray() && restaurants.size() > 0, "Expected active restaurants");
        String restaurantCode = restaurants.get(0).path("restaurantId").asText("");
        Assertions.assertFalse(restaurantCode.isBlank());

        Map<String, Object> checkoutPayload = Map.of(
                "restaurantCode", restaurantCode,
                "addressId", addressId,
                "paymentMethod", "CASH",
                "items", List.of(
                        Map.of(
                                "itemId", "itest-item-1",
                                "name", "Integration Test Dish",
                                "quantity", 2,
                                "price", 129.0,
                                "notes", "Less spicy"
                        )
                )
        );

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutPayload)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode checkoutResponse = readJson(checkoutResult);
        Assertions.assertFalse(checkoutResponse.path("order").path("id").asText("").isBlank());

        MvcResult myOrdersResult = mockMvc.perform(get("/api/orders/mine")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode myOrders = readJson(myOrdersResult);
        Assertions.assertTrue(myOrders.isArray() && myOrders.size() > 0);
    }

    @Test
    void shouldApplyCouponDiscountDuringCheckout() throws Exception {
        String userToken = loginAs("guest@snap-eats.local", "guest-pass");

        MvcResult addressesResult = mockMvc.perform(get("/api/addresses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode addresses = readJson(addressesResult);
        long addressId = addresses.get(0).path("id").asLong();

        MvcResult restaurantsResult = mockMvc.perform(get("/api/restaurants/active"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode restaurants = readJson(restaurantsResult);
        String restaurantCode = restaurants.get(0).path("restaurantId").asText("");

        Map<String, Object> checkoutPayload = Map.of(
                "restaurantCode", restaurantCode,
                "addressId", addressId,
                "paymentMethod", "CASH",
                "couponCode", "SNAP20",
                "items", List.of(
                        Map.of(
                                "itemId", "itest-coupon-item",
                                "name", "Coupon Test Dish",
                                "quantity", 2,
                                "price", 160.0
                        )
                )
        );

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutPayload)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode orderNode = readJson(checkoutResult).path("order");
        Assertions.assertEquals(64.0, orderNode.path("discount").asDouble(0), 0.01);
    }

    @Test
    void shouldRejectWelcomeCouponForExistingUser() throws Exception {
        String userToken = loginAs("guest@snap-eats.local", "guest-pass");

        MvcResult addressesResult = mockMvc.perform(get("/api/addresses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode addresses = readJson(addressesResult);
        long addressId = addresses.get(0).path("id").asLong();

        MvcResult restaurantsResult = mockMvc.perform(get("/api/restaurants/active"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode restaurants = readJson(restaurantsResult);
        String restaurantCode = restaurants.get(0).path("restaurantId").asText("");

        Map<String, Object> firstOrderPayload = Map.of(
                "restaurantCode", restaurantCode,
                "addressId", addressId,
                "paymentMethod", "CASH",
                "items", List.of(
                        Map.of(
                                "itemId", "itest-first-order-item",
                                "name", "First Order Dish",
                                "quantity", 1,
                                "price", 220.0
                        )
                )
        );

        mockMvc.perform(post("/api/orders/checkout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstOrderPayload)))
                .andExpect(status().isCreated());

        Map<String, Object> secondOrderPayload = Map.of(
                "restaurantCode", restaurantCode,
                "addressId", addressId,
                "paymentMethod", "CASH",
                "couponCode", "WELCOME50",
                "items", List.of(
                        Map.of(
                                "itemId", "itest-second-order-item",
                                "name", "Second Order Dish",
                                "quantity", 1,
                                "price", 260.0
                        )
                )
        );

        MvcResult rejectedResult = mockMvc.perform(post("/api/orders/checkout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondOrderPayload)))
                .andExpect(status().isBadRequest())
                .andReturn();

        JsonNode errorBody = readJson(rejectedResult);
        Assertions.assertTrue(errorBody.path("error").asText("").contains("new users"));
    }
}
