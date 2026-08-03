package com.example.backend.controller;

import com.example.backend.model.Comment;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.model.Notification;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private CommentService commentService;

    private String getActualUsername() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(User::getUsername).orElse(email);
    }

    @PostMapping
    public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody Comment comment) {
        try {
            if (comment == null || comment.getText() == null || comment.getText().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment text cannot be empty.");
            }
            
            Post updatedPost = commentService.addCommentTransaction(postId, comment);
            return ResponseEntity.ok(updatedPost);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            Throwable rootCause = e;
            while (rootCause.getCause() != null) {
                rootCause = rootCause.getCause();
            }
            return ResponseEntity.status(500).body("DB Error: " + rootCause.getMessage());
        }
    }

    @PostMapping("/{commentId}/vote")
    public ResponseEntity<Post> voteComment(@PathVariable Long postId, @PathVariable Long commentId, @RequestParam String type) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOpt.get();
        Comment comment = commentOpt.get();
        String actualUsername = getActualUsername();

        if ("helpful".equals(type)) {
            if (comment.getHelpfulVotes().contains(actualUsername)) {
                comment.getHelpfulVotes().remove(actualUsername);
            } else {
                comment.getHelpfulVotes().add(actualUsername);
                comment.getNotHelpfulVotes().remove(actualUsername);
                
                // Create Notification
                if (comment.getAuthor() != null && !comment.getAuthor().equals(actualUsername)) {
                    Notification notif = new Notification();
                    notif.setRecipient(comment.getAuthor());
                    notif.setSender(actualUsername);
                    notif.setType("vote");
                    notif.setMessage("@" + actualUsername + " found your comment helpful");
                    notif.setPostId(post.getId());
                    Notification savedNotif = notificationRepository.save(notif);
                    
                    // Broadcast Notification to recipient
                    messagingTemplate.convertAndSend("/topic/notifications/" + comment.getAuthor(), savedNotif);
                }
            }
        } else if ("not_helpful".equals(type)) {
            if (comment.getNotHelpfulVotes().contains(actualUsername)) {
                comment.getNotHelpfulVotes().remove(actualUsername);
            } else {
                comment.getNotHelpfulVotes().add(actualUsername);
                comment.getHelpfulVotes().remove(actualUsername);
            }
        }

        commentRepository.save(comment);
        
        // Eagerly initialize all lazy collections before Jackson serialization on worker thread
        if (post.getComments() != null) {
            post.getComments().size();
            for(Comment c : post.getComments()) {
                if (c.getHelpfulVotes() != null) c.getHelpfulVotes().size();
                if (c.getNotHelpfulVotes() != null) c.getNotHelpfulVotes().size();
            }
        }
        if (post.getTags() != null) post.getTags().size();
        if (post.getImages() != null) post.getImages().size();
        if (post.getUpvotes() != null) post.getUpvotes().size();
        if (post.getDownvotes() != null) post.getDownvotes().size();
        
        // We broadcast POST_UPDATED so the entire post (including comments) updates in the UI
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", post);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);

        return ResponseEntity.ok(post);
    }
}
