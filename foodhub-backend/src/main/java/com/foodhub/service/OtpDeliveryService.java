package com.foodhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OtpDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(OtpDeliveryService.class);

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    @Value("${otp.delivery.email.enabled:false}")
    private boolean emailDeliveryEnabled;

    @Value("${otp.delivery.email.from:no-reply@snap-eats.local}")
    private String emailFrom;

    @Value("${otp.delivery.sms.enabled:false}")
    private boolean smsDeliveryEnabled;

    @Value("${otp.delivery.sms.webhook-url:}")
    private String smsWebhookUrl;

    @Value("${otp.delivery.sms.auth-token:}")
    private String smsAuthToken;

    public OtpDeliveryService(JavaMailSender mailSender, RestTemplateBuilder restTemplateBuilder) {
        this.mailSender = mailSender;
        this.restTemplate = restTemplateBuilder.build();
    }

    public DeliveryResult sendAuthOtp(String destination, boolean email, String otp) {
        String message = "Your SnapEats login OTP is " + otp + ". It expires in 10 minutes.";
        return email ? sendEmail(destination, "SnapEats Login OTP", message) : sendSms(destination, message);
    }

    public DeliveryResult sendPasswordResetOtp(String email, String otp) {
        String message = "Your SnapEats password reset OTP is " + otp + ". It expires in 10 minutes.";
        return sendEmail(email, "SnapEats Password Reset OTP", message);
    }

    private DeliveryResult sendEmail(String to, String subject, String body) {
        if (!emailDeliveryEnabled) {
            return DeliveryResult.notDelivered("Email OTP delivery is disabled");
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return DeliveryResult.delivered("email");
        } catch (Exception ex) {
            log.warn("Failed to send OTP email to {}: {}", to, ex.getMessage());
            return DeliveryResult.notDelivered("Failed to send email OTP");
        }
    }

    private DeliveryResult sendSms(String phoneNumber, String message) {
        if (!smsDeliveryEnabled || smsWebhookUrl == null || smsWebhookUrl.isBlank()) {
            return DeliveryResult.notDelivered("SMS OTP delivery is disabled");
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (smsAuthToken != null && !smsAuthToken.isBlank()) {
                headers.setBearerAuth(smsAuthToken);
            }
            Map<String, String> payload = Map.of(
                    "to", phoneNumber,
                    "message", message
            );
            restTemplate.postForEntity(smsWebhookUrl, new HttpEntity<>(payload, headers), String.class);
            return DeliveryResult.delivered("sms");
        } catch (Exception ex) {
            log.warn("Failed to send OTP SMS to {}: {}", phoneNumber, ex.getMessage());
            return DeliveryResult.notDelivered("Failed to send SMS OTP");
        }
    }

    public record DeliveryResult(boolean delivered, String channel, String reason) {
        static DeliveryResult delivered(String channel) {
            return new DeliveryResult(true, channel, "");
        }

        static DeliveryResult notDelivered(String reason) {
            return new DeliveryResult(false, "", reason);
        }
    }
}

