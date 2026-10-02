package com.safeher.service;

import com.safeher.model.EmergencyContact;
import com.safeher.model.Notification;
import com.safeher.model.SOSIncident;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final EmergencyContactRepository contactRepository;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender emailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public NotificationService(EmergencyContactRepository contactRepository, NotificationRepository notificationRepository, JavaMailSender emailSender) {
        this.contactRepository = contactRepository;
        this.notificationRepository = notificationRepository;
        this.emailSender = emailSender;
    }

    public void sendSOSNotifications(Long userId, SOSIncident incident) {
        List<EmergencyContact> contacts = contactRepository.findByUserIdAndIsActiveTrue(userId);

        for (EmergencyContact contact : contacts) {
            String message = String.format("URGENT: SOS Activated by your contact! Location: %s. Maps: https://maps.google.com/?q=%f,%f", 
                incident.getAddress() != null ? incident.getAddress() : "Unknown", 
                incident.getLatitude(), incident.getLongitude());

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(userId, contact.getEmail(), "EMERGENCY: SOS Alert", message, incident.getId());
            }

            // In a real app, SMS would be sent here via Twilio or similar
        }
    }

    public void sendEmail(Long userId, String to, String subject, String text, Long relatedSosId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("EMAIL");
        notification.setRecipient(to);
        notification.setTitle(subject);
        notification.setMessage(text);
        notification.setRelatedSosId(relatedSosId);
        
        try {
            if (fromEmail != null && !fromEmail.isBlank()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                emailSender.send(message);
                
                notification.setStatus("SENT");
                notification.setSentAt(Instant.now());
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Mail sender not configured");
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }
}
