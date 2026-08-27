package com.safeher.dto;

import com.safeher.model.JourneyStatus;
import com.safeher.model.Location;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class JourneyResponse {
    private String id;
    private String title;
    private Location startLocation;
    private Location destination;
    private LocalDate journeyDate;
    private LocalTime plannedStartTime;
    private LocalTime expectedArrivalTime;
    private String description;
    private JourneyStatus status;
    private Instant createdAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant cancelledAt;
}
