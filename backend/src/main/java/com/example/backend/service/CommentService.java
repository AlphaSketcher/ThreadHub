package com.example.backend.service;

import com.example.backend.model.Comment;
import com.example.backend.model.Post;
import com.example.backend.model.User;
import com.example.backend.model.Notification;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.controller.WebSocketMessage;

import java.util.Optional;

@Service
public class CommentService {

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

    @Transactional
    public Post addCommentTransaction(Long postId, Comment comment) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            throw new IllegalArgumentException("Post not found.");
        }
        
        Post post = postOpt.get();
        String actualUsername = "Guest";
        try {
            actualUsername = getActualUsername();
        } catch (Exception e) {
            throw new SecurityException("You must be logged in to comment.");
        }
        
        if (comment.getAuthor() == null || comment.getAuthor().isEmpty() || comment.getAuthor().equals("Guest")) {
            comment.setAuthor(actualUsername);
        }
        
        comment.setPost(post);
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
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
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
                
                messagingTemplate.convertAndSend("/topic/notifications/" + post.getAuthor(), savedNotif);
            }
        } catch (Exception e) {
            System.err.println("Failed to send comment notification: " + e.getMessage());
        }
        
        return updatedPost;
    }
}
