package com.safeher.controller;

import com.safeher.dto.SOSRequest;
import com.safeher.dto.SOSResponse;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.SOSService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SOSController {

    @Autowired
    private SOSService sosService;

    @PostMapping
    public ResponseEntity<SOSResponse> activateSOS(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody SOSRequest request) {
        return new ResponseEntity<>(sosService.activateSOS(userDetails.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SOSResponse>> getHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sosService.getUserSOSHistory(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SOSResponse> getSOSIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sosService.getSOSIncident(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<SOSResponse> resolveSOS(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sosService.resolveSOS(id, userDetails.getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SOSResponse> cancelSOS(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sosService.cancelSOS(id, userDetails.getId()));
    }
}
