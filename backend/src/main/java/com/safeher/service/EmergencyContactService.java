package com.safeher.service;

import com.safeher.dto.EmergencyContactRequest;
import com.safeher.dto.EmergencyContactResponse;
import com.safeher.model.EmergencyContact;
import com.safeher.model.User;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
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

        contactRepository.save(contact);
        return mapToResponse(contact);
    }

    public List<EmergencyContactResponse> getContacts(String email) {
        User user = getAuthenticatedUser(email);
        return contactRepository.findByUserIdOrderByPriorityAsc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EmergencyContactResponse> getContactsByUserId(Long userId) {
        return contactRepository.findByUserIdOrderByPriorityAsc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmergencyContactResponse getContactById(String email, Long id) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));
        return mapToResponse(contact);
    }

    public EmergencyContactResponse updateContact(String email, Long id, EmergencyContactRequest request) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));

        contact.setName(request.getName());
        contact.setPhoneNumber(request.getPhoneNumber());
        contact.setEmail(request.getEmail());
        contact.setRelationship(request.getRelationship());
        contact.setPriority(request.getPriority());

        contactRepository.save(contact);
        return mapToResponse(contact);
    }

    public void deleteContact(String email, Long id) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));
        contactRepository.delete(contact);
    }

    public EmergencyContactResponse updateContactStatus(String email, Long id, boolean isActive) {
        User user = getAuthenticatedUser(email);
        EmergencyContact contact = contactRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));
        contact.setActive(isActive);
        contactRepository.save(contact);
        return mapToResponse(contact);
    }
}
