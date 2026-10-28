package com.safeher.service;

import com.safeher.dto.CreateJourneyRequest;
import com.safeher.dto.JourneyLocationUpdateRequest;
import com.safeher.dto.JourneyResponse;
import com.safeher.dto.UpdateJourneyRequest;
import com.safeher.model.EmergencyContact;
import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.JourneyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JourneyService {
    private static final Logger log = LoggerFactory.getLogger(JourneyService.class);

    @Autowired private JourneyRepository journeyRepository;
    @Autowired private EmergencyContactRepository contactRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private com.safeher.repository.SOSIncidentRepository sosRepository;

    // ─── CREATE JOURNEY ────────────────────────────────────────────────────────

    @Transactional
    public JourneyResponse createJourney(Long userId, CreateJourneyRequest request) {
        Journey journey = new Journey();
        journey.setUserId(userId);
        journey.setTitle(request.getTitle());
        journey.setStartLocation(request.getStartLocation());
        journey.setDestination(request.getDestination());
        journey.setJourneyDate(request.getJourneyDate());
        journey.setPlannedStartTime(request.getPlannedStartTime());
        journey.setExpectedArrivalTime(request.getExpectedArrivalTime());
        journey.setDescription(request.getDescription());
        journey.setSafetyBufferMinutes(request.getSafetyBufferMinutes() != null ? request.getSafetyBufferMinutes() : 0);
        journey.setStatus(JourneyStatus.PLANNED);

        // Resolve selected emergency contacts
        if (request.getEmergencyContactIds() != null && !request.getEmergencyContactIds().isEmpty()) {
            List<EmergencyContact> contacts = contactRepository.findAllById(request.getEmergencyContactIds())
                    .stream().filter(c -> c.getUserId().equals(userId)).collect(Collectors.toList());
            journey.setEmergencyContacts(new HashSet<>(contacts));
        }

        return mapToResponse(journeyRepository.save(journey));
    }

    // ─── GET JOURNEYS ─────────────────────────────────────────────────────────

    public List<JourneyResponse> getUserJourneys(Long userId) {
        return journeyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public JourneyResponse getJourneyById(Long id, Long userId) {
        return mapToResponse(findOwned(id, userId));
    }

    /**
     * Returns the user's currently ACTIVE journey (for the dashboard countdown timer).
     * Also returns OVERDUE journeys so the user can see them.
     */
    public JourneyResponse getActiveJourney(Long userId) {
        Optional<Journey> active = journeyRepository.findFirstByUserIdAndStatus(userId, JourneyStatus.ACTIVE);
        if (active.isPresent()) return mapToResponse(active.get());
        Optional<Journey> overdue = journeyRepository.findFirstByUserIdAndStatus(userId, JourneyStatus.OVERDUE);
        return overdue.map(this::mapToResponse).orElse(null);
    }

    // ─── UPDATE JOURNEY ───────────────────────────────────────────────────────

    @Transactional
    public JourneyResponse updateJourney(Long id, Long userId, UpdateJourneyRequest request) {
        Journey journey = findOwned(id, userId);
        if (journey.getStatus() != JourneyStatus.PLANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only planned journeys can be modified");
        }

        journey.setTitle(request.getTitle());
        journey.setStartLocation(request.getStartLocation());
        journey.setDestination(request.getDestination());
        journey.setJourneyDate(request.getJourneyDate());
        journey.setPlannedStartTime(request.getPlannedStartTime());
        journey.setExpectedArrivalTime(request.getExpectedArrivalTime());
        journey.setDescription(request.getDescription());
        return mapToResponse(journeyRepository.save(journey));
    }

    // ─── START JOURNEY ────────────────────────────────────────────────────────

    /**
     * Transitions journey to ACTIVE and calculates the expectedArrivalAt timestamp.
     * expectedArrivalAt = now + expectedDurationMinutes + safetyBufferMinutes
     * If the request carries a current GPS position, saves it as the starting last-known location.
     */
    @Transactional
    public JourneyResponse startJourney(Long id, Long userId, Double startLat, Double startLng, Integer expectedDurationMinutes) {
        Journey journey = findOwned(id, userId);
        if (journey.getStatus() != JourneyStatus.PLANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only planned journeys can be started");
        }

        Instant now = Instant.now();
        journey.setStatus(JourneyStatus.ACTIVE);
        journey.setStartedAt(now);

        // Update start location coordinates if provided by browser
        if (startLat != null && startLng != null) {
            if (journey.getStartLocation() == null) {
                journey.setStartLocation(new com.safeher.model.Location());
            }
            journey.getStartLocation().setLatitude(startLat);
            journey.getStartLocation().setLongitude(startLng);
            journey.setLastLatitude(startLat);
            journey.setLastLongitude(startLng);
            journey.setLastLocationUpdate(now);
        }

        // Calculate the overdue deadline
        int durationMins = expectedDurationMinutes != null ? expectedDurationMinutes : 30;
        int bufferMins = journey.getSafetyBufferMinutes() != null ? journey.getSafetyBufferMinutes() : 0;
        journey.setExpectedArrivalAt(now.plusSeconds((long)(durationMins + bufferMins) * 60));
        journey.setOverdueAlertSent(false);

        return mapToResponse(journeyRepository.save(journey));
    }

    // ─── LOCATION UPDATE ──────────────────────────────────────────────────────

    /**
     * Called by the frontend every ~30 seconds while the journey is active.
     * Updates the last-known location in the database.
     */
    @Transactional
    public JourneyResponse updateLocation(Long id, Long userId, JourneyLocationUpdateRequest req) {
        Journey journey = findOwned(id, userId);
        if (journey.getStatus() != JourneyStatus.ACTIVE && journey.getStatus() != JourneyStatus.OVERDUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Journey is not active");
        }

        journey.setLastLatitude(req.getLatitude());
        journey.setLastLongitude(req.getLongitude());
        journey.setLastLocationUpdate(Instant.now());
        return mapToResponse(journeyRepository.save(journey));
    }

    // ─── COMPLETE JOURNEY ─────────────────────────────────────────────────────

    @Transactional
    public JourneyResponse completeJourney(Long id, Long userId, boolean sendSafeArrival) {
        Journey journey = findOwned(id, userId);
        if (journey.getStatus() != JourneyStatus.ACTIVE && journey.getStatus() != JourneyStatus.OVERDUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only active journeys can be completed");
        }

        journey.setStatus(JourneyStatus.COMPLETED);
        journey.setCompletedAt(Instant.now());
        Journey saved = journeyRepository.save(journey);

        if (sendSafeArrival) {
            try {
                notificationService.sendSafeArrivalNotifications(saved);
            } catch (Exception e) {
                log.warn("Safe arrival notification failed: {}", e.getMessage());
            }
        }

        return mapToResponse(saved);
    }

    // ─── CANCEL JOURNEY ───────────────────────────────────────────────────────

    @Transactional
    public JourneyResponse cancelJourney(Long id, Long userId) {
        Journey journey = findOwned(id, userId);
        if (journey.getStatus() == JourneyStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed journeys cannot be cancelled");
        }

        journey.setStatus(JourneyStatus.CANCELLED);
        journey.setCancelledAt(Instant.now());
        return mapToResponse(journeyRepository.save(journey));
    }

    // ─── AUTOMATIC OVERDUE CHECK ──────────────────────────────────────────────

    /**
     * Runs every 60 seconds.
     * Finds all ACTIVE journeys whose expectedArrivalAt is in the past and overdueAlertSent = false.
     * Marks them OVERDUE and dispatches alerts to selected emergency contacts.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void checkOverdueJourneys() {
        Instant now = Instant.now();
        List<Journey> overdue = journeyRepository.findOverdueJourneys(now);
        for (Journey journey : overdue) {
            log.info("Journey {} for user {} is OVERDUE — alerting contacts", journey.getId(), journey.getUserId());
            journey.setStatus(JourneyStatus.OVERDUE);
            journey.setOverdueAlertSent(true);
            journeyRepository.save(journey);

            // Persist OVERDUE SOS incident for auditing and active alert tracking
            try {
                com.safeher.model.SOSIncident overdueSos = new com.safeher.model.SOSIncident();
                overdueSos.setUserId(journey.getUserId());
                overdueSos.setSosType(com.safeher.model.SOSType.OVERDUE);
                overdueSos.setJourneyId(journey.getId());
                overdueSos.setLatitude(journey.getLastLatitude() != null ? journey.getLastLatitude() : (journey.getDestination() != null ? journey.getDestination().getLatitude() : null));
                overdueSos.setLongitude(journey.getLastLongitude() != null ? journey.getLastLongitude() : (journey.getDestination() != null ? journey.getDestination().getLongitude() : null));
                overdueSos.setMessage("AUTOMATIC OVERDUE ALERT: Smart Journey '" + journey.getTitle() + "' has exceeded its arrival deadline. Destination: " + (journey.getDestination() != null ? journey.getDestination().getAddress() : "Unknown"));
                overdueSos.setStatus(com.safeher.model.SOSStatus.ACTIVE);
                overdueSos.setTimestamp(now);
                overdueSos.setCreatedAt(now);
                if (journey.getEmergencyContacts() != null && !journey.getEmergencyContacts().isEmpty()) {
                    overdueSos.setEmergencyContacts(new HashSet<>(journey.getEmergencyContacts()));
                }
                sosRepository.save(overdueSos);
            } catch (Exception e) {
                log.error("Failed to persist overdue SOS incident for journey {}: {}", journey.getId(), e.getMessage());
            }

            try {
                notificationService.sendJourneyOverdueNotifications(journey);
            } catch (Exception e) {
                log.error("Failed to send overdue notification for journey {}: {}", journey.getId(), e.getMessage());
            }
        }
    }

    // ─── BACKWARD COMPAT start/complete (used by old controller) ─────────────

    /** Overload used by the old single-param controller endpoints */
    public JourneyResponse startJourney(Long id, Long userId) {
        return startJourney(id, userId, null, null, 30);
    }

    public JourneyResponse completeJourney(Long id, Long userId) {
        return completeJourney(id, userId, true);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private Journey findOwned(Long id, Long userId) {
        return journeyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));
    }

    public JourneyResponse mapToResponse(Journey journey) {
        JourneyResponse r = new JourneyResponse();
        r.setId(journey.getId());
        r.setTitle(journey.getTitle());
        r.setStartLocation(journey.getStartLocation());
        r.setDestination(journey.getDestination());
        r.setJourneyDate(journey.getJourneyDate());
        r.setPlannedStartTime(journey.getPlannedStartTime());
        r.setExpectedArrivalTime(journey.getExpectedArrivalTime());
        r.setDescription(journey.getDescription());
        r.setStatus(journey.getStatus());
        r.setSafetyBufferMinutes(journey.getSafetyBufferMinutes());
        r.setExpectedArrivalAt(journey.getExpectedArrivalAt());
        r.setLastLatitude(journey.getLastLatitude());
        r.setLastLongitude(journey.getLastLongitude());
        r.setLastLocationUpdate(journey.getLastLocationUpdate());
        r.setCreatedAt(journey.getCreatedAt());
        r.setStartedAt(journey.getStartedAt());
        r.setCompletedAt(journey.getCompletedAt());
        r.setCancelledAt(journey.getCancelledAt());

        // Last known location Google Maps URL
        if (journey.getLastLatitude() != null && journey.getLastLongitude() != null) {
            r.setLastLocationUrl("https://www.google.com/maps?q=" + journey.getLastLatitude() + "," + journey.getLastLongitude());
        }

        // Emergency contacts summary
        if (journey.getEmergencyContacts() != null) {
            r.setEmergencyContacts(journey.getEmergencyContacts().stream()
                    .map(JourneyResponse.ContactSummary::from)
                    .collect(Collectors.toList()));
        }

        return r;
    }
}
