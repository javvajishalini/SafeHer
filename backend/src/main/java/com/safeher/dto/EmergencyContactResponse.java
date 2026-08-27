package com.safeher.dto;

public class EmergencyContactResponse {
    private String id;
    private String name;
    private String phoneNumber;
    private String email;
    private String relationship;
    private Integer priority;
    private boolean isActive;

    public EmergencyContactResponse() {}

    public EmergencyContactResponse(String id, String name, String phoneNumber, String email, String relationship, Integer priority, boolean isActive) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.relationship = relationship;
        this.priority = priority;
        this.isActive = isActive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
