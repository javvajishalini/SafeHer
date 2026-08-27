package com.safeher.controller;

import com.safeher.dto.CreateJourneyRequest;
import com.safeher.dto.JourneyResponse;
import com.safeher.dto.UpdateJourneyRequest;
import com.safeher.service.JourneyService;
import com.safeher.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    @Autowired
    private JourneyService journeyService;

    @Autowired
    private UserService userService;

    private String getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserProfile(email).getId();
    }

    @PostMapping
    public ResponseEntity<JourneyResponse> createJourney(
            Authentication authentication,
            @RequestBody CreateJourneyRequest request) {
        String userId = getUserId(authentication);
        JourneyResponse response = journeyService.createJourney(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JourneyResponse>> getUserJourneys(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.getUserJourneys(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JourneyResponse> getJourneyById(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.getJourneyById(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JourneyResponse> updateJourney(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody UpdateJourneyRequest request) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.updateJourney(id, userId, request));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<JourneyResponse> startJourney(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.startJourney(id, userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<JourneyResponse> completeJourney(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.completeJourney(id, userId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<JourneyResponse> cancelJourney(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(journeyService.cancelJourney(id, userId));
    }
}
