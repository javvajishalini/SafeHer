package com.safeher.service;

import com.safeher.dto.CreateJourneyRequest;
import com.safeher.dto.JourneyResponse;
import com.safeher.dto.UpdateJourneyRequest;
import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import com.safeher.repository.JourneyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JourneyService {

    @Autowired
    private JourneyRepository journeyRepository;

    public JourneyResponse createJourney(String userId, CreateJourneyRequest request) {
        if (request.getPlannedStartTime() != null && request.getExpectedArrivalTime() != null) {
            if (request.getExpectedArrivalTime().isBefore(request.getPlannedStartTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected arrival time must be after planned start time");
            }
        }

        Journey journey = Journey.builder()
                .userId(userId)
                .title(request.getTitle())
                .startLocation(request.getStartLocation())
                .destination(request.getDestination())
                .journeyDate(request.getJourneyDate())
                .plannedStartTime(request.getPlannedStartTime())
                .expectedArrivalTime(request.getExpectedArrivalTime())
                .description(request.getDescription())
                .status(JourneyStatus.PLANNED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return mapToResponse(journeyRepository.save(journey));
    }

    public List<JourneyResponse> getUserJourneys(String userId) {
        return journeyRepository.findByUserIdOrderByJourneyDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JourneyResponse getJourneyById(String id, String userId) {
        Journey journey = journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));
        return mapToResponse(journey);
    }

    public JourneyResponse updateJourney(String id, String userId, UpdateJourneyRequest request) {
        Journey journey = journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));

        if (journey.getStatus() != JourneyStatus.PLANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only planned journeys can be modified");
        }

        if (request.getPlannedStartTime() != null && request.getExpectedArrivalTime() != null) {
            if (request.getExpectedArrivalTime().isBefore(request.getPlannedStartTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected arrival time must be after planned start time");
            }
        }

        journey.setTitle(request.getTitle());
        journey.setStartLocation(request.getStartLocation());
        journey.setDestination(request.getDestination());
        journey.setJourneyDate(request.getJourneyDate());
        journey.setPlannedStartTime(request.getPlannedStartTime());
        journey.setExpectedArrivalTime(request.getExpectedArrivalTime());
        journey.setDescription(request.getDescription());
        journey.setUpdatedAt(Instant.now());

        return mapToResponse(journeyRepository.save(journey));
    }

    public JourneyResponse cancelJourney(String id, String userId) {
        Journey journey = journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));

        if (journey.getStatus() != JourneyStatus.PLANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only planned journeys can be cancelled");
        }

        journey.setStatus(JourneyStatus.CANCELLED);
        journey.setCancelledAt(Instant.now());
        journey.setUpdatedAt(Instant.now());

        return mapToResponse(journeyRepository.save(journey));
    }

    public JourneyResponse startJourney(String id, String userId) {
        Journey journey = journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));

        if (journey.getStatus() != JourneyStatus.PLANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only planned journeys can be started");
        }

        journey.setStatus(JourneyStatus.ACTIVE);
        journey.setStartedAt(Instant.now());
        journey.setUpdatedAt(Instant.now());

        return mapToResponse(journeyRepository.save(journey));
    }

    public JourneyResponse completeJourney(String id, String userId) {
        Journey journey = journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));

        if (journey.getStatus() != JourneyStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only active journeys can be completed");
        }

        journey.setStatus(JourneyStatus.COMPLETED);
        journey.setCompletedAt(Instant.now());
        journey.setUpdatedAt(Instant.now());

        return mapToResponse(journeyRepository.save(journey));
    }

    private JourneyResponse mapToResponse(Journey journey) {
        JourneyResponse response = new JourneyResponse();
        response.setId(journey.getId());
        response.setTitle(journey.getTitle());
        response.setStartLocation(journey.getStartLocation());
        response.setDestination(journey.getDestination());
        response.setJourneyDate(journey.getJourneyDate());
        response.setPlannedStartTime(journey.getPlannedStartTime());
        response.setExpectedArrivalTime(journey.getExpectedArrivalTime());
        response.setDescription(journey.getDescription());
        response.setStatus(journey.getStatus());
        response.setCreatedAt(journey.getCreatedAt());
        response.setStartedAt(journey.getStartedAt());
        response.setCompletedAt(journey.getCompletedAt());
        response.setCancelledAt(journey.getCancelledAt());
        return response;
    }
}
