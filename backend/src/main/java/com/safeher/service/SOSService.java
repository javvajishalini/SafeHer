package com.safeher.service;

import com.safeher.dto.SOSRequest;
import com.safeher.dto.SOSResponse;
import com.safeher.model.EmergencyContact;
import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import com.safeher.model.SOSIncident;
import com.safeher.model.SOSStatus;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.JourneyRepository;
import com.safeher.repository.SOSIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
public class SOSService {

    @Autowired private SOSIncidentRepository sosRepository;
    @Autowired private EmergencyContactRepository contactRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private JourneyRepository journeyRepository;

    @Transactional
    public SOSResponse activateSOS(Long userId, SOSRequest request) {
        SOSIncident incident = new SOSIncident();
        incident.setUserId(userId);
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setAccuracy(request.getAccuracy());
        incident.setAddress(request.getAddress());

        // Check if user has an active/overdue Smart Journey
        Optional<Journey> activeJourney = journeyRepository.findFirstByUserIdAndStatus(userId, JourneyStatus.ACTIVE);
        if (!activeJourney.isPresent()) {
            activeJourney = journeyRepository.findFirstByUserIdAndStatus(userId, JourneyStatus.OVERDUE);
        }

        // Determine SOS type & Journey Link
        com.safeher.model.SOSType resolvedType = request.getSosType();
        if (resolvedType == null) {
            resolvedType = (request.getJourneyId() != null || activeJourney.isPresent()) 
                ? com.safeher.model.SOSType.IN_JOURNEY 
                : com.safeher.model.SOSType.STANDARD;
        }
        incident.setSosType(resolvedType);

        if (request.getJourneyId() != null) {
            incident.setJourneyId(request.getJourneyId());
        } else if (activeJourney.isPresent()) {
            incident.setJourneyId(activeJourney.get().getId());
        }

        if (request.getMessage() != null && !request.getMessage().isBlank()) {
            incident.setMessage(request.getMessage());
        } else if (resolvedType == com.safeher.model.SOSType.SILENT) {
            incident.setMessage("SILENT DISTRESS: Stealth emergency beacon activated by user. Immediate discreet assistance requested.");
        } else if (resolvedType == com.safeher.model.SOSType.IN_JOURNEY) {
            incident.setMessage("TRANSIT EMERGENCY: User activated SOS distress during an active Smart Journey.");
        } else {
            incident.setMessage("EMERGENCY: User activated SOS distress beacon from SafeHer platform.");
        }

        incident.setStatus(SOSStatus.ACTIVE);
        incident.setTimestamp(Instant.now());
        incident.setCreatedAt(Instant.now());

        // Resolve emergency contacts
        List<Long> contactIds = request.getEmergencyContactIds();
        if (contactIds == null || contactIds.isEmpty()) {
            contactIds = request.getContactIds();
        }

        List<EmergencyContact> contacts;
        if (contactIds != null && !contactIds.isEmpty()) {
            contacts = contactRepository.findAllById(contactIds).stream()
                    .filter(c -> c.getUserId().equals(userId) && c.isActive())
                    .collect(Collectors.toList());
        } else {
            contacts = contactRepository.findByUserIdAndIsActiveTrue(userId);
        }

        incident.setEmergencyContacts(new HashSet<>(contacts));
        SOSIncident saved = sosRepository.save(incident);

        try {
            notificationService.sendSOSNotifications(
                    userId,
                    saved,
                    contactIds,
                    activeJourney.orElse(null)
            );
        } catch (Exception e) {
            // Log but do NOT fail SOS activation — user safety takes priority
        }

        return mapToResponse(saved);
    }

    public SOSResponse getActiveSOS(Long userId) {
        return sosRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(s -> s.getStatus() == SOSStatus.ACTIVE)
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<SOSResponse> getUserSOSHistory(Long userId) {
        return sosRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SOSResponse getSOSIncident(Long id, Long userId) {
        SOSIncident incident = sosRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SOS record not found"));
        return mapToResponse(incident);
    }

    @Transactional
    public SOSResponse resolveSOS(Long id, Long userId) {
        SOSIncident incident = sosRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SOS record not found"));

        if (incident.getStatus() != SOSStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only active SOS incidents can be resolved");
        }

        incident.setStatus(SOSStatus.RESOLVED);
        incident.setResolvedAt(Instant.now());
        return mapToResponse(sosRepository.save(incident));
    }

    @Transactional
    public SOSResponse cancelSOS(Long id, Long userId) {
        SOSIncident incident = sosRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SOS record not found"));

        if (incident.getStatus() != SOSStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only active SOS incidents can be cancelled");
        }

        incident.setStatus(SOSStatus.CANCELLED);
        incident.setResolvedAt(Instant.now());
        return mapToResponse(sosRepository.save(incident));
    }

    private SOSResponse mapToResponse(SOSIncident incident) {
        SOSResponse response = new SOSResponse();
        response.setId(incident.getId());
        response.setLatitude(incident.getLatitude());
        response.setLongitude(incident.getLongitude());
        response.setAccuracy(incident.getAccuracy());
        response.setAddress(incident.getAddress());
        response.setTimestamp(incident.getTimestamp());
        response.setStatus(incident.getStatus());
        response.setMessage(incident.getMessage());
        response.setResolvedAt(incident.getResolvedAt());
        response.setCreatedAt(incident.getCreatedAt());
        response.setSosType(incident.getSosType());
        response.setJourneyId(incident.getJourneyId());

        if (incident.getLatitude() != null && incident.getLongitude() != null) {
            response.setMapsUrl("https://www.google.com/maps?q=" + incident.getLatitude() + "," + incident.getLongitude());
        }

        if (incident.getEmergencyContacts() != null) {
            response.setEmergencyContacts(
                    incident.getEmergencyContacts().stream()
                            .map(SOSResponse.ContactSummary::from)
                            .collect(Collectors.toList())
            );
        }

        // Active journey lookup
        Optional<Journey> activeJourney = journeyRepository.findFirstByUserIdAndStatus(incident.getUserId(), JourneyStatus.ACTIVE);
        if (!activeJourney.isPresent()) {
            activeJourney = journeyRepository.findFirstByUserIdAndStatus(incident.getUserId(), JourneyStatus.OVERDUE);
        }
        if (activeJourney.isPresent()) {
            Journey j = activeJourney.get();
            SOSResponse.JourneySummary js = new SOSResponse.JourneySummary();
            js.setId(j.getId());
            js.setTitle(j.getTitle());
            js.setStartAddress(j.getStartLocation() != null ? j.getStartLocation().getAddress() : null);
            js.setDestAddress(j.getDestination() != null ? j.getDestination().getAddress() : null);
            js.setStatus(j.getStatus().name());
            response.setActiveJourney(js);
        }

        return response;
    }
}
