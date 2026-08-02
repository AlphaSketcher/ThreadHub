package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;
    private String avatar;
    private boolean verified;

    private String category;
    
    @Column(length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    @ElementCollection
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    private List<String> upvotes = new ArrayList<>();

    @ElementCollection
    private List<String> downvotes = new ArrayList<>();

    private int discussCount;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Post() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<String> getUpvotes() { return upvotes; }
    public void setUpvotes(List<String> upvotes) { this.upvotes = upvotes; }

    public List<String> getDownvotes() { return downvotes; }
    public void setDownvotes(List<String> downvotes) { this.downvotes = downvotes; }

    public int getDiscussCount() { return discussCount; }
    public void setDiscussCount(int discussCount) { this.discussCount = discussCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
