package com.foodhub.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    protected String loginAs(String email, String password) throws Exception {
        return loginSessionAs(email, password).token();
    }

    protected AuthSession loginSessionAs(String email, String password) throws Exception {
        String payload = objectMapper.writeValueAsString(new LoginRequest(email, password));
        MvcResult loginResult = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode jsonNode = readJson(loginResult);
        String token = jsonNode.path("token").asText("");
        Assertions.assertFalse(token.isBlank(), "Expected non-empty JWT token");
        long userId = jsonNode.path("user").path("id").asLong(0L);
        Assertions.assertTrue(userId > 0L, "Expected valid user id in login response");
        return new AuthSession(token, userId);
    }

    protected record LoginRequest(String email, String password) {
    }

    protected record AuthSession(String token, long userId) {
    }
}
