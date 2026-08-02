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
import java.util.List;
import java.util.ArrayList;

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
        try {
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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "none"));
        }
    }

    @PostMapping("/follow/{targetUsername}")
    public ResponseEntity<?> toggleFollow(@PathVariable String targetUsername, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        String currentUsername = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(currentUsername);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getUsername().equals(targetUsername)) {
                return ResponseEntity.badRequest().body("Cannot follow yourself");
            }
            
            if (user.getFollowing().contains(targetUsername)) {
                user.getFollowing().remove(targetUsername);
            } else {
                user.getFollowing().add(targetUsername);
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(user.getFollowing());
        }
        
        return ResponseEntity.status(404).body("User not found");
    }

    @GetMapping("/following")
    public ResponseEntity<?> getFollowingUsers(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        String currentUsername = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(currentUsername);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getFollowing().isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            List<User> followedUsers = userRepository.findByUsernameIn(user.getFollowing());
            return ResponseEntity.ok(followedUsers);
        }
        
        return ResponseEntity.status(404).body("User not found");
    }
}
