package com.example.backend.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String bio;
    private String location;
    private String profileImage;

    public AuthResponse(String token, String username, String email, String bio, String location, String profileImage) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.location = location;
        this.profileImage = profileImage;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getBio() { return bio; }
    public String getLocation() { return location; }
    public String getProfileImage() { return profileImage; }
}
