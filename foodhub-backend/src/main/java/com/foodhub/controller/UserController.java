package com.foodhub.controller;

import com.foodhub.config.DemoUserDataLoader;
import com.foodhub.model.User;
import com.foodhub.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

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

            user.setRole(user.getRole() == null ? User.Role.USER : user.getRole());
            user.setActive(user.getActive() == null ? true : user.getActive());

            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(sanitizeUser(savedUser));
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

            return ResponseEntity.ok(sanitizeUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to log in: " + e.getMessage()));
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
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
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
            List<User> users = userRepository.findByActiveTrue();
            return ResponseEntity.ok(users.stream().map(this::sanitizeUser).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
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
            Optional<User> optionalUser = userRepository.findById(id);
            
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with id: " + id));
            }

            User existingUser = optionalUser.get();

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

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        try {
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

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
