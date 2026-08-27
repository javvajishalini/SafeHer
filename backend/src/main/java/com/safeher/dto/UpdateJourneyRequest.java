package com.safeher.dto;

import com.safeher.model.Location;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateJourneyRequest {
    private String title;
    private Location startLocation;
    private Location destination;
    private LocalDate journeyDate;
    private LocalTime plannedStartTime;
    private LocalTime expectedArrivalTime;
    private String description;
}
