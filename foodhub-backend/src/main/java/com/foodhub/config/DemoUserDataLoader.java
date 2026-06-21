package com.foodhub.config;

import com.foodhub.model.User;
import com.foodhub.model.UserAddress;
import com.foodhub.repository.UserAddressRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DemoUserDataLoader {

    public static final String DEMO_USER_EMAIL = "guest@snap-eats.local";
    public static final String DEMO_ADMIN_EMAIL = "admin@snap-eats.local";

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;
    private final String ownerAdminEmail;
    private final String ownerAdminPhone;

    public DemoUserDataLoader(UserRepository userRepository,
                              UserAddressRepository userAddressRepository,
                              PasswordEncoder passwordEncoder,
                              @Value("${demo.owner-admin.email:}") String ownerAdminEmail,
                              @Value("${demo.owner-admin.phone:}") String ownerAdminPhone) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
        this.passwordEncoder = passwordEncoder;
        this.ownerAdminEmail = normalizeEmail(ownerAdminEmail);
        this.ownerAdminPhone = normalizePhoneNumber(ownerAdminPhone);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadDemoUser() {
        User user = userRepository.findByEmail(DEMO_USER_EMAIL).orElseGet(() -> {
            User createdUser = new User();
            createdUser.setName("Guest Customer");
            createdUser.setEmail(DEMO_USER_EMAIL);
            createdUser.setPassword(passwordEncoder.encode("guest-pass"));
            createdUser.setPhoneNumber("9876543210");
            createdUser.setAddress("221B Residency Road, Bangalore, Karnataka 560001");
            createdUser.setCity("Bangalore");
            createdUser.setState("Karnataka");
            createdUser.setPincode("560001");
            createdUser.setRole(User.Role.USER);
            createdUser.setActive(true);
            return userRepository.save(createdUser);
        });

        userRepository.findByEmail(DEMO_ADMIN_EMAIL).orElseGet(() -> {
            User admin = new User();
            admin.setName("SnapEats Admin");
            admin.setEmail(DEMO_ADMIN_EMAIL);
            admin.setPassword(passwordEncoder.encode("admin-pass"));
            admin.setPhoneNumber("9000000000");
            admin.setAddress("Admin Control Center, Bengaluru");
            admin.setCity("Bengaluru");
            admin.setState("Karnataka");
            admin.setPincode("560001");
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            return userRepository.save(admin);
        });

        ensureOwnerAdminAccounts();

        if (userAddressRepository.findByUserIdAndActiveTrueOrderByDefaultAddressDescUpdatedAtDesc(user.getId()).isEmpty()) {
            userAddressRepository.save(createAddress(
                    user.getId(),
                    "Home",
                    "Guest Customer",
                    "9876543210",
                    "221B Residency Road",
                    "Near Cubbon Park",
                    "Bangalore",
                    "Karnataka",
                    "560001",
                    true
            ));

            userAddressRepository.save(createAddress(
                    user.getId(),
                    "Work",
                    "Guest Customer",
                    "9876543210",
                    "42 Business Square, MG Road",
                    "Opposite Metro Station",
                    "Bangalore",
                    "Karnataka",
                    "560008",
                    false
            ));
        }
    }

    private void ensureOwnerAdminAccounts() {
        if (ownerAdminEmail.isBlank() && ownerAdminPhone.isBlank()) {
            return;
        }

        User ownerByEmail = ownerAdminEmail.isBlank() ? null : userRepository.findByEmail(ownerAdminEmail).orElse(null);
        User ownerByPhone = ownerAdminPhone.isBlank() ? null : userRepository.findByPhoneNumber(ownerAdminPhone).orElse(null);

        if (ownerByEmail == null && ownerByPhone == null) {
            User ownerAdmin = new User();
            ownerAdmin.setName("Owner Admin");
            ownerAdmin.setEmail(resolveOwnerAdminEmail());
            if (!ownerAdminPhone.isBlank()) {
                ownerAdmin.setPhoneNumber(ownerAdminPhone);
            }
            ownerAdmin.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            ownerAdmin.setRole(User.Role.ADMIN);
            ownerAdmin.setActive(true);
            userRepository.save(ownerAdmin);
            return;
        }

        if (ownerByEmail != null) {
            promoteToOwnerAdmin(ownerByEmail);
        }

        if (ownerByPhone != null && (ownerByEmail == null || !ownerByPhone.getId().equals(ownerByEmail.getId()))) {
            promoteToOwnerAdmin(ownerByPhone);
        }
    }

    private void promoteToOwnerAdmin(User user) {
        boolean changed = false;

        if (user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            changed = true;
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
            user.setActive(true);
            changed = true;
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            user.setEmail(resolveOwnerAdminEmail());
            changed = true;
        }
        if ((user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) && !ownerAdminPhone.isBlank()) {
            user.setPhoneNumber(ownerAdminPhone);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    private String resolveOwnerAdminEmail() {
        if (!ownerAdminEmail.isBlank()) {
            return ownerAdminEmail;
        }
        return "owner-admin+" + ownerAdminPhone + "@snap-eats.local";
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static String normalizePhoneNumber(String phone) {
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

    private UserAddress createAddress(Long userId,
                                      String label,
                                      String recipientName,
                                      String phoneNumber,
                                      String addressLine,
                                      String landmark,
                                      String city,
                                      String state,
                                      String pincode,
                                      boolean defaultAddress) {
        UserAddress address = new UserAddress();
        address.setUserId(userId);
        address.setLabel(label);
        address.setRecipientName(recipientName);
        address.setPhoneNumber(phoneNumber);
        address.setAddressLine(addressLine);
        address.setLandmark(landmark);
        address.setCity(city);
        address.setState(state);
        address.setPincode(pincode);
        address.setDefaultAddress(defaultAddress);
        address.setActive(true);
        return address;
    }
}
