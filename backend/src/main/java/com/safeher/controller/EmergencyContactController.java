package com.safeher.controller;

import com.safeher.dto.ContactStatusRequest;
import com.safeher.dto.EmergencyContactRequest;
import com.safeher.dto.EmergencyContactResponse;
import com.safeher.service.EmergencyContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class EmergencyContactController {

    private final EmergencyContactService contactService;

    public EmergencyContactController(EmergencyContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<EmergencyContactResponse> createContact(
            Authentication authentication,
            @Valid @RequestBody EmergencyContactRequest request) {
        return ResponseEntity.ok(contactService.createContact(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<EmergencyContactResponse>> getContacts(Authentication authentication) {
        return ResponseEntity.ok(contactService.getContacts(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyContactResponse> getContact(
            Authentication authentication,
            @PathVariable String id) {
        try {
            return ResponseEntity.ok(contactService.getContactById(authentication.getName(), id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyContactResponse> updateContact(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody EmergencyContactRequest request) {
        try {
            return ResponseEntity.ok(contactService.updateContact(authentication.getName(), id, request));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            Authentication authentication,
            @PathVariable String id) {
        try {
            contactService.deleteContact(authentication.getName(), id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmergencyContactResponse> updateStatus(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody ContactStatusRequest request) {
        try {
            return ResponseEntity.ok(contactService.updateContactStatus(authentication.getName(), id, request.getIsActive()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
