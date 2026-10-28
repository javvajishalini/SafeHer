package com.safeher.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sos_incidents")
public class SOSIncident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private Double latitude;
    private Double longitude;
    private Double accuracy;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "sos_type", nullable = false)
    private SOSType sosType = SOSType.STANDARD;

    @Column(name = "journey_id")
    private Long journeyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SOSStatus status = SOSStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "sos_incident_contacts",
        joinColumns = @JoinColumn(name = "sos_id"),
        inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private Set<EmergencyContact> emergencyContacts = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (timestamp == null) timestamp = Instant.now();
        if (sosType == null) sosType = SOSType.STANDARD;
    }

    public SOSIncident() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public SOSType getSosType() { return sosType; }
    public void setSosType(SOSType sosType) { this.sosType = sosType; }
    public Long getJourneyId() { return journeyId; }
    public void setJourneyId(Long journeyId) { this.journeyId = journeyId; }
    public SOSStatus getStatus() { return status; }
    public void setStatus(SOSStatus status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Set<EmergencyContact> getEmergencyContacts() { return emergencyContacts; }
    public void setEmergencyContacts(Set<EmergencyContact> emergencyContacts) { this.emergencyContacts = emergencyContacts; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
