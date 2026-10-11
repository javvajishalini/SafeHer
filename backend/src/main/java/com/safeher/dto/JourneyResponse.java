package com.safeher.dto;

import com.safeher.model.EmergencyContact;
import com.safeher.model.JourneyStatus;
import com.safeher.model.Location;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class JourneyResponse {
    private Long id;
    private String title;
    private Location startLocation;
    private Location destination;
    private LocalDate journeyDate;
    private LocalTime plannedStartTime;
    private LocalTime expectedArrivalTime;
    private String description;
    private JourneyStatus status;
    private Integer safetyBufferMinutes;
    private Integer expectedDurationMinutes;

    /**
     * ISO-8601 UTC instant that the frontend uses for the real countdown timer.
     * Calculated as: startedAt + expectedDurationMinutes + safetyBufferMinutes.
     */
    private Instant expectedArrivalAt;

    private Double lastLatitude;
    private Double lastLongitude;
    private Instant lastLocationUpdate;

    private Instant createdAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant cancelledAt;

    /** Selected emergency contact summaries */
    private List<ContactSummary> emergencyContacts;

    /** Maps link for current location */
    private String lastLocationUrl;

    // ---- Nested DTO ----
    public static class ContactSummary {
        private Long id;
        private String name;
        private String relationship;
        private String phoneNumber;
        private String email;

        public static ContactSummary from(EmergencyContact c) {
            ContactSummary s = new ContactSummary();
            s.id = c.getId();
            s.name = c.getName();
            s.relationship = c.getRelationship();
            s.phoneNumber = c.getPhoneNumber();
            s.email = c.getEmail();
            return s;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getRelationship() { return relationship; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getEmail() { return email; }
    }

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Location getStartLocation() { return startLocation; }
    public void setStartLocation(Location startLocation) { this.startLocation = startLocation; }
    public Location getDestination() { return destination; }
    public void setDestination(Location destination) { this.destination = destination; }
    public LocalDate getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDate journeyDate) { this.journeyDate = journeyDate; }
    public LocalTime getPlannedStartTime() { return plannedStartTime; }
    public void setPlannedStartTime(LocalTime plannedStartTime) { this.plannedStartTime = plannedStartTime; }
    public LocalTime getExpectedArrivalTime() { return expectedArrivalTime; }
    public void setExpectedArrivalTime(LocalTime expectedArrivalTime) { this.expectedArrivalTime = expectedArrivalTime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JourneyStatus getStatus() { return status; }
    public void setStatus(JourneyStatus status) { this.status = status; }
    public Integer getSafetyBufferMinutes() { return safetyBufferMinutes; }
    public void setSafetyBufferMinutes(Integer safetyBufferMinutes) { this.safetyBufferMinutes = safetyBufferMinutes; }
    public Integer getExpectedDurationMinutes() { return expectedDurationMinutes; }
    public void setExpectedDurationMinutes(Integer expectedDurationMinutes) { this.expectedDurationMinutes = expectedDurationMinutes; }
    public Instant getExpectedArrivalAt() { return expectedArrivalAt; }
    public void setExpectedArrivalAt(Instant expectedArrivalAt) { this.expectedArrivalAt = expectedArrivalAt; }
    public Double getLastLatitude() { return lastLatitude; }
    public void setLastLatitude(Double lastLatitude) { this.lastLatitude = lastLatitude; }
    public Double getLastLongitude() { return lastLongitude; }
    public void setLastLongitude(Double lastLongitude) { this.lastLongitude = lastLongitude; }
    public Instant getLastLocationUpdate() { return lastLocationUpdate; }
    public void setLastLocationUpdate(Instant lastLocationUpdate) { this.lastLocationUpdate = lastLocationUpdate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }
    public List<ContactSummary> getEmergencyContacts() { return emergencyContacts; }
    public void setEmergencyContacts(List<ContactSummary> emergencyContacts) { this.emergencyContacts = emergencyContacts; }
    public String getLastLocationUrl() { return lastLocationUrl; }
    public void setLastLocationUrl(String lastLocationUrl) { this.lastLocationUrl = lastLocationUrl; }
}
