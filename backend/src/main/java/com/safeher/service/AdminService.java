package com.safeher.service;

import com.safeher.dto.UserProfileResponse;
import com.safeher.model.AccountStatus;
import com.safeher.model.IncidentReport;
import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import com.safeher.model.Role;
import com.safeher.model.SOSIncident;
import com.safeher.model.SOSStatus;
import com.safeher.model.User;
import com.safeher.repository.DiaryRepository;
import com.safeher.repository.JourneyRepository;
import com.safeher.repository.ReportRepository;
import com.safeher.repository.SOSIncidentRepository;
import com.safeher.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final SOSIncidentRepository sosRepository;
    private final ReportRepository reportRepository;
    private final DiaryRepository diaryRepository;
    private final JourneyRepository journeyRepository;

    public AdminService(UserRepository userRepository,
                        SOSIncidentRepository sosRepository,
                        ReportRepository reportRepository,
                        DiaryRepository diaryRepository,
                        JourneyRepository journeyRepository) {
        this.userRepository = userRepository;
        this.sosRepository = sosRepository;
        this.reportRepository = reportRepository;
        this.diaryRepository = diaryRepository;
        this.journeyRepository = journeyRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSosIncidents", sosRepository.count());
        stats.put("activeSosRecords", sosRepository.countByStatus(SOSStatus.ACTIVE));
        stats.put("totalIncidentReports", reportRepository.count());
        stats.put("totalDiaryEntries", diaryRepository.count());
        stats.put("activeJourneys", journeyRepository.findByStatus(JourneyStatus.ACTIVE).size());
        stats.put("overdueJourneys", journeyRepository.findByStatus(JourneyStatus.OVERDUE).size());
        return stats;
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(u -> new UserProfileResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getPhoneNumber(),
                        u.getRole() != null ? u.getRole().name() : "USER",
                        u.getAccountStatus() != null ? u.getAccountStatus().name() : "ACTIVE",
                        u.getCreatedAt(),
                        u.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    public UserProfileResponse updateUserStatus(Long userId, String statusStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        try {
            AccountStatus status = AccountStatus.valueOf(statusStr.toUpperCase());
            user.setAccountStatus(status);
            User saved = userRepository.save(user);
            return new UserProfileResponse(
                    saved.getId(),
                    saved.getFullName(),
                    saved.getEmail(),
                    saved.getPhoneNumber(),
                    saved.getRole() != null ? saved.getRole().name() : "USER",
                    saved.getAccountStatus() != null ? saved.getAccountStatus().name() : "ACTIVE",
                    saved.getCreatedAt(),
                    saved.getUpdatedAt()
            );
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid account status");
        }
    }

    /**
     * Returns all SOS incidents enriched with user info and SOS type/journey details
     * for the admin dashboard monitoring view.
     */
    public List<Map<String, Object>> getAllSOSIncidents() {
        List<SOSIncident> incidents = sosRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (u1, u2) -> u1));

        return incidents.stream().map(inc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inc.getId());
            map.put("userId", inc.getUserId());
            User u = userMap.get(inc.getUserId());
            map.put("userName", u != null ? u.getFullName() : "User #" + inc.getUserId());
            map.put("userPhone", u != null ? u.getPhoneNumber() : "N/A");
            map.put("userEmail", u != null ? u.getEmail() : "N/A");
            map.put("latitude", inc.getLatitude());
            map.put("longitude", inc.getLongitude());
            map.put("accuracy", inc.getAccuracy());
            map.put("address", inc.getAddress());
            map.put("message", inc.getMessage());
            map.put("status", inc.getStatus() != null ? inc.getStatus().name() : "ACTIVE");
            // Include SOS type and journey link — previously missing from admin view
            map.put("sosType", inc.getSosType() != null ? inc.getSosType().name() : "STANDARD");
            map.put("journeyId", inc.getJourneyId());
            map.put("timestamp", inc.getTimestamp());
            map.put("resolvedAt", inc.getResolvedAt());
            map.put("createdAt", inc.getCreatedAt());
            if (inc.getLatitude() != null && inc.getLongitude() != null) {
                map.put("mapsUrl", "https://www.google.com/maps?q=" + inc.getLatitude() + "," + inc.getLongitude());
            }
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Returns all incident reports for the admin review panel.
     */
    public List<Map<String, Object>> getAllIncidentReports() {
        List<IncidentReport> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (u1, u2) -> u1));

        return reports.stream().map(report -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", report.getId());
            map.put("userId", report.getUserId());
            User u = userMap.get(report.getUserId());
            map.put("userName", u != null ? u.getFullName() : "User #" + report.getUserId());
            map.put("userEmail", u != null ? u.getEmail() : "N/A");
            map.put("incidentType", report.getIncidentType());
            map.put("description", report.getDescription());
            map.put("status", report.getStatus());
            map.put("adminNotes", report.getAdminNotes());
            map.put("incidentDate", report.getIncidentDate());
            map.put("incidentTime", report.getIncidentTime());
            if (report.getLocation() != null) {
                map.put("locationAddress", report.getLocation().getAddress());
                map.put("latitude", report.getLocation().getLatitude());
                map.put("longitude", report.getLocation().getLongitude());
            }
            map.put("createdAt", report.getCreatedAt());
            map.put("updatedAt", report.getUpdatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Returns currently ACTIVE and OVERDUE journeys for admin situational awareness.
     */
    public List<Map<String, Object>> getActiveJourneys() {
        List<Journey> active = journeyRepository.findByStatus(JourneyStatus.ACTIVE);
        List<Journey> overdue = journeyRepository.findByStatus(JourneyStatus.OVERDUE);
        Map<Long, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (u1, u2) -> u1));

        return java.util.stream.Stream.concat(active.stream(), overdue.stream())
                .map(j -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", j.getId());
                    map.put("userId", j.getUserId());
                    User u = userMap.get(j.getUserId());
                    map.put("userName", u != null ? u.getFullName() : "User #" + j.getUserId());
                    map.put("userPhone", u != null ? u.getPhoneNumber() : "N/A");
                    map.put("title", j.getTitle());
                    map.put("status", j.getStatus().name());
                    map.put("startAddress", j.getStartLocation() != null ? j.getStartLocation().getAddress() : null);
                    map.put("destAddress", j.getDestination() != null ? j.getDestination().getAddress() : null);
                    map.put("expectedArrivalAt", j.getExpectedArrivalAt());
                    map.put("lastLatitude", j.getLastLatitude());
                    map.put("lastLongitude", j.getLastLongitude());
                    map.put("lastLocationUpdate", j.getLastLocationUpdate());
                    if (j.getLastLatitude() != null && j.getLastLongitude() != null) {
                        map.put("lastLocationUrl", "https://www.google.com/maps?q=" + j.getLastLatitude() + "," + j.getLastLongitude());
                    }
                    map.put("startedAt", j.getStartedAt());
                    map.put("overdueAlertSent", j.isOverdueAlertSent());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
