package com.safeher.controller;

import com.safeher.dto.EmergencyContactRequest;
import com.safeher.dto.EmergencyContactResponse;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.EmergencyContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class EmergencyContactController {
    private final EmergencyContactService contactService;

    public EmergencyContactController(EmergencyContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<EmergencyContactResponse> createContact(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody EmergencyContactRequest request) {
        return new ResponseEntity<>(contactService.createContact(userDetails.getUsername(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmergencyContactResponse>> getContacts(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(contactService.getContacts(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyContactResponse> getContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(contactService.getContactById(userDetails.getUsername(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyContactResponse> updateContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody EmergencyContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        contactService.deleteContact(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmergencyContactResponse> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Boolean> statusUpdate) {
        return ResponseEntity.ok(contactService.updateContactStatus(
                userDetails.getUsername(), id, statusUpdate.get("isActive")));
    }
}
