package com.safeher.service;

import com.safeher.dto.IncidentReportRequest;
import com.safeher.dto.IncidentReportResponse;
import com.safeher.model.IncidentReport;
import com.safeher.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentReportService {
    private final ReportRepository reportRepository;

    public IncidentReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public IncidentReportResponse createReport(Long userId, IncidentReportRequest request) {
        IncidentReport report = new IncidentReport();
        report.setUserId(userId);
        report.setIncidentType(request.getIncidentType());
        report.setDescription(request.getDescription());
        report.setLocation(request.getLocation());
        report.setIncidentDate(request.getIncidentDate());
        report.setIncidentTime(request.getIncidentTime());
        
        return mapToResponse(reportRepository.save(report));
    }

    public List<IncidentReportResponse> getUserReports(Long userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentReportResponse getReportById(Long id, Long userId) {
        IncidentReport report = reportRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        return mapToResponse(report);
    }
    
    public List<IncidentReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public IncidentReportResponse updateReportStatus(Long id, String status, String adminNotes) {
        IncidentReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        
        report.setStatus(status);
        if (adminNotes != null) {
            report.setAdminNotes(adminNotes);
        }
        
        return mapToResponse(reportRepository.save(report));
    }

    private IncidentReportResponse mapToResponse(IncidentReport report) {
        IncidentReportResponse response = new IncidentReportResponse();
        response.setId(report.getId());
        response.setIncidentType(report.getIncidentType());
        response.setDescription(report.getDescription());
        response.setLocation(report.getLocation());
        response.setIncidentDate(report.getIncidentDate());
        response.setIncidentTime(report.getIncidentTime());
        response.setStatus(report.getStatus());
        response.setAdminNotes(report.getAdminNotes());
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());
        return response;
    }
}
