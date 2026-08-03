package com.example.backend.controller;

import com.example.backend.model.Comment;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.model.Notification;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@Transactional
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

            Optional<Post> postOpt = postRepository.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Post not found.");
            }
            
            Post post = postOpt.get();
            String actualUsername = "Guest";
            try {
                actualUsername = getActualUsername();
            } catch (Exception e) {
                return ResponseEntity.status(401).body("You must be logged in to comment.");
            }
            
            if (comment.getAuthor() == null || comment.getAuthor().isEmpty() || comment.getAuthor().equals("Guest")) {
                comment.setAuthor(actualUsername);
            }
            
            comment.setPost(post);
            // Ensure lists are initialized
            if (comment.getHelpfulVotes() == null) comment.setHelpfulVotes(new java.util.ArrayList<>());
            if (comment.getNotHelpfulVotes() == null) comment.setNotHelpfulVotes(new java.util.ArrayList<>());

            Comment savedComment = commentRepository.save(comment);
            
            if (post.getComments() == null) {
                post.setComments(new java.util.ArrayList<>());
            }
            if (!post.getComments().contains(savedComment)) {
                post.getComments().add(savedComment);
            }
            
            post.setHasComment(true);
            post.setDiscussCount(post.getDiscussCount() + 1);
            Post updatedPost = postRepository.save(post);
            
            // Eagerly initialize all lazy collections before Jackson serialization on worker thread
            if (updatedPost.getComments() != null) {
                updatedPost.getComments().size();
                for(Comment c : updatedPost.getComments()) {
                    if (c.getHelpfulVotes() != null) c.getHelpfulVotes().size();
                    if (c.getNotHelpfulVotes() != null) c.getNotHelpfulVotes().size();
                }
            }
            if (updatedPost.getTags() != null) updatedPost.getTags().size();
            if (updatedPost.getImages() != null) updatedPost.getImages().size();
            if (updatedPost.getUpvotes() != null) updatedPost.getUpvotes().size();
            if (updatedPost.getDownvotes() != null) updatedPost.getDownvotes().size();
            
            WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
            System.out.println("Broadcasted post comments size: " + (updatedPost.getComments() != null ? updatedPost.getComments().size() : "null"));
            messagingTemplate.convertAndSend("/topic/posts", wsMessage);
            
            // Create Notification safely
            try {
                if (post.getAuthor() != null && !post.getAuthor().equals(actualUsername)) {
                    Notification notif = new Notification();
                    notif.setRecipient(post.getAuthor());
                    notif.setSender(actualUsername);
                    notif.setType("comment");
                    String cText = comment.getText() != null ? comment.getText() : "";
                    String truncatedComment = cText.length() > 30 ? cText.substring(0, 30) + "..." : cText;
                    notif.setMessage("@" + actualUsername + " commented on your post: \"" + truncatedComment + "\"");
                    notif.setPostId(post.getId());
                    Notification savedNotif = notificationRepository.save(notif);
                    
                    // Broadcast Notification to recipient
                    messagingTemplate.convertAndSend("/topic/notifications/" + post.getAuthor(), savedNotif);
                }
            } catch (Exception e) {
                System.err.println("Failed to send comment notification: " + e.getMessage());
                // Non-fatal error, do not fail the request
            }
            
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("An internal error occurred while posting your comment.");
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
