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

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Set;

/**
 * Production-style central Notification Service.
 * Provides concrete implementations for:
 * - Email Notification (JavaMail / SMTP configuration)
 * - SMS Notification (Twilio REST API integration without third-party binary dependencies)
 * - Delivery tracking & audit log persisted in notifications table with real provider responses.
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

    // Twilio config — configurable via env variables
    @Value("${safeher.sms.enabled:false}") private boolean smsEnabled;
    @Value("${safeher.sms.provider:twilio}") private String smsProvider;
    @Value("${safeher.sms.twilio.account-sid:}") private String twilioAccountSid;
    @Value("${safeher.sms.twilio.auth-token:}") private String twilioAuthToken;
    @Value("${safeher.sms.twilio.from-number:}") private String twilioFromNumber;

    public NotificationService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    // ─── SOS NOTIFICATIONS ───────────────────────────────────────────────────

    /**
     * Alert all specified contacts (or all active contacts if list is empty) about an SOS incident.
     * Enriches message with active journey context if a journey is in progress.
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
        String activatedAt = incident.getTimestamp() != null ? TIME_FMT.format(incident.getTimestamp()) : TIME_FMT.format(Instant.now());

        for (EmergencyContact contact : contacts) {
            String subject = "🚨 SAFEHER EMERGENCY ALERT – " + userName + " needs immediate help!";
            String body = buildSOSEmailBody(userName, incident, mapsUrl, activatedAt, activeJourney);

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(userId, contact, subject, body, incident.getId(), activeJourney != null ? activeJourney.getId() : null);
            }

            if (contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank()) {
                String smsBody = buildSOSSMSBody(userName, incident, mapsUrl, activatedAt, activeJourney);
                sendSMS(userId, contact, smsBody, incident.getId(), activeJourney != null ? activeJourney.getId() : null);
            }
        }
    }

    // ─── JOURNEY OVERDUE NOTIFICATIONS ───────────────────────────────────────

    /**
     * Called by the overdue scheduler when a journey exceeds its expected arrival time + safety buffer.
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
                : "Location unavailable (permission pending)";

        String expectedArrival = journey.getExpectedArrivalAt() != null
                ? TIME_FMT.format(journey.getExpectedArrivalAt()) : "Unknown";

        for (EmergencyContact contact : contacts) {
            String subject = "⚠️ SAFEHER SMART JOURNEY ALERT – " + userName + " has not reached destination!";
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
        if (contacts == null || contacts.isEmpty()) {
            contacts = new java.util.HashSet<>(contactRepository.findByUserIdAndIsActiveTrue(journey.getUserId()));
        }

        String arrivedAt = journey.getCompletedAt() != null
                ? TIME_FMT.format(journey.getCompletedAt()) : TIME_FMT.format(Instant.now());

        for (EmergencyContact contact : contacts) {
            String subject = "✅ SAFEHER – " + userName + " has arrived safely!";
            String body = "✅ SAFEHER JOURNEY UPDATE\n\n"
                    + userName + " has safely reached their intended destination.\n\n"
                    + "Destination: " + safeAddress(journey.getDestination()) + "\n"
                    + "Arrival Time: " + arrivedAt + "\n\n"
                    + "No further action is needed. Thank you for being a trusted contact.\n\n"
                    + "— SafeHer Safety Platform";

            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                sendEmail(journey.getUserId(), contact, subject, body, null, journey.getId());
            }

            if (contact.getPhoneNumber() != null && !contact.getPhoneNumber().isBlank()) {
                String smsBody = "✅ SAFEHER: " + userName + " safely reached " + safeAddress(journey.getDestination()) + " at " + arrivedAt + ".";
                sendSMS(journey.getUserId(), contact, smsBody, null, journey.getId());
            }
        }
    }

    // ─── CONCRETE EMAIL NOTIFICATION SERVICE ──────────────────────────────────

    public void sendEmail(Long userId, EmergencyContact contact, String subject, String body,
                           Long sosId, Long journeyId) {
        Notification notification = newNotification(userId, "EMAIL", contact.getEmail(), subject, body, sosId, journeyId, contact.getId());
        notification.setProvider("SMTP / JavaMail");

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
                log.info("Email delivered to {} for user {}", contact.getEmail(), userId);
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Email provider unconfigured: MAIL_USERNAME environment variable is empty.");
                log.warn("Email alert saved as FAILED: MAIL_USERNAME not set.");
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", contact.getEmail(), e.getMessage());
            notification.setStatus("FAILED");
            notification.setErrorMessage("SMTP Error: " + e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }

    // ─── CONCRETE SMS NOTIFICATION SERVICE ────────────────────────────────────

    public void sendSMS(Long userId, EmergencyContact contact, String body,
                         Long sosId, Long journeyId) {
        Notification notification = newNotification(userId, "SMS", contact.getPhoneNumber(), "Emergency Alert", body, sosId, journeyId, contact.getId());
        notification.setProvider("Twilio REST API");

        if (!smsEnabled || twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            notification.setStatus("FAILED");
            notification.setErrorMessage("SMS provider (Twilio) is unconfigured. Set SMS_ENABLED=true with TWILIO_ACCOUNT_SID, AUTH_TOKEN & FROM_NUMBER.");
            notificationRepository.save(notification);
            log.warn("SMS alert to {} recorded as FAILED: Twilio credentials not configured in environment.", contact.getPhoneNumber());
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String authHeader = "Basic " + Base64.getEncoder().encodeToString((twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));
            String payload = "From=" + URLEncoder.encode(twilioFromNumber, StandardCharsets.UTF_8)
                    + "&To=" + URLEncoder.encode(contact.getPhoneNumber(), StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201) {
                notification.setStatus("SENT");
                notification.setSentAt(Instant.now());
                notification.setErrorMessage(null);
                log.info("Twilio SMS successfully dispatched to {}", contact.getPhoneNumber());
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Twilio HTTP " + response.statusCode() + ": " + response.body());
                log.warn("Twilio SMS delivery failed (HTTP {}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("SMS transport error to {}: {}", contact.getPhoneNumber(), e.getMessage());
            notification.setStatus("FAILED");
            notification.setErrorMessage("SMS Transport Error: " + e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }

    // ─── MESSAGE TEMPLATE BUILDERS ───────────────────────────────────────────

    private String buildSOSEmailBody(String userName, SOSIncident incident, String mapsUrl,
                                      String activatedAt, Journey activeJourney) {
        StringBuilder sb = new StringBuilder();
        String typeLabel = incident.getSosType() != null ? incident.getSosType().name() : "STANDARD";
        sb.append("🚨 SAFEHER EMERGENCY ALERT [TYPE: ").append(typeLabel).append("]\n\n");
        sb.append(userName).append(" has activated a ").append(typeLabel).append(" SOS distress alert!\n\n");

        if (incident.getSosType() == com.safeher.model.SOSType.SILENT) {
            sb.append("⚠️ NOTE: This alert was triggered in SILENT/STEALTH mode. The user may be in an unsafe situation where loud calls could endanger them. Send discreet messages or contact authorities.\n\n");
        }

        if (incident.getMessage() != null && !incident.getMessage().isBlank()) {
            sb.append("💬 Alert Message: ").append(incident.getMessage()).append("\n\n");
        }

        if (incident.getLatitude() != null && incident.getLongitude() != null) {
            sb.append("📍 Current Location:\n").append(mapsUrl).append("\n");
            if (incident.getAccuracy() != null) {
                sb.append("   Accuracy: ±").append(Math.round(incident.getAccuracy())).append(" meters\n");
            }
            sb.append("\n");
        } else {
            sb.append("📍 Current Location: GPS location unavailable (permission denied or device timeout)\n\n");
        }

        sb.append("🕐 Activated At: ").append(activatedAt).append("\n\n");

        if (activeJourney != null) {
            sb.append("ℹ️ She has an active Smart Journey in progress:\n");
            sb.append("   Starting Location: ").append(safeAddress(activeJourney.getStartLocation())).append("\n");
            sb.append("   Intended Destination: ").append(safeAddress(activeJourney.getDestination())).append("\n");
            if (activeJourney.getExpectedArrivalAt() != null) {
                sb.append("   Expected Arrival: ").append(TIME_FMT.format(activeJourney.getExpectedArrivalAt())).append("\n");
            }
            sb.append("   Journey Status: ").append(activeJourney.getStatus()).append("\n\n");
        }

        sb.append("⚠️ The user may need immediate assistance.\n");
        sb.append("Please contact them immediately or dial emergency helpline (112).\n\n");
        sb.append("— SafeHer Real-Time Safety Platform");
        return sb.toString();
    }

    private String buildSOSSMSBody(String userName, SOSIncident incident, String mapsUrl, String activatedAt, Journey activeJourney) {
        String typeTag = incident.getSosType() != null ? "[" + incident.getSosType().name() + "]" : "[SOS]";
        if (activeJourney != null) {
            return "🚨 SAFEHER " + typeTag + ": " + userName + " triggered SOS during journey to "
                    + safeAddress(activeJourney.getDestination()) + "!\nLoc: " + mapsUrl + "\nTime: " + activatedAt + "\nCall or dial 112.";
        }
        if (incident.getSosType() == com.safeher.model.SOSType.SILENT) {
            return "🚨 SAFEHER [SILENT SOS]: " + userName + " triggered stealth distress beacon!\nLoc: " + mapsUrl + "\nDiscreet check recommended or dial 112.";
        }
        return "🚨 SAFEHER " + typeTag + ": " + userName + " activated emergency beacon!\nLoc: " + mapsUrl + "\nTime: " + activatedAt + "\nCall immediately or dial 112.";
    }

    private String buildOverdueEmailBody(String userName, Journey journey, String mapsUrl, String expectedArrival) {
        return "⚠️ SAFEHER SMART JOURNEY ALERT\n\n"
                + userName + " started a Smart Journey but has NOT reached the destination within the expected time!\n\n"
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
        return "⚠️ SAFEHER ALERT: " + userName + " hasn't arrived at " + safeAddress(journey.getDestination())
                + " by expected time " + expectedArrival + ".\nLast loc: " + mapsUrl;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private String buildMapsUrl(Double lat, Double lng) {
        if (lat == null || lng == null) return "Location unavailable";
        return "https://www.google.com/maps?q=" + lat + "," + lng;
    }

    private String safeAddress(com.safeher.model.Location loc) {
        if (loc == null) return "Designated Destination";
        if (loc.getAddress() != null && !loc.getAddress().isBlank()) return loc.getAddress();
        if (loc.getLatitude() != null && loc.getLongitude() != null)
            return loc.getLatitude() + ", " + loc.getLongitude();
        return "Designated Destination";
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
        n.setRelatedJourneyId(journeyId);
        n.setRelatedContactId(contactId);
        n.setStatus("PENDING");
        return n;
    }
}
