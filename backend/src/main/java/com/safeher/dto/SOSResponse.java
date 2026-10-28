package com.safeher.dto;

import com.safeher.model.EmergencyContact;
import com.safeher.model.SOSStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class SOSResponse {
    private Long id;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private String address;
    private Instant timestamp;
    private SOSStatus status;
    private String message;
    private Instant resolvedAt;
    private Instant createdAt;
    private String mapsUrl;
    private com.safeher.model.SOSType sosType;
    private Long journeyId;
    private List<ContactSummary> emergencyContacts = new ArrayList<>();
    private JourneySummary activeJourney;

    public static class ContactSummary {
        private Long id;
        private String name;
        private String phoneNumber;
        private String email;
        private String relationship;
        private Integer priority;

        public static ContactSummary from(EmergencyContact c) {
            ContactSummary s = new ContactSummary();
            s.id = c.getId();
            s.name = c.getName();
            s.phoneNumber = c.getPhoneNumber();
            s.email = c.getEmail();
            s.relationship = c.getRelationship();
            s.priority = c.getPriority();
            return s;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getEmail() { return email; }
        public String getRelationship() { return relationship; }
        public Integer getPriority() { return priority; }
    }

    public static class JourneySummary {
        private Long id;
        private String title;
        private String startAddress;
        private String destAddress;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStartAddress() { return startAddress; }
        public void setStartAddress(String startAddress) { this.startAddress = startAddress; }
        public String getDestAddress() { return destAddress; }
        public void setDestAddress(String destAddress) { this.destAddress = destAddress; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public SOSStatus getStatus() { return status; }
    public void setStatus(SOSStatus status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getMapsUrl() { return mapsUrl; }
    public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }
    public List<ContactSummary> getEmergencyContacts() { return emergencyContacts; }
    public void setEmergencyContacts(List<ContactSummary> emergencyContacts) { this.emergencyContacts = emergencyContacts; }
    public JourneySummary getActiveJourney() { return activeJourney; }
    public void setActiveJourney(JourneySummary activeJourney) { this.activeJourney = activeJourney; }
    public com.safeher.model.SOSType getSosType() { return sosType; }
    public void setSosType(com.safeher.model.SOSType sosType) { this.sosType = sosType; }
    public Long getJourneyId() { return journeyId; }
    public void setJourneyId(Long journeyId) { this.journeyId = journeyId; }
}
