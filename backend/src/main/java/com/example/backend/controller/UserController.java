package com.example.backend.controller;

import com.example.backend.dto.ProfileUpdateRequest;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.CommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public UserController(UserRepository userRepository, PostRepository postRepository, CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        String currentUsername = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        
        if (userOpt.isEmpty()) {
            // Check email if username not found, depending on how auth context is populated
            userOpt = userRepository.findByEmail(currentUsername);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.getBio() != null) user.setBio(request.getBio());
            if (request.getLocation() != null) user.setLocation(request.getLocation());
            if (request.getProfileImage() != null) {
                user.setProfileImage(request.getProfileImage());
                postRepository.updateAvatarByAuthor(request.getProfileImage(), user.getUsername());
                commentRepository.updateAvatarByAuthor(request.getProfileImage(), user.getUsername());
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        
        return ResponseEntity.status(404).body("User not found");
    }
}
