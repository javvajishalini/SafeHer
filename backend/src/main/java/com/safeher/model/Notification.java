package com.safeher.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 30)
    private String type; // SMS, EMAIL, PUSH

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, SENT, DELIVERED, FAILED

    @Column
    private String recipient;

    @Column(length = 50)
    private String provider; // e.g. "Twilio", "JavaMail/SMTP", "Simulated"

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "related_sos_id")
    private Long relatedSosId;

    @Column(name = "related_journey_id")
    private Long relatedJourneyId;

    @Column(name = "related_contact_id")
    private Long relatedContactId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Long getRelatedSosId() { return relatedSosId; }
    public void setRelatedSosId(Long relatedSosId) { this.relatedSosId = relatedSosId; }
    public Long getRelatedJourneyId() { return relatedJourneyId; }
    public void setRelatedJourneyId(Long relatedJourneyId) { this.relatedJourneyId = relatedJourneyId; }
    public Long getRelatedContactId() { return relatedContactId; }
    public void setRelatedContactId(Long relatedContactId) { this.relatedContactId = relatedContactId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}
