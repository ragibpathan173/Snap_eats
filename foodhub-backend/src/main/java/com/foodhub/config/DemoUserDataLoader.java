package com.foodhub.config;

import com.foodhub.model.User;
import com.foodhub.model.UserAddress;
import com.foodhub.repository.UserAddressRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserDataLoader {

    public static final String DEMO_USER_EMAIL = "guest@snap-eats.local";

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserDataLoader(UserRepository userRepository,
                              UserAddressRepository userAddressRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
        this.passwordEncoder = passwordEncoder;
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
