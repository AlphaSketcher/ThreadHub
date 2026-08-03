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
    public ResponseEntity<Post> addComment(@PathVariable Long postId, @RequestBody Comment comment) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Post post = postOpt.get();
        String actualUsername = getActualUsername();
        
        if (comment.getAuthor() == null || comment.getAuthor().isEmpty() || comment.getAuthor().equals("Guest")) {
            comment.setAuthor(actualUsername);
        }
        
        comment.setPost(post);
        Comment savedComment = commentRepository.save(comment);
        
        post.getComments().add(savedComment);
        
        post.setHasComment(true);
        post.setDiscussCount(post.getDiscussCount() + 1);
        Post updatedPost = postRepository.save(post);
        
        // Eagerly initialize all lazy collections before Jackson serialization on worker thread
        updatedPost.getComments().size();
        updatedPost.getTags().size();
        updatedPost.getImages().size();
        updatedPost.getUpvotes().size();
        updatedPost.getDownvotes().size();
        for(Comment c : updatedPost.getComments()) {
            c.getHelpfulVotes().size();
            c.getNotHelpfulVotes().size();
        }
        
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        // Create Notification
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
        
        return ResponseEntity.ok(updatedPost);
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
        post.getComments().size();
        post.getTags().size();
        post.getImages().size();
        post.getUpvotes().size();
        post.getDownvotes().size();
        for(Comment c : post.getComments()) {
            c.getHelpfulVotes().size();
            c.getNotHelpfulVotes().size();
        }
        
        // We broadcast POST_UPDATED so the entire post (including comments) updates in the UI
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", post);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);

        return ResponseEntity.ok(post);
    }
}
