package com.safeher.dto;

import com.safeher.model.Location;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class CreateJourneyRequest {

    @NotBlank
    private String title;

    @NotNull
    private Location startLocation;

    @NotNull
    private Location destination;

    private LocalDate journeyDate;
    private LocalTime plannedStartTime;
    private LocalTime expectedArrivalTime;
    private String description;

    /** Total expected travel duration in minutes (user-provided) */
    private Integer expectedDurationMinutes;

    /** Additional safety buffer in minutes after expected duration */
    private Integer safetyBufferMinutes;

    /** IDs of emergency contacts to notify when journey is overdue or SOS is triggered */
    private List<Long> emergencyContactIds;

    // ---- Getters & Setters ----
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
    public Integer getExpectedDurationMinutes() { return expectedDurationMinutes; }
    public void setExpectedDurationMinutes(Integer expectedDurationMinutes) { this.expectedDurationMinutes = expectedDurationMinutes; }
    public Integer getSafetyBufferMinutes() { return safetyBufferMinutes; }
    public void setSafetyBufferMinutes(Integer safetyBufferMinutes) { this.safetyBufferMinutes = safetyBufferMinutes; }
    public List<Long> getEmergencyContactIds() { return emergencyContactIds; }
    public void setEmergencyContactIds(List<Long> emergencyContactIds) { this.emergencyContactIds = emergencyContactIds; }
}
