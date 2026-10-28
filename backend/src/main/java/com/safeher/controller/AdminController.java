package com.safeher.controller;

import com.safeher.dto.UserProfileResponse;
import com.safeher.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** Platform-wide statistics for the admin dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    /** All registered users, ordered by creation date descending */
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /** Activate / suspend a user account */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserProfileResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, body.get("status")));
    }

    /**
     * All SOS incidents across all users (enriched with sosType, journeyId, and user info).
     * Returns full admin view of emergency history.
     */
    @GetMapping("/sos")
    public ResponseEntity<List<Map<String, Object>>> getAllSOS() {
        return ResponseEntity.ok(adminService.getAllSOSIncidents());
    }

    /** All submitted incident reports (platform-wide) */
    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllIncidentReports());
    }

    /** All active or overdue journeys for situational awareness */
    @GetMapping("/journeys/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveJourneys() {
        return ResponseEntity.ok(adminService.getActiveJourneys());
    }
}
