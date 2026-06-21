package com.foodhub.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthOtpIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldRequestAndVerifyOtpForPhoneIdentifier() throws Exception {
        String identifier = "9000012345";
        MvcResult requestOtpResult = mockMvc.perform(post("/api/users/auth/otp/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("identifier", identifier))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode otpResponse = readJson(requestOtpResult);
        String devOtp = otpResponse.path("devOtp").asText("");
        Assertions.assertFalse(devOtp.isBlank(), "Expected dev OTP in test profile");

        MvcResult verifyOtpResult = mockMvc.perform(post("/api/users/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "identifier", identifier,
                                "otp", devOtp,
                                "name", "Integration User"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode verifyResponse = readJson(verifyOtpResult);
        Assertions.assertFalse(verifyResponse.path("token").asText("").isBlank());
        Assertions.assertFalse(verifyResponse.path("user").path("id").asText("").isBlank());
    }

    @Test
    void shouldRequestAndVerifyOtpForEmailIdentifier() throws Exception {
        String identifier = "integration.user@example.com";
        MvcResult requestOtpResult = mockMvc.perform(post("/api/users/auth/otp/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("identifier", identifier))))
                .andExpect(status().isOk())
                .andReturn();

        String devOtp = readJson(requestOtpResult).path("devOtp").asText("");
        Assertions.assertFalse(devOtp.isBlank(), "Expected dev OTP in test profile");

        MvcResult verifyOtpResult = mockMvc.perform(post("/api/users/auth/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "identifier", identifier,
                                "otp", devOtp,
                                "name", "Email User"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode verifyResponse = readJson(verifyOtpResult);
        Assertions.assertEquals(identifier, verifyResponse.path("user").path("email").asText(""));
        Assertions.assertFalse(verifyResponse.path("token").asText("").isBlank());
    }
}
