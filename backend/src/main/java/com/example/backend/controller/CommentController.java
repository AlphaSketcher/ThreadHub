package com.example.backend.controller;

import com.example.backend.model.Comment;
import com.example.backend.model.Post;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Post> addComment(@PathVariable Long postId, @RequestBody Comment comment) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Post post = postOpt.get();
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        if (comment.getAuthor() == null || comment.getAuthor().isEmpty() || comment.getAuthor().equals("Guest")) {
            comment.setAuthor(currentUsername);
        }
        
        comment.setPost(post);
        commentRepository.save(comment);
        
        post.setHasComment(true);
        post.setDiscussCount(post.getDiscussCount() + 1);
        Post updatedPost = postRepository.save(post);
        
        WebSocketMessage<Post> wsMessage = new WebSocketMessage<>("POST_UPDATED", updatedPost);
        messagingTemplate.convertAndSend("/topic/posts", wsMessage);
        
        return ResponseEntity.ok(updatedPost);
    }
}
