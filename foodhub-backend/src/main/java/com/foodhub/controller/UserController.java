package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.AuthOtp;
import com.foodhub.model.Order;
import com.foodhub.model.PasswordResetOtp;
import com.foodhub.model.User;
import com.foodhub.repository.AuthOtpRepository;
import com.foodhub.repository.FavoriteMenuItemRepository;
import com.foodhub.repository.FavoriteRestaurantRepository;
import com.foodhub.repository.OrderItemRepository;
import com.foodhub.repository.OrderRepository;
import com.foodhub.repository.PasswordResetOtpRepository;
import com.foodhub.repository.SavedPaymentMethodRepository;
import com.foodhub.repository.UserAddressRepository;
import com.foodhub.repository.UserRepository;
import com.foodhub.repository.UserSubscriptionRepository;
import com.foodhub.security.JwtService;
import com.foodhub.service.OtpDeliveryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final String DELETE_ACCOUNT_OTP_KEY_PREFIX = "delete-account:user:";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthOtpRepository authOtpRepository;

    @Autowired
    private PasswordResetOtpRepository passwordResetOtpRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private SavedPaymentMethodRepository savedPaymentMethodRepository;

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private FavoriteRestaurantRepository favoriteRestaurantRepository;

    @Autowired
    private FavoriteMenuItemRepository favoriteMenuItemRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OtpDeliveryService otpDeliveryService;

    @Value("${security.otp.dev-return:true}")
    private boolean otpDevReturn;

    @Value("${demo.owner-admin.email:}")
    private String ownerAdminEmail;

    @Value("${demo.owner-admin.phone:}")
    private String ownerAdminPhone;

    // ===== CREATE =====
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered"));
            }

            // Check if phone number already exists
            if (user.getPhoneNumber() != null && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Phone number already registered"));
            }

            // Encode password if encoder is available
            if (passwordEncoder != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            user.setRole(User.Role.USER);
            user.setActive(user.getActive() == null ? true : user.getActive());

            User savedUser = userRepository.save(user);
            savedUser = ensureOwnerAdminAccess(savedUser, null, null);
            return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to register user: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            if (request == null || request.email == null || request.email.isBlank()
                    || request.password == null || request.password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            Optional<User> optionalUser = userRepository.findByEmail(request.email.trim());
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            User user = optionalUser.get();
            boolean matches = passwordEncoder != null
                    ? passwordEncoder.matches(request.password, user.getPassword())
                    : request.password.equals(user.getPassword());

            if (!matches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            if (!Boolean.TRUE.equals(user.getActive())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Your account is inactive"));
            }

            user = ensureOwnerAdminAccess(user, null, null);
            return ResponseEntity.ok(buildAuthResponse(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to log in: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestPasswordResetOtp(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request == null || request.email == null || request.email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            String normalizedEmail = request.email.trim().toLowerCase();
            Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);
            if (optionalUser.isEmpty() || !Boolean.TRUE.equals(optionalUser.get().getActive())) {
                return ResponseEntity.ok(Map.of("message", "If this email is registered, an OTP has been sent."));
            }

            String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
            List<PasswordResetOtp> activeOtps = passwordResetOtpRepository.findByEmailAndConsumedFalse(normalizedEmail);
            for (PasswordResetOtp oldOtp : activeOtps) {
                oldOtp.setConsumed(true);
            }
            if (!activeOtps.isEmpty()) {
                passwordResetOtpRepository.saveAll(activeOtps);
            }

            PasswordResetOtp passwordResetOtp = new PasswordResetOtp();
            passwordResetOtp.setEmail(normalizedEmail);
            passwordResetOtp.setOtpHash(passwordEncoder.encode(otp));
            passwordResetOtp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            passwordResetOtp.setConsumed(false);
            passwordResetOtp.setAttemptCount(0);
            passwordResetOtpRepository.save(passwordResetOtp);

            log.info("Password reset OTP generated for {}", normalizedEmail);
            OtpDeliveryService.DeliveryResult deliveryResult = otpDeliveryService.sendPasswordResetOtp(normalizedEmail, otp);
            if (!deliveryResult.delivered() && otpDevReturn) {
                return ResponseEntity.ok(Map.of(
                        "message", "OTP generated for password reset (dev mode).",
                        "devOtp", otp,
                        "expiresInMinutes", OTP_EXPIRY_MINUTES
                ));
            }

            if (!deliveryResult.delivered()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", deliveryResult.reason()));
            }

            return ResponseEntity.ok(Map.of("message", "OTP sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/otp/request")
    public ResponseEntity<?> requestAuthOtp(@RequestBody AuthOtpRequest request) {
        try {
            ParsedIdentifier parsedIdentifier = parseIdentifier(request == null ? null : request.identifier);
            if (parsedIdentifier == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Enter a valid email or phone number"));
            }
            boolean userExists = findUserByIdentifier(parsedIdentifier).isPresent();

            String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
            List<AuthOtp> activeOtps = authOtpRepository.findByIdentifierKeyAndConsumedFalse(parsedIdentifier.key());
            for (AuthOtp oldOtp : activeOtps) {
                oldOtp.setConsumed(true);
            }
            if (!activeOtps.isEmpty()) {
                authOtpRepository.saveAll(activeOtps);
            }

            AuthOtp authOtp = new AuthOtp();
            authOtp.setIdentifierKey(parsedIdentifier.key());
            authOtp.setOtpHash(passwordEncoder.encode(otp));
            authOtp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            authOtp.setConsumed(false);
            authOtp.setAttemptCount(0);
            authOtpRepository.save(authOtp);

            OtpDeliveryService.DeliveryResult deliveryResult = otpDeliveryService.sendAuthOtp(
                    parsedIdentifier.value(),
                    parsedIdentifier.email(),
                    otp
            );
            if (!deliveryResult.delivered() && otpDevReturn) {
                return ResponseEntity.ok(Map.of(
                        "message", "OTP generated for sign in (dev mode).",
                        "devOtp", otp,
                        "expiresInMinutes", OTP_EXPIRY_MINUTES,
                        "existingUser", userExists
                ));
            }

            if (!deliveryResult.delivered()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", deliveryResult.reason()));
            }

            return ResponseEntity.ok(Map.of(
                    "message", parsedIdentifier.email() ? "OTP sent to your email." : "OTP sent to your phone.",
                    "existingUser", userExists
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/otp/verify")
    public ResponseEntity<?> verifyAuthOtp(@RequestBody AuthOtpVerifyRequest request) {
        try {
            ParsedIdentifier parsedIdentifier = parseIdentifier(request == null ? null : request.identifier);
            if (parsedIdentifier == null || request.otp == null || request.otp.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Identifier and OTP are required"));
            }

            Optional<AuthOtp> otpOptional = authOtpRepository
                    .findTopByIdentifierKeyAndConsumedFalseOrderByCreatedAtDesc(parsedIdentifier.key());
            if (otpOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP not found or already used"));
            }

            AuthOtp otpRecord = otpOptional.get();
            if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
                otpRecord.setConsumed(true);
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "OTP expired. Please request a new OTP."));
            }

            if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                otpRecord.setConsumed(true);
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "Too many attempts. Request a new OTP."));
            }

            boolean otpMatches = passwordEncoder.matches(request.otp.trim(), otpRecord.getOtpHash());
            if (!otpMatches) {
                otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
                if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                    otpRecord.setConsumed(true);
                }
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
            }

            Optional<User> existingUser = findUserByIdentifier(parsedIdentifier);
            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                Optional<User> ownerAdminAccount = findOwnerAdminCandidate(parsedIdentifier, request.email);
                if (ownerAdminAccount.isPresent()) {
                    user = ownerAdminAccount.get();
                } else {
                    if (request.name == null || request.name.isBlank()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Name is required to create a new account."));
                    }
                    user = createOtpUser(parsedIdentifier, request.name, request.email, request.referralCode);
                }
            }

            user = ensureOwnerAdminAccess(user, parsedIdentifier, request.email);

            otpRecord.setConsumed(true);
            authOtpRepository.save(otpRecord);

            return ResponseEntity.ok(buildAuthResponse(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to verify OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPasswordWithOtp(@RequestBody ResetPasswordRequest request) {
        try {
            if (request == null
                    || request.email == null || request.email.isBlank()
                    || request.otp == null || request.otp.isBlank()
                    || request.newPassword == null || request.newPassword.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email, OTP, and new password are required"));
            }

            String normalizedEmail = request.email.trim().toLowerCase();
            Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or OTP"));
            }

            Optional<PasswordResetOtp> otpOptional = passwordResetOtpRepository
                    .findTopByEmailAndConsumedFalseOrderByCreatedAtDesc(normalizedEmail);
            if (otpOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP not found or already used"));
            }

            PasswordResetOtp otpRecord = otpOptional.get();
            if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
                otpRecord.setConsumed(true);
                passwordResetOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "OTP expired. Please request a new OTP."));
            }

            if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                otpRecord.setConsumed(true);
                passwordResetOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "Too many attempts. Request a new OTP."));
            }

            boolean otpMatches = passwordEncoder.matches(request.otp.trim(), otpRecord.getOtpHash());
            if (!otpMatches) {
                otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
                if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                    otpRecord.setConsumed(true);
                }
                passwordResetOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
            }

            User user = optionalUser.get();
            user.setPassword(passwordEncoder.encode(request.newPassword));
            userRepository.save(user);

            otpRecord.setConsumed(true);
            passwordResetOtpRepository.save(otpRecord);

            return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password: " + e.getMessage()));
        }
    }

    @PostMapping("/me/delete/request-otp")
    public ResponseEntity<?> requestDeleteAccountOtp(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                     @RequestBody(required = false) DeleteAccountOtpRequest request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Please login to delete your account"));
            }
            if (passwordEncoder == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "OTP verification is temporarily unavailable"));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            DeleteAccountOtpTarget otpTarget = resolveDeleteAccountOtpTarget(user, request == null ? null : request.channel);

            String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
            String deleteOtpKey = buildDeleteAccountOtpKey(user.getId(), otpTarget.identifier().key());

            List<AuthOtp> activeOtps = authOtpRepository.findByIdentifierKeyAndConsumedFalse(deleteOtpKey);
            for (AuthOtp oldOtp : activeOtps) {
                oldOtp.setConsumed(true);
            }
            if (!activeOtps.isEmpty()) {
                authOtpRepository.saveAll(activeOtps);
            }

            AuthOtp authOtp = new AuthOtp();
            authOtp.setIdentifierKey(deleteOtpKey);
            authOtp.setOtpHash(passwordEncoder.encode(otp));
            authOtp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            authOtp.setConsumed(false);
            authOtp.setAttemptCount(0);
            authOtpRepository.save(authOtp);

            OtpDeliveryService.DeliveryResult deliveryResult = otpDeliveryService.sendDeleteAccountOtp(
                    otpTarget.identifier().value(),
                    otpTarget.identifier().email(),
                    otp
            );
            if (!deliveryResult.delivered() && otpDevReturn) {
                return ResponseEntity.ok(Map.of(
                        "message", "Delete account OTP generated (dev mode).",
                        "channel", otpTarget.channel(),
                        "devOtp", otp,
                        "expiresInMinutes", OTP_EXPIRY_MINUTES
                ));
            }

            if (!deliveryResult.delivered()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", deliveryResult.reason()));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Verification code sent to your registered " + otpTarget.channel() + ".",
                    "channel", otpTarget.channel(),
                    "expiresInMinutes", OTP_EXPIRY_MINUTES
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send delete account OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/me/delete/confirm")
    @Transactional
    public ResponseEntity<?> confirmDeleteAccount(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                  @RequestBody DeleteAccountConfirmRequest request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Please login to delete your account"));
            }
            if (passwordEncoder == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "OTP verification is temporarily unavailable"));
            }
            if (request == null || request.otp == null || request.otp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            DeleteAccountOtpTarget otpTarget = resolveDeleteAccountOtpTarget(user, request.channel);
            String deleteOtpKey = buildDeleteAccountOtpKey(user.getId(), otpTarget.identifier().key());

            Optional<AuthOtp> otpOptional = authOtpRepository
                    .findTopByIdentifierKeyAndConsumedFalseOrderByCreatedAtDesc(deleteOtpKey);
            if (otpOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Verification code not found or already used"));
            }

            AuthOtp otpRecord = otpOptional.get();
            if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
                otpRecord.setConsumed(true);
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Verification code expired. Please request a new one."));
            }

            if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                otpRecord.setConsumed(true);
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Too many attempts. Request a new verification code."));
            }

            boolean otpMatches = passwordEncoder.matches(request.otp.trim(), otpRecord.getOtpHash());
            if (!otpMatches) {
                otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
                if (otpRecord.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
                    otpRecord.setConsumed(true);
                }
                authOtpRepository.save(otpRecord);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification code"));
            }

            otpRecord.setConsumed(true);
            authOtpRepository.save(otpRecord);

            deleteUserAccountData(user);
            return ResponseEntity.ok(Map.of("message", "Your account has been deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete account: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            User user = resolveRequestUser(userId);
            return ResponseEntity.ok(sanitizeUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch current user: " + e.getMessage()));
        }
    }

    // ===== READ =====
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return ResponseEntity.status(adminError.getStatusCode()).build();
            }
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(sanitizeUser(user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch user: " + e.getMessage()));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(sanitizeUser(user.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with email: " + email));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch user: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return ResponseEntity.status(adminError.getStatusCode()).build();
            }
            List<User> users = userRepository.findByActiveTrue();
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return ResponseEntity.status(adminError.getStatusCode()).build();
            }
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userRepository.findByRole(userRole);
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return ResponseEntity.status(adminError.getStatusCode()).build();
            }
            List<User> users = userRepository.searchUsers(query);
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===== UPDATE =====
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            Optional<User> optionalUser = userRepository.findById(id);
            
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with id: " + id));
            }

            User existingUser = optionalUser.get();

            if (userDetails.getEmail() != null && !userDetails.getEmail().equalsIgnoreCase(existingUser.getEmail())) {
                if (userRepository.existsByEmail(userDetails.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email already registered"));
                }
                existingUser.setEmail(userDetails.getEmail());
            }

            if (userDetails.getPhoneNumber() != null && !userDetails.getPhoneNumber().equals(existingUser.getPhoneNumber())) {
                if (userRepository.existsByPhoneNumber(userDetails.getPhoneNumber())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Phone number already registered"));
                }
            }

            // Update fields
            if (userDetails.getName() != null) {
                existingUser.setName(userDetails.getName());
            }
            if (userDetails.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(userDetails.getPhoneNumber());
            }
            if (userDetails.getAddress() != null) {
                existingUser.setAddress(userDetails.getAddress());
            }
            if (userDetails.getCity() != null) {
                existingUser.setCity(userDetails.getCity());
            }
            if (userDetails.getState() != null) {
                existingUser.setState(userDetails.getState());
            }
            if (userDetails.getPincode() != null) {
                existingUser.setPincode(userDetails.getPincode());
            }
            if (userDetails.getRole() != null) {
                existingUser.setRole(userDetails.getRole());
            }
            if (userDetails.getActive() != null) {
                existingUser.setActive(userDetails.getActive());
            }

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(sanitizeUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @RequestBody User userDetails) {
        try {
            User currentUser = resolveRequestUser(userId);

            if (userDetails.getEmail() != null && !userDetails.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
                if (userRepository.existsByEmail(userDetails.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email already registered"));
                }
                currentUser.setEmail(userDetails.getEmail());
            }

            if (userDetails.getPhoneNumber() != null && !userDetails.getPhoneNumber().equals(currentUser.getPhoneNumber())) {
                if (userRepository.existsByPhoneNumber(userDetails.getPhoneNumber())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Phone number already registered"));
                }
                currentUser.setPhoneNumber(userDetails.getPhoneNumber());
            }

            if (userDetails.getName() != null) {
                currentUser.setName(userDetails.getName());
            }
            if (userDetails.getAddress() != null) {
                currentUser.setAddress(userDetails.getAddress());
            }
            if (userDetails.getCity() != null) {
                currentUser.setCity(userDetails.getCity());
            }
            if (userDetails.getState() != null) {
                currentUser.setState(userDetails.getState());
            }
            if (userDetails.getPincode() != null) {
                currentUser.setPincode(userDetails.getPincode());
            }

            return ResponseEntity.ok(sanitizeUser(userRepository.save(currentUser)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update current user: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            Optional<User> optionalUser = userRepository.findById(id);
            
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }

            User user = optionalUser.get();

            // Verify old password if encoder is available
            if (passwordEncoder != null && !passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Incorrect old password"));
            }

            // Update password
            if (passwordEncoder != null) {
                user.setPassword(passwordEncoder.encode(newPassword));
            } else {
                user.setPassword(newPassword);
            }
            
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update password: " + e.getMessage()));
        }
    }

    // ===== DELETE =====
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with id: " + id));
            }

            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // ===== STATISTICS =====
    
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            ResponseEntity<?> adminError = requireAdminAccess();
            if (adminError != null) {
                return adminError;
            }
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userRepository.count());
            stats.put("activeUsers", userRepository.countByActiveTrue());
            stats.put("totalAdmins", userRepository.countByRole(User.Role.ADMIN));
            stats.put("totalRestaurantOwners", userRepository.countByRole(User.Role.RESTAURANT_OWNER));
            stats.put("totalCustomers", userRepository.countByRole(User.Role.USER));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    private User resolveRequestUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
        }
        return userRepository.findByEmail(DemoUserDataLoader.DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Guest user not available"));
    }

    private ResponseEntity<?> requireAdminAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        return null;
    }

    private User sanitizeUser(User user) {
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setName(user.getName());
        responseUser.setEmail(user.getEmail());
        responseUser.setPhoneNumber(user.getPhoneNumber());
        responseUser.setAddress(user.getAddress());
        responseUser.setCity(user.getCity());
        responseUser.setState(user.getState());
        responseUser.setPincode(user.getPincode());
        responseUser.setRole(user.getRole());
        responseUser.setActive(user.getActive());
        responseUser.setCreatedAt(user.getCreatedAt());
        responseUser.setUpdatedAt(user.getUpdatedAt());
        return responseUser;
    }

    private Map<String, Object> buildAuthResponse(User user) {
        return Map.of(
                "token", jwtService.generateToken(user),
                "user", sanitizeUser(user)
        );
    }

    private Optional<User> findUserByIdentifier(ParsedIdentifier parsedIdentifier) {
        if (parsedIdentifier.email()) {
            return userRepository.findByEmail(parsedIdentifier.value());
        }

        List<User> candidates = new ArrayList<>();
        for (String variant : buildPhoneLookupVariants(parsedIdentifier.value(), parsedIdentifier.raw())) {
            candidates.addAll(userRepository.findAllByPhoneNumberOrderByIdDesc(variant));
        }

        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        Map<Long, User> uniqueById = new LinkedHashMap<>();
        for (User candidate : candidates) {
            uniqueById.put(candidate.getId(), candidate);
        }

        return uniqueById.values().stream()
                .filter((user) -> Boolean.TRUE.equals(user.getActive()))
                .findFirst()
                .or(() -> uniqueById.values().stream().findFirst());
    }

    private User createOtpUser(ParsedIdentifier parsedIdentifier, String requestedName, String requestedEmail, String referralCode) {
        User user = new User();
        String name = requestedName == null || requestedName.isBlank() ? "SnapEats User" : requestedName.trim();
        user.setName(name);
        user.setRole(User.Role.USER);
        user.setActive(true);

        String generatedPassword = UUID.randomUUID().toString();
        user.setPassword(passwordEncoder.encode(generatedPassword));

        if (parsedIdentifier.email()) {
            user.setEmail(parsedIdentifier.value());
            user.setPhoneNumber(null);
        } else {
            user.setPhoneNumber(parsedIdentifier.value());
            String preferredEmail = requestedEmail == null ? "" : requestedEmail.trim().toLowerCase();
            String emailBase = preferredEmail.isBlank() ? parsedIdentifier.value() + "@otp.snap-eats.local" : preferredEmail;
            String email = emailBase;
            int suffix = 1;
            while (userRepository.existsByEmail(email)) {
                if (preferredEmail.isBlank()) {
                    email = parsedIdentifier.value() + "+" + suffix + "@otp.snap-eats.local";
                } else {
                    int atIndex = preferredEmail.indexOf("@");
                    if (atIndex > 0) {
                        email = preferredEmail.substring(0, atIndex) + "+" + suffix + preferredEmail.substring(atIndex);
                    } else {
                        email = preferredEmail + "+" + suffix + "@otp.snap-eats.local";
                    }
                }
                suffix += 1;
            }
            user.setEmail(email);
        }
        return userRepository.save(user);
    }

    private Optional<User> findOwnerAdminCandidate(ParsedIdentifier parsedIdentifier, String requestedEmail) {
        if (!matchesOwnerAdmin(parsedIdentifier, requestedEmail)) {
            return Optional.empty();
        }

        String configuredEmail = normalizeEmail(ownerAdminEmail);
        if (!configuredEmail.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(configuredEmail);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }

        String configuredPhone = normalizePhoneNumber(ownerAdminPhone);
        if (!configuredPhone.isBlank()) {
            return userRepository.findByPhoneNumber(configuredPhone);
        }

        return Optional.empty();
    }

    private User ensureOwnerAdminAccess(User user, ParsedIdentifier parsedIdentifier, String requestedEmail) {
        if (!matchesOwnerAdmin(user, parsedIdentifier, requestedEmail)) {
            return user;
        }

        boolean changed = false;
        if (user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            changed = true;
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
            user.setActive(true);
            changed = true;
        }
        String configuredEmail = normalizeEmail(ownerAdminEmail);
        if ((user.getEmail() == null || user.getEmail().isBlank())
                && !configuredEmail.isBlank()
                && matchesOwnerAdminEmail(requestedEmail)) {
            user.setEmail(configuredEmail);
            changed = true;
        }
        String configuredPhone = normalizePhoneNumber(ownerAdminPhone);
        if ((user.getPhoneNumber() == null || user.getPhoneNumber().isBlank())
                && !configuredPhone.isBlank()
                && parsedIdentifier != null
                && !parsedIdentifier.email()
                && matchesOwnerAdminPhone(parsedIdentifier.value())) {
            user.setPhoneNumber(configuredPhone);
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    private boolean matchesOwnerAdmin(User user, ParsedIdentifier parsedIdentifier, String requestedEmail) {
        if (user != null && (matchesOwnerAdminEmail(user.getEmail()) || matchesOwnerAdminPhone(user.getPhoneNumber()))) {
            return true;
        }
        return matchesOwnerAdmin(parsedIdentifier, requestedEmail);
    }

    private boolean matchesOwnerAdmin(ParsedIdentifier parsedIdentifier, String requestedEmail) {
        if (parsedIdentifier != null) {
            if (parsedIdentifier.email() && matchesOwnerAdminEmail(parsedIdentifier.value())) {
                return true;
            }
            if (!parsedIdentifier.email() && matchesOwnerAdminPhone(parsedIdentifier.value())) {
                return true;
            }
        }
        return matchesOwnerAdminEmail(requestedEmail);
    }

    private boolean matchesOwnerAdminEmail(String email) {
        String configuredEmail = normalizeEmail(ownerAdminEmail);
        return !configuredEmail.isBlank() && email != null && configuredEmail.equals(normalizeEmail(email));
    }

    private boolean matchesOwnerAdminPhone(String phone) {
        String configuredPhone = normalizePhoneNumber(ownerAdminPhone);
        return !configuredPhone.isBlank() && phone != null && normalizePhoneNumber(phone).equals(configuredPhone);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null) {
            return "";
        }
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("0") && digits.length() == 11) {
            digits = digits.substring(1);
        }
        if (digits.startsWith("91") && digits.length() >= 12) {
            digits = digits.substring(digits.length() - 10);
        }
        return digits;
    }

    private ParsedIdentifier parseIdentifier(String identifierInput) {
        if (identifierInput == null) {
            return null;
        }

        String raw = identifierInput.trim();
        if (raw.isBlank()) {
            return null;
        }

        if (raw.contains("@")) {
            String normalizedEmail = raw.toLowerCase();
            return new ParsedIdentifier("email:" + normalizedEmail, normalizedEmail, raw, true);
        }

        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() < 10) {
            return null;
        }
        if (digits.startsWith("0") && digits.length() == 11) {
            digits = digits.substring(1);
        }
        if (digits.startsWith("91") && digits.length() >= 12) {
            digits = digits.substring(digits.length() - 10);
        }
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }
        return new ParsedIdentifier("phone:" + digits, digits, raw, false);
    }

    private List<String> buildPhoneLookupVariants(String normalizedPhone, String rawInput) {
        LinkedHashSet<String> variants = new LinkedHashSet<>();
        variants.add(normalizedPhone);
        variants.add("0" + normalizedPhone);
        variants.add("91" + normalizedPhone);
        variants.add("+91" + normalizedPhone);

        String raw = rawInput == null ? "" : rawInput.trim();
        if (!raw.isBlank()) {
            variants.add(raw);
        }
        return new ArrayList<>(variants);
    }

    private DeleteAccountOtpTarget resolveDeleteAccountOtpTarget(User user, String requestedChannel) {
        String normalizedEmail = user.getEmail() == null ? "" : user.getEmail().trim().toLowerCase();
        String normalizedPhoneRaw = user.getPhoneNumber() == null ? "" : user.getPhoneNumber().trim();

        ParsedIdentifier emailIdentifier = normalizedEmail.isBlank() ? null : parseIdentifier(normalizedEmail);
        ParsedIdentifier phoneIdentifier = normalizedPhoneRaw.isBlank() ? null : parseIdentifier(normalizedPhoneRaw);

        String normalizedChannel = requestedChannel == null ? "" : requestedChannel.trim().toLowerCase();
        if ("sms".equals(normalizedChannel)) {
            normalizedChannel = "phone";
        }

        if ("email".equals(normalizedChannel)) {
            if (emailIdentifier == null || !emailIdentifier.email()) {
                throw new IllegalStateException("No registered email found for this account");
            }
            return new DeleteAccountOtpTarget("email", emailIdentifier);
        }

        if ("phone".equals(normalizedChannel)) {
            if (phoneIdentifier == null || phoneIdentifier.email()) {
                throw new IllegalStateException("No valid registered phone number found for this account");
            }
            return new DeleteAccountOtpTarget("phone", phoneIdentifier);
        }

        if (emailIdentifier != null && emailIdentifier.email()) {
            return new DeleteAccountOtpTarget("email", emailIdentifier);
        }
        if (phoneIdentifier != null && !phoneIdentifier.email()) {
            return new DeleteAccountOtpTarget("phone", phoneIdentifier);
        }

        throw new IllegalStateException("No registered email or phone number found for this account");
    }

    private String buildDeleteAccountOtpKey(Long userId, String identifierKey) {
        return DELETE_ACCOUNT_OTP_KEY_PREFIX + userId + ":" + identifierKey;
    }

    private void deleteUserAccountData(User user) {
        Long userId = user.getId();
        String userEmail = user.getEmail() == null ? "" : user.getEmail().trim().toLowerCase();

        List<Order> userOrders = orderRepository.findByUserId(userId);
        for (Order order : userOrders) {
            orderItemRepository.deleteByOrderId(order.getId());
        }
        orderRepository.deleteByUserId(userId);

        favoriteRestaurantRepository.deleteByUserId(userId);
        favoriteMenuItemRepository.deleteByUserId(userId);
        userAddressRepository.deleteByUserId(userId);
        savedPaymentMethodRepository.deleteByUserId(userId);
        userSubscriptionRepository.deleteByUserId(userId);

        authOtpRepository.deleteByIdentifierKeyStartingWith(DELETE_ACCOUNT_OTP_KEY_PREFIX + userId + ":");
        if (!userEmail.isBlank()) {
            passwordResetOtpRepository.deleteByEmail(userEmail);
        }

        userRepository.deleteById(userId);
    }

    private record ParsedIdentifier(String key, String value, String raw, boolean email) {}

    private record DeleteAccountOtpTarget(String channel, ParsedIdentifier identifier) {}

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class ForgotPasswordRequest {
        public String email;
    }

    public static class AuthOtpRequest {
        public String identifier;
    }

    public static class AuthOtpVerifyRequest {
        public String identifier;
        public String otp;
        public String name;
        public String email;
        public String referralCode;
    }

    public static class ResetPasswordRequest {
        public String email;
        public String otp;
        public String newPassword;
    }

    public static class DeleteAccountOtpRequest {
        public String channel;
    }

    public static class DeleteAccountConfirmRequest {
        public String channel;
        public String otp;
    }
}
