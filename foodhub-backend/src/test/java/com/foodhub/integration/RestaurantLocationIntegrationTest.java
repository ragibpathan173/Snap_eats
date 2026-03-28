package com.foodhub.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RestaurantLocationIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldFilterActiveRestaurantsByCity() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/restaurants/active").param("city", "Mumbai"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode restaurants = readJson(result);
        Assertions.assertTrue(restaurants.isArray());
        Assertions.assertTrue(restaurants.size() > 0, "Expected at least one Mumbai restaurant");

        for (JsonNode restaurant : restaurants) {
            String city = restaurant.path("city").asText("").toLowerCase();
            String locality = restaurant.path("locality").asText("").toLowerCase();
            Assertions.assertTrue(
                    city.contains("mumbai") || locality.contains("mumbai"),
                    "Restaurant does not match Mumbai filter: " + restaurant.path("name").asText("")
            );
        }
    }
}

