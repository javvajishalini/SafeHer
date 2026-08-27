package com.safeher.service;

import com.safeher.dto.EmergencyContactRequest;
import com.safeher.dto.EmergencyContactResponse;
import com.safeher.model.EmergencyContact;
import com.safeher.model.User;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyContactService {

    private final EmergencyContactRepository contactRepository;
    private final UserRepository userRepository;

    public EmergencyContactService(EmergencyContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private EmergencyContactResponse mapToResponse(EmergencyContact contact) {
        return new EmergencyContactResponse(
                contact.getId(), contact.getName(), contact.getPhoneNumber(),
                contact.getEmail(), contact.getRelationship(), contact.getPriority(), contact.isActive()
        );
    }

    public EmergencyContactResponse createContact(String email, EmergencyContactRequest request) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = new EmergencyContact();
        contact.setUserId(user.getId());
        contact.setName(request.getName());
        contact.setPhoneNumber(request.getPhoneNumber());
        contact.setEmail(request.getEmail());
        contact.setRelationship(request.getRelationship());
        contact.setPriority(request.getPriority());
        contact.setActive(true);
        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());

        contactRepository.save(contact);
        return mapToResponse(contact);
    }

    public List<EmergencyContactResponse> getContacts(String email) {
        User user = getAuthenticatedUser(email);
        return contactRepository.findByUserIdOrderByPriorityAsc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmergencyContactResponse getContactById(String email, String id) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        return mapToResponse(contact);
    }

    public EmergencyContactResponse updateContact(String email, String id, EmergencyContactRequest request) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setName(request.getName());
        contact.setPhoneNumber(request.getPhoneNumber());
        contact.setEmail(request.getEmail());
        contact.setRelationship(request.getRelationship());
        contact.setPriority(request.getPriority());
        contact.setUpdatedAt(LocalDateTime.now());

        contactRepository.save(contact);
        return mapToResponse(contact);
    }

    public void deleteContact(String email, String id) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contactRepository.delete(contact);
    }

    public EmergencyContactResponse updateContactStatus(String email, String id, boolean isActive) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contact.setActive(isActive);
        contact.setUpdatedAt(LocalDateTime.now());
        contactRepository.save(contact);
        return mapToResponse(contact);
    }
}
