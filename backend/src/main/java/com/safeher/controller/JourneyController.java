package com.safeher.controller;

import com.safeher.dto.CreateJourneyRequest;
import com.safeher.dto.JourneyLocationUpdateRequest;
import com.safeher.dto.JourneyResponse;
import com.safeher.dto.UpdateJourneyRequest;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.JourneyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    @Autowired
    private JourneyService journeyService;

    /** Create a new journey (PLANNED status) */
    @PostMapping
    public ResponseEntity<JourneyResponse> createJourney(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateJourneyRequest request) {
        return new ResponseEntity<>(journeyService.createJourney(userDetails.getId(), request), HttpStatus.CREATED);
    }

    /** Get all journeys for the authenticated user */
    @GetMapping
    public ResponseEntity<List<JourneyResponse>> getJourneys(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.getUserJourneys(userDetails.getId()));
    }

    /** Get the currently active (or overdue) journey — used by the dashboard countdown timer */
    @GetMapping("/active")
    public ResponseEntity<JourneyResponse> getActiveJourney(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        JourneyResponse active = journeyService.getActiveJourney(userDetails.getId());
        if (active == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(active);
    }

    /** Get a specific journey by ID */
    @GetMapping("/{id}")
    public ResponseEntity<JourneyResponse> getJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.getJourneyById(id, userDetails.getId()));
    }

    /** Update a planned journey */
    @PutMapping("/{id}")
    public ResponseEntity<JourneyResponse> updateJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateJourneyRequest request) {
        return ResponseEntity.ok(journeyService.updateJourney(id, userDetails.getId(), request));
    }

    /**
     * Start a journey.
     * Accepts optional body with { latitude, longitude, expectedDurationMinutes }
     * so the frontend can pass real GPS coordinates at the moment of starting.
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<JourneyResponse> startJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, Object> body) {
        Double lat = body != null && body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : null;
        Double lng = body != null && body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : null;
        Integer durationMins = body != null && body.get("expectedDurationMinutes") != null
                ? ((Number) body.get("expectedDurationMinutes")).intValue() : 30;

        return ResponseEntity.ok(journeyService.startJourney(id, userDetails.getId(), lat, lng, durationMins));
    }

    /**
     * Update the user's current location during an active journey.
     * Called by the frontend every ~30 seconds.
     */
    @PostMapping("/{id}/location")
    public ResponseEntity<JourneyResponse> updateLocation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody JourneyLocationUpdateRequest request) {
        return ResponseEntity.ok(journeyService.updateLocation(id, userDetails.getId(), request));
    }

    /**
     * Complete a journey (user confirmed arrival).
     * Accepts optional body with { sendSafeArrival: true/false }
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<JourneyResponse> completeJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, Object> body) {
        boolean sendSafeArrival = body == null || !Boolean.FALSE.equals(body.get("sendSafeArrival"));
        return ResponseEntity.ok(journeyService.completeJourney(id, userDetails.getId(), sendSafeArrival));
    }

    /** Cancel a journey */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<JourneyResponse> cancelJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.cancelJourney(id, userDetails.getId()));
    }

    // Keep old PATCH aliases for backward compatibility with existing frontend
    @PatchMapping("/{id}/start")
    public ResponseEntity<JourneyResponse> startJourneyPatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.startJourney(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<JourneyResponse> completeJourneyPatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.completeJourney(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<JourneyResponse> cancelJourneyPatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.cancelJourney(id, userDetails.getId()));
    }
}
