package com.safeher.service;

import com.safeher.model.SOSStatus;
import com.safeher.repository.DiaryRepository;
import com.safeher.repository.ReportRepository;
import com.safeher.repository.SOSIncidentRepository;
import com.safeher.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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
}
