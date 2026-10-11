package com.safeher.service;

import com.safeher.dto.UserProfileResponse;
import com.safeher.model.AccountStatus;
import com.safeher.model.Role;
import com.safeher.model.SOSIncident;
import com.safeher.model.SOSStatus;
import com.safeher.model.User;
import com.safeher.repository.DiaryRepository;
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

    public AdminService(UserRepository userRepository, SOSIncidentRepository sosRepository, ReportRepository reportRepository, DiaryRepository diaryRepository) {
        this.userRepository = userRepository;
        this.sosRepository = sosRepository;
        this.reportRepository = reportRepository;
        this.diaryRepository = diaryRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSosIncidents", sosRepository.count());
        stats.put("activeSosRecords", sosRepository.countByStatus(SOSStatus.ACTIVE));
        stats.put("totalIncidentReports", reportRepository.count());
        stats.put("totalDiaryEntries", diaryRepository.count());
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
            map.put("latitude", inc.getLatitude());
            map.put("longitude", inc.getLongitude());
            map.put("accuracy", inc.getAccuracy());
            map.put("address", inc.getAddress());
            map.put("message", inc.getMessage());
            map.put("status", inc.getStatus() != null ? inc.getStatus().name() : "ACTIVE");
            map.put("timestamp", inc.getTimestamp());
            map.put("resolvedAt", inc.getResolvedAt());
            map.put("createdAt", inc.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }
}
