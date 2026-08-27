package com.safeher.dto;

import com.safeher.model.Role;

public class AuthResponse {
    private String token;
    private String id;
    private String fullName;
    private String email;
    private Role role;

    public AuthResponse(String token, String id, String fullName, String email, Role role) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
}
