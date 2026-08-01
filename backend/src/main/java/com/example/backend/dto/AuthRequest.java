package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    @NotBlank(message = "Email or username is required")
    private String identifier; // can be email or username

    @NotBlank(message = "Password is required")
    private String password;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
