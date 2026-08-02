package com.example.backend.service;

import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.AuthProvider;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    // We instantiate AuthenticationManager manually or via beans
    // For simplicity, we can do manual check for now, or use AuthManager

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole("ROLE_USER");

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return new AuthResponse(jwtToken, user.getUsername(), user.getEmail(), user.getBio(), user.getLocation(), user.getProfileImage());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .orElseGet(() -> userRepository.findByUsername(request.getIdentifier())
                        .orElseThrow(() -> new RuntimeException("Invalid credentials")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return new AuthResponse(jwtToken, user.getUsername(), user.getEmail(), user.getBio(), user.getLocation(), user.getProfileImage());
    }
}
