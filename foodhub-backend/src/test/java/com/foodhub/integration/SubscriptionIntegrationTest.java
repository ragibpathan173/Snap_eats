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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SubscriptionIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldListPlansAndActivateThenCancelMembership() throws Exception {
        AuthSession userSession = loginSessionAs("guest@snap-eats.local", "guest-pass");

        MvcResult plansResult = mockMvc.perform(get("/api/subscriptions/plans")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode plans = readJson(plansResult);
        Assertions.assertTrue(plans.isArray() && plans.size() >= 3, "Expected predefined subscription plans");

        String activatePayload = objectMapper.writeValueAsString(Map.of(
                "planCode", "PLUS",
                "autoRenew", true
        ));
        mockMvc.perform(post("/api/subscriptions/me/activate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(activatePayload))
                .andExpect(status().isCreated());

        MvcResult activeResult = mockMvc.perform(get("/api/subscriptions/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode activeSubscription = readJson(activeResult);
        Assertions.assertTrue(activeSubscription.path("active").asBoolean(false));
        Assertions.assertEquals("PLUS", activeSubscription.path("planCode").asText(""));

        mockMvc.perform(patch("/api/subscriptions/me/cancel")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk());

        MvcResult cancelledResult = mockMvc.perform(get("/api/subscriptions/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode cancelledSubscription = readJson(cancelledResult);
        Assertions.assertFalse(cancelledSubscription.path("active").asBoolean(true));
    }

    @Test
    void shouldApplyFreeDeliveryForActiveMembershipWhenSubtotalMeetsThreshold() throws Exception {
        AuthSession userSession = loginSessionAs("guest@snap-eats.local", "guest-pass");

        String activatePayload = objectMapper.writeValueAsString(Map.of(
                "planCode", "PLUS",
                "autoRenew", true
        ));
        mockMvc.perform(post("/api/subscriptions/me/activate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(activatePayload))
                .andExpect(status().isCreated());

        MvcResult addressesResult = mockMvc.perform(get("/api/addresses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId()))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode addresses = readJson(addressesResult);
        Assertions.assertTrue(addresses.isArray() && addresses.size() > 0, "Expected saved address");
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
                                "itemId", "sub-free-delivery-item",
                                "name", "Subscription Test Bowl",
                                "quantity", 1,
                                "price", 260.0
                        )
                )
        );

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userSession.token())
                        .header("X-User-Id", userSession.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutPayload)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode checkoutResponse = readJson(checkoutResult);
        JsonNode orderNode = checkoutResponse.path("order");
        Assertions.assertEquals(0.0, orderNode.path("deliveryFee").asDouble(-1), 0.01, "Expected free delivery for active subscription");
    }
}
