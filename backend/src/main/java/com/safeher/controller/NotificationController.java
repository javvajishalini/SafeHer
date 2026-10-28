package com.safeher.controller;

import com.safeher.model.Notification;
import com.safeher.model.SOSIncident;
import com.safeher.model.Journey;
import com.safeher.repository.NotificationRepository;
import com.safeher.repository.SOSIncidentRepository;
import com.safeher.repository.JourneyRepository;
import com.safeher.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SOSIncidentRepository sosIncidentRepository;

    @Autowired
    private JourneyRepository journeyRepository;

    /**
     * Get all notification history for the authenticated user (audit log).
     * Only returns notifications belonging to the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    /**
     * Get notifications dispatched for a specific SOS incident.
     * Verifies the SOS incident belongs to the authenticated user before returning data.
     */
    @GetMapping("/sos/{sosId}")
    public ResponseEntity<List<Notification>> getNotificationsForSOS(
            @PathVariable Long sosId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Security check: ensure the SOS incident belongs to this user
        SOSIncident incident = sosIncidentRepository.findByIdAndUserId(sosId, userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SOS incident not found or access denied"));
        return ResponseEntity.ok(notificationRepository.findByRelatedSosIdOrderByCreatedAtDesc(incident.getId()));
    }

    /**
     * Get notifications dispatched for a specific Smart Journey.
     * Verifies the Journey belongs to the authenticated user before returning data.
     */
    @GetMapping("/journey/{journeyId}")
    public ResponseEntity<List<Notification>> getNotificationsForJourney(
            @PathVariable Long journeyId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Security check: ensure the Journey belongs to this user
        journeyRepository.findByIdAndUserId(journeyId, userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found or access denied"));
        return ResponseEntity.ok(notificationRepository.findByRelatedJourneyIdOrderByCreatedAtDesc(journeyId));
    }
}
