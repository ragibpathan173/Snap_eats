package com.foodhub.config;

import com.foodhub.model.User;
import com.foodhub.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserDataLoader {

    public static final String DEMO_USER_EMAIL = "guest@snap-eats.local";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserDataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadDemoUser() {
        if (userRepository.findByEmail(DEMO_USER_EMAIL).isPresent()) {
            return;
        }

        User user = new User();
        user.setName("Guest Customer");
        user.setEmail(DEMO_USER_EMAIL);
        user.setPassword(passwordEncoder.encode("guest-pass"));
        user.setPhoneNumber("0000000000");
        user.setAddress("SnapEats Guest Address");
        user.setCity("Demo City");
        user.setState("Demo State");
        user.setPincode("000000");
        user.setRole(User.Role.USER);
        user.setActive(true);
        userRepository.save(user);
    }
}
