package com.safeher.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "journeys")
public class Journey {
    
    @Id
    private String id;
    
    private String userId;
    
    private String title;
    
    private Location startLocation;
    
    private Location destination;
    
    private LocalDate journeyDate;
    
    private LocalTime plannedStartTime;
    
    private LocalTime expectedArrivalTime;
    
    private String description;
    
    private JourneyStatus status;
    
    private Instant createdAt;
    
    private Instant updatedAt;
    
    private Instant startedAt;
    
    private Instant completedAt;
    
    private Instant cancelledAt;
}
