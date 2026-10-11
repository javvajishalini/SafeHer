package com.safeher.service;

import com.safeher.model.EmergencyContact;
import com.safeher.model.Journey;
import com.safeher.model.Notification;
import com.safeher.model.SOSIncident;
import com.safeher.model.User;
import com.safeher.repository.EmergencyContactRepository;
import com.safeher.repository.NotificationRepository;
import com.safeher.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/**
 * Central notification service.
 * Supports Email (via Spring Mail / SMTP) and SMS (via Twilio when configured).
 * Every notification attempt is persisted to the notifications table with an accurate status.
 */
@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.of("Asia/Kolkata"));

    @Autowired private EmergencyContactRepository contactRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username:}") private String fromEmail;

    // Twilio config — set to empty strings when not configured
    @Value("${safeher.sms.enabled:false}") private boolean smsEnabled;
    @Value("${safeher.sms.twilio.account-sid:}") private String twilioAccountSid;
    @Value("${safeher.sms.twilio.auth-token:}") private String twilioAuthToken;
    @Value("${safeher.sms.twilio.from-number:}") private String twilioFromNumber;

    public NotificationService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    // ─── SOS NOTIFICATIONS ───────────────────────────────────────────────────

    /**
     * Alert all specified contacts (or all active contacts if list is empty) about an SOS incident.
     * Optionally enriches message with active journey context.
     */
    public void sendSOSNotifications(Long userId, SOSIncident incident,
                                      List<Long> selectedContactIds, Journey activeJourney) {
        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getFullName() : "A SafeHer user";

        List<EmergencyContact> contacts;
        if (selectedContactIds != null && !selectedContactIds.isEmpty()) {
            contacts = contactRepository.findAllById(selectedContactIds)
                    .stream().filter(c -> c.getUserId().equals(userId) && c.isActive()).toList();
        } else {
            contacts = contactRepository.findByUserIdAndIsActiveTrue(userId);
        }

        String mapsUrl = buildMapsUrl(incident.getLatitude(), incident.getLongitude());
        String activatedAt = incident.getTimestamp() != null ? TIME_FMT.format(incident.getTimestamp()) : "Unknown";

        for (EmergencyContact contact : contacts) {
            String subject = "🚨 SAFEHER EMERGENCY ALERT – " + userName + " needs help!";
            String body = buildSOSEmailBody(userName, incident, mapsUrl, activatedAt, activeJourney);

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(userId, contact, subject, body, incident.getId(), null);
            }

            if (contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank()) {
                String smsBody = buildSOSSMSBody(userName, mapsUrl, activatedAt);
                sendSMS(userId, contact, smsBody, incident.getId(), null);
            }
        }
    }

    // ─── JOURNEY OVERDUE NOTIFICATIONS ───────────────────────────────────────

    /**
     * Called by the overdue scheduler when a journey exceeds its expected arrival time.
     */
    public void sendJourneyOverdueNotifications(Journey journey) {
        User user = userRepository.findById(journey.getUserId()).orElse(null);
        String userName = user != null ? user.getFullName() : "A SafeHer user";

        Set<EmergencyContact> contacts = journey.getEmergencyContacts();
        if (contacts == null || contacts.isEmpty()) {
            contacts = new java.util.HashSet<>(contactRepository.findByUserIdAndIsActiveTrue(journey.getUserId()));
        }

        String mapsUrl = (journey.getLastLatitude() != null && journey.getLastLongitude() != null)
                ? buildMapsUrl(journey.getLastLatitude(), journey.getLastLongitude())
                : "Location unavailable";

        String expectedArrival = journey.getExpectedArrivalAt() != null
                ? TIME_FMT.format(journey.getExpectedArrivalAt()) : "Unknown";

        for (EmergencyContact contact : contacts) {
            String subject = "⚠️ SAFEHER JOURNEY ALERT – " + userName + " has not arrived!";
            String body = buildOverdueEmailBody(userName, journey, mapsUrl, expectedArrival);

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(journey.getUserId(), contact, subject, body, null, journey.getId());
            }

            if (contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank()) {
                String smsBody = buildOverdueSMSBody(userName, journey, mapsUrl, expectedArrival);
                sendSMS(journey.getUserId(), contact, smsBody, null, journey.getId());
            }
        }
    }

    // ─── SAFE ARRIVAL NOTIFICATION ────────────────────────────────────────────

    public void sendSafeArrivalNotifications(Journey journey) {
        User user = userRepository.findById(journey.getUserId()).orElse(null);
        String userName = user != null ? user.getFullName() : "A SafeHer user";

        Set<EmergencyContact> contacts = journey.getEmergencyContacts();
        if (contacts == null || contacts.isEmpty()) return;

        String arrivedAt = journey.getCompletedAt() != null
                ? TIME_FMT.format(journey.getCompletedAt()) : TIME_FMT.format(Instant.now());

        for (EmergencyContact contact : contacts) {
            String subject = "✅ SAFEHER – " + userName + " has arrived safely!";
            String body = "✅ SAFEHER JOURNEY UPDATE\n\n"
                    + userName + " has safely reached their intended destination.\n\n"
                    + "Destination: " + safeAddress(journey.getDestination()) + "\n"
                    + "Arrival Time: " + arrivedAt + "\n\n"
                    + "No further action is needed. Thank you for being a trusted contact.";

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(journey.getUserId(), contact, subject, body, null, journey.getId());
            }
        }
    }

    // ─── LOW-LEVEL EMAIL ──────────────────────────────────────────────────────

    public void sendEmail(Long userId, EmergencyContact contact, String subject, String body,
                           Long sosId, Long journeyId) {
        Notification notification = newNotification(userId, "EMAIL", contact.getEmail(), subject, body, sosId, journeyId, contact.getId());
        try {
            if (fromEmail != null && !fromEmail.isBlank()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(contact.getEmail());
                message.setSubject(subject);
                message.setText(body);
                emailSender.send(message);
                notification.setStatus("SENT");
                notification.setSentAt(Instant.now());
                notification.setErrorMessage(null);
                log.info("Email sent to {} for user {}", contact.getEmail(), userId);
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Email provider not configured (MAIL_USERNAME is empty).");
                log.warn("Email not sent – MAIL_USERNAME not configured.");
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", contact.getEmail(), e.getMessage());
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }

    // ─── LOW-LEVEL SMS ────────────────────────────────────────────────────────

    /**
     * Sends SMS via Twilio REST API using only java.net.http (no extra SDK dependency).
     * If Twilio is not configured, saves a FAILED record with an explanatory message.
     */
    public void sendSMS(Long userId, EmergencyContact contact, String body,
                         Long sosId, Long journeyId) {
        Notification notification = newNotification(userId, "SMS", contact.getPhoneNumber(), "SOS/Journey Alert", body, sosId, journeyId, contact.getId());

        if (!smsEnabled || twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            notification.setStatus("FAILED");
            notification.setErrorMessage("SMS provider (Twilio) is not configured. Set SMS_ENABLED=true and Twilio credentials.");
            notificationRepository.save(notification);
            log.warn("SMS not sent to {} – Twilio not configured.", contact.getPhoneNumber());
            return;
        }

        try {
            // Build Twilio Messages API request
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String encoded = java.util.Base64.getEncoder().encodeToString((twilioAccountSid + ":" + twilioAuthToken).getBytes());
            String payload = "From=" + java.net.URLEncoder.encode(twilioFromNumber, "UTF-8")
                    + "&To=" + java.net.URLEncoder.encode(contact.getPhoneNumber(), "UTF-8")
                    + "&Body=" + java.net.URLEncoder.encode(body, "UTF-8");

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .header("Authorization", "Basic " + encoded)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201) {
                notification.setStatus("SENT");
                notification.setSentAt(Instant.now());
                log.info("SMS sent to {} via Twilio", contact.getPhoneNumber());
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Twilio returned status " + response.statusCode() + ": " + response.body());
                log.warn("Twilio SMS failed: {} {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("SMS send error to {}: {}", contact.getPhoneNumber(), e.getMessage());
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }

    // ─── MESSAGE BUILDERS ─────────────────────────────────────────────────────

    private String buildSOSEmailBody(String userName, SOSIncident incident, String mapsUrl,
                                      String activatedAt, Journey activeJourney) {
        StringBuilder sb = new StringBuilder();
        sb.append("🚨 SAFEHER EMERGENCY ALERT\n\n");
        sb.append(userName).append(" has activated an SOS emergency alert.\n\n");

        if (incident.getLatitude() != null) {
            sb.append("📍 Current Location:\n").append(mapsUrl).append("\n\n");
        } else {
            sb.append("📍 Location: Not available (permission denied)\n\n");
        }

        sb.append("🕐 Time: ").append(activatedAt).append("\n\n");

        if (activeJourney != null) {
            sb.append("ℹ️ She has an active Smart Journey:\n");
            sb.append("   From: ").append(safeAddress(activeJourney.getStartLocation())).append("\n");
            sb.append("   To: ").append(safeAddress(activeJourney.getDestination())).append("\n");
            if (activeJourney.getExpectedArrivalAt() != null) {
                sb.append("   Expected Arrival: ").append(TIME_FMT.format(activeJourney.getExpectedArrivalAt())).append("\n");
            }
            sb.append("   Journey Status: ").append(activeJourney.getStatus()).append("\n\n");
        }

        sb.append("⚠️ The user may need immediate assistance.\n");
        sb.append("Please contact them immediately or call emergency services (112).\n\n");
        sb.append("— SafeHer Safety Platform");
        return sb.toString();
    }

    private String buildSOSSMSBody(String userName, String mapsUrl, String activatedAt) {
        return "🚨 SAFEHER SOS ALERT\n" + userName + " needs help!\n📍 " + mapsUrl + "\n🕐 " + activatedAt + "\nCall 112 immediately.";
    }

    private String buildOverdueEmailBody(String userName, Journey journey, String mapsUrl, String expectedArrival) {
        return "⚠️ SAFEHER SMART JOURNEY ALERT\n\n"
                + userName + " started a Smart Journey but has NOT reached the destination within the expected time.\n\n"
                + "📍 Starting Location: " + safeAddress(journey.getStartLocation()) + "\n"
                + "🏁 Intended Destination: " + safeAddress(journey.getDestination()) + "\n"
                + "⏰ Expected Arrival: " + expectedArrival + "\n"
                + "🕐 Current Time: " + TIME_FMT.format(Instant.now()) + "\n"
                + "⚠️ Journey Status: OVERDUE\n\n"
                + "📍 Last Known Location:\n" + mapsUrl + "\n\n"
                + "Please contact " + userName + " immediately or call emergency services (112).\n\n"
                + "— SafeHer Safety Platform";
    }

    private String buildOverdueSMSBody(String userName, Journey journey, String mapsUrl, String expectedArrival) {
        return "⚠️ SAFEHER ALERT\n" + userName + " hasn't arrived by " + expectedArrival
                + "\nDest: " + safeAddress(journey.getDestination())
                + "\nLast loc: " + mapsUrl;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private String buildMapsUrl(Double lat, Double lng) {
        if (lat == null || lng == null) return "Location unavailable";
        return "https://www.google.com/maps?q=" + lat + "," + lng;
    }

    private String safeAddress(com.safeher.model.Location loc) {
        if (loc == null) return "Unknown";
        if (loc.getAddress() != null && !loc.getAddress().isBlank()) return loc.getAddress();
        if (loc.getLatitude() != null && loc.getLongitude() != null)
            return loc.getLatitude() + ", " + loc.getLongitude();
        return "Unknown";
    }

    private Notification newNotification(Long userId, String type, String recipient, String title,
                                          String message, Long sosId, Long journeyId, Long contactId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(message);
        n.setRelatedSosId(sosId);
        n.setStatus("PENDING");
        return n;
    }
}
