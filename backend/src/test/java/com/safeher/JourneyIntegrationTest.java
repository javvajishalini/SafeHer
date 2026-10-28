package com.safeher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.safeher.dto.CreateJourneyRequest;
import com.safeher.dto.RegisterRequest;
import com.safeher.model.JourneyStatus;
import com.safeher.model.Location;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SafeHer Smart Journey features.
 * Uses H2 in-memory database (configured in src/test/resources/application.yml).
 * Tests journey creation, starting, location updates, completion, cancellation,
 * and the overdue detection logic.
 */
@SpringBootTest
@AutoConfigureMockMvc
class JourneyIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private com.safeher.repository.UserRepository userRepository;
    @Autowired private com.safeher.repository.JourneyRepository journeyRepository;
    @Autowired private com.safeher.repository.SOSIncidentRepository sosRepository;
    @Autowired private com.safeher.repository.EmergencyContactRepository contactRepository;
    @Autowired private com.safeher.service.JourneyService journeyService;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        sosRepository.deleteAll();
        journeyRepository.deleteAll();
        contactRepository.deleteAll();
        userRepository.deleteAll();

        RegisterRequest req = new RegisterRequest();
        req.setFullName("Journey Tester");
        req.setEmail("journey@safeher.com");
        req.setPhoneNumber("+91-9000000010");
        req.setPassword("SafeHer@2024");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        authToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("token").asText();
    }

    // ─── CREATE JOURNEY ────────────────────────────────────────────────────────

    @Test
    void testCreateJourney_returnsPLANNEDStatus() throws Exception {
        CreateJourneyRequest request = buildJourneyRequest();

        mockMvc.perform(post("/api/journeys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Test Journey"))
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andExpect(jsonPath("$.startLocation.address").value("Starting Point"))
                .andExpect(jsonPath("$.destination.address").value("Destination Point"));
    }

    // ─── START JOURNEY ─────────────────────────────────────────────────────────

    @Test
    void testStartJourney_transitionsToACTIVE_andSetsDeadline() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        // Start with GPS coordinates and duration
        ObjectNode startBody = objectMapper.createObjectNode();
        startBody.put("latitude", 17.385044);
        startBody.put("longitude", 78.486671);
        startBody.put("expectedDurationMinutes", 30);

        mockMvc.perform(post("/api/journeys/" + journeyId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(startBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.expectedArrivalAt").isNotEmpty())
                .andExpect(jsonPath("$.startedAt").isNotEmpty())
                .andExpect(jsonPath("$.lastLatitude").value(17.385044))
                .andExpect(jsonPath("$.lastLongitude").value(78.486671));
    }

    @Test
    void testStartJourney_withoutGPS_stillTransitionsToACTIVE() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        mockMvc.perform(post("/api/journeys/" + journeyId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.expectedArrivalAt").isNotEmpty());
    }

    // ─── LOCATION UPDATE ───────────────────────────────────────────────────────

    @Test
    void testLocationUpdate_updatesLastKnownPosition() throws Exception {
        Long journeyId = createAndReturnJourneyId();
        startJourney(journeyId);

        ObjectNode locUpdate = objectMapper.createObjectNode();
        locUpdate.put("latitude", 17.400000);
        locUpdate.put("longitude", 78.500000);

        mockMvc.perform(post("/api/journeys/" + journeyId + "/location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(locUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastLatitude").value(17.400000))
                .andExpect(jsonPath("$.lastLongitude").value(78.500000))
                .andExpect(jsonPath("$.lastLocationUpdate").isNotEmpty());
    }

    // ─── COMPLETE JOURNEY ──────────────────────────────────────────────────────

    @Test
    void testCompleteJourney_transitionsToCOMPLETED() throws Exception {
        Long journeyId = createAndReturnJourneyId();
        startJourney(journeyId);

        ObjectNode completeBody = objectMapper.createObjectNode();
        completeBody.put("sendSafeArrival", false); // skip email in tests

        mockMvc.perform(post("/api/journeys/" + journeyId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(completeBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
    }

    // ─── CANCEL JOURNEY ────────────────────────────────────────────────────────

    @Test
    void testCancelJourney_transitionsToCANCELLED() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        mockMvc.perform(post("/api/journeys/" + journeyId + "/cancel")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelledAt").isNotEmpty());
    }

    @Test
    void testCancelCompletedJourney_returnsBadRequest() throws Exception {
        Long journeyId = createAndReturnJourneyId();
        startJourney(journeyId);

        // Complete
        mockMvc.perform(post("/api/journeys/" + journeyId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content("{\"sendSafeArrival\":false}"))
                .andExpect(status().isOk());

        // Try to cancel completed journey — should fail
        mockMvc.perform(post("/api/journeys/" + journeyId + "/cancel")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isBadRequest());
    }

    // ─── ACTIVE JOURNEY ────────────────────────────────────────────────────────

    @Test
    void testGetActiveJourney_returnsActiveJourney() throws Exception {
        Long journeyId = createAndReturnJourneyId();
        startJourney(journeyId);

        mockMvc.perform(get("/api/journeys/active")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(journeyId))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetActiveJourney_whenNone_returns204() throws Exception {
        mockMvc.perform(get("/api/journeys/active")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());
    }

    // ─── OVERDUE DETECTION ─────────────────────────────────────────────────────

    @Test
    void testOverdueDetection_marksJourneyOVERDUE_andCreatesSOSIncident() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        // Start with a very short duration so it's immediately overdue
        ObjectNode startBody = objectMapper.createObjectNode();
        startBody.put("latitude", 17.385044);
        startBody.put("longitude", 78.486671);
        startBody.put("expectedDurationMinutes", 0); // 0 minutes → immediately overdue

        mockMvc.perform(post("/api/journeys/" + journeyId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(startBody)))
                .andExpect(status().isOk());

        // Manually trigger the overdue check (normally runs on @Scheduled every 60s)
        journeyService.checkOverdueJourneys();

        // Journey should now be OVERDUE
        mockMvc.perform(get("/api/journeys/" + journeyId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OVERDUE"));

        // An OVERDUE SOS incident should have been auto-created
        mockMvc.perform(get("/api/sos/history")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sosType").value("OVERDUE"));
    }

    @Test
    void testOverdueDetection_doesNotSendDuplicateAlerts() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        ObjectNode startBody = objectMapper.createObjectNode();
        startBody.put("expectedDurationMinutes", 0);

        mockMvc.perform(post("/api/journeys/" + journeyId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(startBody)))
                .andExpect(status().isOk());

        // Run overdue check twice
        journeyService.checkOverdueJourneys();
        journeyService.checkOverdueJourneys(); // second run should NOT create duplicate

        // Should still have exactly 1 OVERDUE SOS incident
        MvcResult historyResult = mockMvc.perform(get("/api/sos/history")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andReturn();

        int count = objectMapper.readTree(historyResult.getResponse().getContentAsString()).size();
        org.junit.jupiter.api.Assertions.assertEquals(1, count,
                "Overdue check should NOT create duplicate SOS incidents");
    }

    // ─── JOURNEY HISTORY ───────────────────────────────────────────────────────

    @Test
    void testGetJourneyList_returnsAllUserJourneys() throws Exception {
        createAndReturnJourneyId();
        createAndReturnJourneyId();

        mockMvc.perform(get("/api/journeys")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ─── ACCESS CONTROL ────────────────────────────────────────────────────────

    @Test
    void testJourney_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/journeys"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAccessOtherUserJourney_returns404() throws Exception {
        Long journeyId = createAndReturnJourneyId();

        // Register second user
        RegisterRequest req2 = new RegisterRequest();
        req2.setFullName("Other User");
        req2.setEmail("other@safeher.com");
        req2.setPhoneNumber("+91-9000000020");
        req2.setPassword("Password@2024");
        MvcResult result2 = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk())
                .andReturn();
        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString()).path("token").asText();

        // Attempt to access another user's journey
        mockMvc.perform(get("/api/journeys/" + journeyId)
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound());
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private CreateJourneyRequest buildJourneyRequest() {
        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setTitle("Test Journey");
        Location start = new Location();
        start.setAddress("Starting Point");
        start.setLatitude(17.385044);
        start.setLongitude(78.486671);
        request.setStartLocation(start);
        Location dest = new Location();
        dest.setAddress("Destination Point");
        dest.setLatitude(17.400000);
        dest.setLongitude(78.500000);
        request.setDestination(dest);
        request.setJourneyDate(LocalDate.now());
        request.setSafetyBufferMinutes(0);
        return request;
    }

    private Long createAndReturnJourneyId() throws Exception {
        CreateJourneyRequest request = buildJourneyRequest();
        MvcResult result = mockMvc.perform(post("/api/journeys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("id").asLong();
    }

    private void startJourney(Long journeyId) throws Exception {
        ObjectNode startBody = objectMapper.createObjectNode();
        startBody.put("latitude", 17.385044);
        startBody.put("longitude", 78.486671);
        startBody.put("expectedDurationMinutes", 60);

        mockMvc.perform(post("/api/journeys/" + journeyId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(startBody)))
                .andExpect(status().isOk());
    }
}
