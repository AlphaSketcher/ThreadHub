package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "comments")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;
    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ElementCollection
    private List<String> helpfulVotes = new ArrayList<>();

    @ElementCollection
    private List<String> notHelpfulVotes = new ArrayList<>();

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonIgnore // Prevent infinite recursion during serialization
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnore // Prevent infinite recursion
    private Comment parentComment;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Comment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getHelpfulCount() { return helpfulVotes != null ? helpfulVotes.size() : 0; }
    public int getNotHelpfulCount() { return notHelpfulVotes != null ? notHelpfulVotes.size() : 0; }

    public List<String> getHelpfulVotes() { return helpfulVotes; }
    public void setHelpfulVotes(List<String> helpfulVotes) { this.helpfulVotes = helpfulVotes; }

    public List<String> getNotHelpfulVotes() { return notHelpfulVotes; }
    public void setNotHelpfulVotes(List<String> notHelpfulVotes) { this.notHelpfulVotes = notHelpfulVotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public Comment getParentComment() { return parentComment; }
    public void setParentComment(Comment parentComment) { this.parentComment = parentComment; }
}
