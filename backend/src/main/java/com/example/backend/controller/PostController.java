package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // Ensure author is set from JWT if not present, though frontend sends it
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (post.getAuthor() == null || post.getAuthor().isEmpty() || post.getAuthor().equals("Guest")) {
            post.setAuthor(currentUsername);
        }
        
        Post savedPost = postRepository.save(post);
        
        // Broadcast new post to all connected WebSocket clients
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_CREATED", savedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok(savedPost);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Ensure only author can delete (optional extra check)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent() && !postOpt.get().getAuthor().equals(currentUsername)) {
            return ResponseEntity.status(403).body("Not authorized to delete this post");
        }
        
        postRepository.deleteById(id);
        
        // Broadcast deletion
        WebSocketMessage<Long> wsMessage = new WebSocketMessage<>("POST_DELETED", id);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/vote")
    public ResponseEntity<Post> votePost(@PathVariable Long id, @RequestParam String type) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Post post = postOpt.get();
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        if ("up".equals(type)) {
            if (post.getUpvotes().contains(currentUsername)) {
                post.getUpvotes().remove(currentUsername);
            } else {
                post.getUpvotes().add(currentUsername);
                post.getDownvotes().remove(currentUsername);
            }
        } else if ("down".equals(type)) {
            if (post.getDownvotes().contains(currentUsername)) {
                post.getDownvotes().remove(currentUsername);
            } else {
                post.getDownvotes().add(currentUsername);
                post.getUpvotes().remove(currentUsername);
            }
        }
        
        Post updatedPost = postRepository.save(post);
        
        // Broadcast update
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok(updatedPost);
    }
}
