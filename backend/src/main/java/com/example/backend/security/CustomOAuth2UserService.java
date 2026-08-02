package com.example.backend.security;

import com.example.backend.model.AuthProvider;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // If they signed up via local previously, we could optionally update provider to GOOGLE
            // or just leave it. Let's ensure they can log in regardless.
        } else {
            // Register a new user
            user = new User();
            user.setEmail(email);
            
            // Extract a display name or username
            String name = oAuth2User.getAttribute("name");
            if (name != null && !name.isEmpty()) {
                // Remove spaces and make it a valid username
                String baseUsername = name.replaceAll("\\s+", "").toLowerCase();
                // Ensure uniqueness
                String username = baseUsername;
                int suffix = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + suffix;
                    suffix++;
                }
                user.setUsername(username);
            } else {
                user.setUsername("user_" + UUID.randomUUID().toString().substring(0, 8));
            }
            
            user.setProvider(AuthProvider.GOOGLE);
            user.setRole("ROLE_USER");
            userRepository.save(user);
        }

        return new CustomUserDetails(user, oAuth2User.getAttributes());
    }
}
