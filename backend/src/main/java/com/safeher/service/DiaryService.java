package com.safeher.service;

import com.safeher.dto.diary.DiaryRequest;
import com.safeher.dto.diary.DiaryResponse;
import com.safeher.model.SafetyDiaryEntry;
import com.safeher.repository.DiaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiaryService {
    @Autowired
    private DiaryRepository diaryRepository;

    public DiaryResponse createEntry(Long userId, DiaryRequest request) {
        SafetyDiaryEntry entry = new SafetyDiaryEntry();
        entry.setUserId(userId);
        entry.setTitle(request.getTitle());
        entry.setDescription(request.getDescription());
        entry.setLocation(request.getLocation());
        entry.setIncidentDate(request.getIncidentDate());
        entry.setIncidentTime(request.getIncidentTime());
        entry.setIncidentType(request.getIncidentType());
        entry.setRiskLevel(request.getRiskLevel());

        return mapToResponse(diaryRepository.save(entry));
    }

    public DiaryResponse updateEntry(Long id, Long userId, DiaryRequest request) {
        SafetyDiaryEntry entry = diaryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary entry not found"));

        entry.setTitle(request.getTitle());
        entry.setDescription(request.getDescription());
        entry.setLocation(request.getLocation());
        entry.setIncidentDate(request.getIncidentDate());
        entry.setIncidentTime(request.getIncidentTime());
        entry.setIncidentType(request.getIncidentType());
        entry.setRiskLevel(request.getRiskLevel());

        return mapToResponse(diaryRepository.save(entry));
    }

    public List<DiaryResponse> getUserEntries(Long userId) {
        return diaryRepository.findByUserIdOrderByIncidentDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DiaryResponse> searchEntries(Long userId, String keyword) {
        return diaryRepository.searchByUserIdAndKeyword(userId, keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DiaryResponse> filterByType(Long userId, String incidentType) {
        return diaryRepository.findByUserIdAndIncidentTypeOrderByIncidentDateDesc(userId, incidentType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DiaryResponse getEntry(Long id, Long userId) {
        SafetyDiaryEntry entry = diaryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary entry not found"));
        return mapToResponse(entry);
    }

    public void deleteEntry(Long id, Long userId) {
        SafetyDiaryEntry entry = diaryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary entry not found"));
        diaryRepository.delete(entry);
    }

    private DiaryResponse mapToResponse(SafetyDiaryEntry entry) {
        DiaryResponse response = new DiaryResponse();
        response.setId(entry.getId());
        response.setTitle(entry.getTitle());
        response.setDescription(entry.getDescription());
        response.setLocation(entry.getLocation());
        response.setIncidentDate(entry.getIncidentDate());
        response.setIncidentTime(entry.getIncidentTime());
        response.setIncidentType(entry.getIncidentType());
        response.setRiskLevel(entry.getRiskLevel());
        response.setCreatedAt(entry.getCreatedAt());
        response.setUpdatedAt(entry.getUpdatedAt());
        return response;
    }
}
