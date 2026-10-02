package com.safeher.dto;

import com.safeher.model.Location;
import java.time.LocalDate;
import java.time.LocalTime;

public class IncidentReportRequest {
    private String incidentType;
    private String description;
    private Location location;
    private LocalDate incidentDate;
    private LocalTime incidentTime;

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public LocalTime getIncidentTime() { return incidentTime; }
    public void setIncidentTime(LocalTime incidentTime) { this.incidentTime = incidentTime; }
}
