package com.safeher.service;

import com.safeher.dto.SOSRequest;
import com.safeher.dto.SOSResponse;
import com.safeher.model.SOSIncident;
import com.safeher.model.SOSStatus;
import com.safeher.repository.SOSIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SOSService {

    @Autowired
    private SOSIncidentRepository sosRepository;

    @Autowired
    private NotificationService notificationService;

    public SOSResponse activateSOS(Long userId, SOSRequest request) {
        SOSIncident incident = new SOSIncident();
        incident.setUserId(userId);
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setAccuracy(request.getAccuracy());
        incident.setAddress(request.getAddress());
        incident.setMessage(request.getMessage());
        incident.setStatus(SOSStatus.ACTIVE);
        incident.setTimestamp(Instant.now());
        incident.setCreatedAt(Instant.now());

        SOSIncident saved = sosRepository.save(incident);

        // Trigger emergency notifications
        try {
            notificationService.sendSOSNotifications(userId, saved);
        } catch (Exception e) {
            // Log but don't fail the SOS activation
        }

        return mapToResponse(saved);
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
        return response;
    }
}
