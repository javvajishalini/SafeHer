package com.safeher.controller;

import com.safeher.dto.CreateJourneyRequest;
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

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    @Autowired
    private JourneyService journeyService;

    @PostMapping
    public ResponseEntity<JourneyResponse> createJourney(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateJourneyRequest request) {
        return new ResponseEntity<>(journeyService.createJourney(userDetails.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JourneyResponse>> getJourneys(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.getUserJourneys(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JourneyResponse> getJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.getJourneyById(id, userDetails.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JourneyResponse> updateJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateJourneyRequest request) {
        return ResponseEntity.ok(journeyService.updateJourney(id, userDetails.getId(), request));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<JourneyResponse> startJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.startJourney(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<JourneyResponse> completeJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.completeJourney(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<JourneyResponse> cancelJourney(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(journeyService.cancelJourney(id, userDetails.getId()));
    }
}
