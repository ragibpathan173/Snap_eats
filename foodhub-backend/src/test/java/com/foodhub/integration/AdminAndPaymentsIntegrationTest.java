package com.foodhub.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminAndPaymentsIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldEnforceAdminMenuMutationAndAllowUserPayments() throws Exception {
        AuthSession userSession = loginSessionAs("guest@snap-eats.local", "guest-pass");
        AuthSession adminSession = loginSessionAs("admin@snap-eats.local", "admin-pass");

        MvcResult menuItemsResult = mockMvc.perform(get("/api/menu-items"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode menuItems = readJson(menuItemsResult);
        Assertions.assertTrue(menuItems.isArray() && menuItems.size() > 0, "Expected seeded menu items");
        long restaurantId = menuItems.get(0).path("restaurantId").asLong(0L);
        Assertions.assertTrue(restaurantId > 0L, "Expected valid numeric restaurantId from seeded menu item");

        Map<String, Object> menuPayload = Map.of(
                "itemId", "ITEST-" + System.currentTimeMillis(),
                "restaurantId", restaurantId,
                "name", "Integration Paneer Bowl",
                "description", "Integration test item",
                "price", 199.0,
                "category", "main-course",
                "available", true,
                "active", true
        );

        mockMvc.perform(post("/api/menu-items")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(menuPayload)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/menu-items")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminSession.token())
                        .header("X-User-Id", adminSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(menuPayload)))
                .andExpect(status().isCreated());

        Map<String, Object> paymentPayload = Map.of(
                "methodType", "UPI",
                "upiId", "integration.user@upi",
                "defaultMethod", true
        );

        mockMvc.perform(post("/api/payments/methods")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentPayload)))
                .andExpect(status().isCreated());

        MvcResult paymentsResult = mockMvc.perform(get("/api/payments/methods")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode paymentMethods = readJson(paymentsResult);
        Assertions.assertTrue(paymentMethods.isArray() && paymentMethods.size() > 0);
    }
}
