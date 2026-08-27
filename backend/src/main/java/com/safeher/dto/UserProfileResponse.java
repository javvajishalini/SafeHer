package com.safeher.dto;

import com.safeher.model.Role;

public class UserProfileResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private String profileImage;

    // getters, setters, constructors
    public UserProfileResponse() {}

    public UserProfileResponse(String id, String fullName, String email, String phoneNumber, Role role, String profileImage) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.profileImage = profileImage;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
}
