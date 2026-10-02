package com.safeher.controller;

import com.safeher.dto.diary.DiaryRequest;
import com.safeher.dto.diary.DiaryResponse;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.DiaryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diary")
public class DiaryController {
    @Autowired
    private DiaryService diaryService;

    @PostMapping
    public ResponseEntity<DiaryResponse> createEntry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody DiaryRequest request) {
        return new ResponseEntity<>(diaryService.createEntry(userDetails.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DiaryResponse>> getEntries(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(diaryService.getUserEntries(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryResponse> getEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(diaryService.getEntry(id, userDetails.getId()));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DiaryResponse> updateEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody DiaryRequest request) {
        return ResponseEntity.ok(diaryService.updateEntry(id, userDetails.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        diaryService.deleteEntry(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<DiaryResponse>> searchEntries(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam String q) {
        return ResponseEntity.ok(diaryService.searchEntries(userDetails.getId(), q));
    }
}
