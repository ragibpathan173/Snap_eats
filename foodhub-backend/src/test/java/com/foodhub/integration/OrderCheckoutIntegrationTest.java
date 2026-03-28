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
}

