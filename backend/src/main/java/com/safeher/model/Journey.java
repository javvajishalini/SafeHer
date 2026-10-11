package com.safeher.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "journeys")
public class Journey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "address", column = @Column(name = "start_address")),
        @AttributeOverride(name = "latitude", column = @Column(name = "start_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "start_longitude"))
    })
    private Location startLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "address", column = @Column(name = "dest_address")),
        @AttributeOverride(name = "latitude", column = @Column(name = "dest_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "dest_longitude"))
    })
    private Location destination;

    /** Emergency contacts selected by user to be notified when journey is overdue or SOS is triggered */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "smart_journey_contacts",
        joinColumns = @JoinColumn(name = "journey_id"),
        inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private Set<EmergencyContact> emergencyContacts = new HashSet<>();

    @Column(name = "journey_date")
    private LocalDate journeyDate;

    @Column(name = "planned_start_time")
    private LocalTime plannedStartTime;

    @Column(name = "expected_arrival_time")
    private LocalTime expectedArrivalTime;

    /** Safety buffer in minutes (added on top of expected duration) */
    @Column(name = "safety_buffer_minutes")
    private Integer safetyBufferMinutes;

    /**
     * Absolute UTC deadline: startedAt + expectedDurationMinutes + safetyBufferMinutes.
     * The overdue scheduler compares current time against this value.
     */
    @Column(name = "expected_arrival_at")
    private Instant expectedArrivalAt;

    /** Prevents sending duplicate overdue alerts for the same journey */
    @Column(name = "overdue_alert_sent", nullable = false)
    private boolean overdueAlertSent = false;

    /** Most recent latitude obtained from the browser geolocation API */
    @Column(name = "last_latitude")
    private Double lastLatitude;

    /** Most recent longitude obtained from the browser geolocation API */
    @Column(name = "last_longitude")
    private Double lastLongitude;

    /** Timestamp of the most recent location update */
    @Column(name = "last_location_update")
    private Instant lastLocationUpdate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JourneyStatus status = JourneyStatus.PLANNED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public Journey() {}

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Location getStartLocation() { return startLocation; }
    public void setStartLocation(Location startLocation) { this.startLocation = startLocation; }
    public Location getDestination() { return destination; }
    public void setDestination(Location destination) { this.destination = destination; }
    public Set<EmergencyContact> getEmergencyContacts() { return emergencyContacts; }
    public void setEmergencyContacts(Set<EmergencyContact> emergencyContacts) { this.emergencyContacts = emergencyContacts; }
    public LocalDate getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDate journeyDate) { this.journeyDate = journeyDate; }
    public LocalTime getPlannedStartTime() { return plannedStartTime; }
    public void setPlannedStartTime(LocalTime plannedStartTime) { this.plannedStartTime = plannedStartTime; }
    public LocalTime getExpectedArrivalTime() { return expectedArrivalTime; }
    public void setExpectedArrivalTime(LocalTime expectedArrivalTime) { this.expectedArrivalTime = expectedArrivalTime; }
    public Integer getSafetyBufferMinutes() { return safetyBufferMinutes; }
    public void setSafetyBufferMinutes(Integer safetyBufferMinutes) { this.safetyBufferMinutes = safetyBufferMinutes; }
    public Instant getExpectedArrivalAt() { return expectedArrivalAt; }
    public void setExpectedArrivalAt(Instant expectedArrivalAt) { this.expectedArrivalAt = expectedArrivalAt; }
    public boolean isOverdueAlertSent() { return overdueAlertSent; }
    public void setOverdueAlertSent(boolean overdueAlertSent) { this.overdueAlertSent = overdueAlertSent; }
    public Double getLastLatitude() { return lastLatitude; }
    public void setLastLatitude(Double lastLatitude) { this.lastLatitude = lastLatitude; }
    public Double getLastLongitude() { return lastLongitude; }
    public void setLastLongitude(Double lastLongitude) { this.lastLongitude = lastLongitude; }
    public Instant getLastLocationUpdate() { return lastLocationUpdate; }
    public void setLastLocationUpdate(Instant lastLocationUpdate) { this.lastLocationUpdate = lastLocationUpdate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JourneyStatus getStatus() { return status; }
    public void setStatus(JourneyStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }
}
