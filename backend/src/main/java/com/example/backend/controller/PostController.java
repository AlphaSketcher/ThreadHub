package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.model.Notification;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@Transactional
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private String getActualUsername() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(User::getUsername).orElse(email);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        String actualUsername = getActualUsername();
        if (post.getAuthor() == null || post.getAuthor().isEmpty() || post.getAuthor().equals("Guest")) {
            post.setAuthor(actualUsername);
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
        String actualUsername = getActualUsername();
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent() && !postOpt.get().getAuthor().equals(actualUsername)) {
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
        String actualUsername = getActualUsername();
        
        if ("up".equals(type)) {
            if (post.getUpvotes().contains(actualUsername)) {
                post.getUpvotes().remove(actualUsername);
            } else {
                post.getUpvotes().add(actualUsername);
                post.getDownvotes().remove(actualUsername);
                
                // Create Notification
                if (post.getAuthor() != null && !post.getAuthor().equals(actualUsername)) {
                    Notification notif = new Notification();
                    notif.setRecipient(post.getAuthor());
                    notif.setSender(actualUsername);
                    notif.setType("like");
                    notif.setMessage("@" + actualUsername + " liked your post: \"" + post.getTitle() + "\"");
                    notif.setPostId(post.getId());
                    Notification savedNotif = notificationRepository.save(notif);
                    
                    // Broadcast Notification to recipient's private channel
                    messagingTemplate.convertAndSend("/topic/notifications/" + post.getAuthor(), savedNotif);
                }
            }
        } else if ("down".equals(type)) {
            if (post.getDownvotes().contains(actualUsername)) {
                post.getDownvotes().remove(actualUsername);
            } else {
                post.getDownvotes().add(actualUsername);
                post.getUpvotes().remove(actualUsername);
            }
        }
        
        Post updatedPost = postRepository.save(post);
        
        // Eagerly initialize all lazy collections before Jackson serialization on worker thread
        // Eagerly initialize all lazy collections before Jackson serialization on worker thread
        if (updatedPost.getComments() != null) {
            updatedPost.getComments().size();
            for(com.example.backend.model.Comment c : updatedPost.getComments()) {
                if (c.getHelpfulVotes() != null) c.getHelpfulVotes().size();
                if (c.getNotHelpfulVotes() != null) c.getNotHelpfulVotes().size();
            }
        }
        if (updatedPost.getTags() != null) updatedPost.getTags().size();
        if (updatedPost.getImages() != null) updatedPost.getImages().size();
        if (updatedPost.getUpvotes() != null) updatedPost.getUpvotes().size();
        if (updatedPost.getDownvotes() != null) updatedPost.getDownvotes().size();
        
        // Broadcast update
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok(updatedPost);
    }
    
    @PutMapping("/{id}/view")
    public ResponseEntity<Post> incrementView(@PathVariable Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Post post = postOpt.get();
        post.setViews(post.getViews() + 1);
        
        Post updatedPost = postRepository.save(post);
        
        // Broadcast update
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok(updatedPost);
    }
}
