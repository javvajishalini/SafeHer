package com.safeher.controller;

import com.safeher.dto.IncidentReportRequest;
import com.safeher.dto.IncidentReportResponse;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.IncidentReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final IncidentReportService reportService;

    public ReportController(IncidentReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<IncidentReportResponse> createReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody IncidentReportRequest request) {
        return new ResponseEntity<>(reportService.createReport(userDetails.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentReportResponse>> getUserReports(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reportService.getUserReports(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReportResponse> getReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reportService.getReportById(id, userDetails.getId()));
    }
    
    // Admin routes
    @GetMapping("/admin/all")
    public ResponseEntity<List<IncidentReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
    
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<IncidentReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, body.get("status"), body.get("adminNotes")));
    }
}
