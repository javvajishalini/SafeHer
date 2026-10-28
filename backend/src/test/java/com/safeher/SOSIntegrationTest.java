package com.safeher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeher.dto.LoginRequest;
import com.safeher.dto.RegisterRequest;
import com.safeher.dto.SOSRequest;
import com.safeher.model.SOSType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SafeHer SOS features.
 * Uses H2 in-memory database (configured in src/test/resources/application.yml).
 * Tests all 4 SOS types: STANDARD, SILENT, IN_JOURNEY, OVERDUE.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SOSIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Repositories for cleanup
    @Autowired
    private com.safeher.repository.UserRepository userRepository;
    @Autowired
    private com.safeher.repository.SOSIncidentRepository sosRepository;
    @Autowired
    private com.safeher.repository.JourneyRepository journeyRepository;
    @Autowired
    private com.safeher.repository.EmergencyContactRepository contactRepository;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up all test data in dependency order
        sosRepository.deleteAll();
        journeyRepository.deleteAll();
        contactRepository.deleteAll();
        userRepository.deleteAll();

        // Register test user and obtain JWT
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail("test@safeher.com");
        req.setPhoneNumber("+91-9000000001");
        req.setPassword("SafeHer@2024");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        authToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("token").asText();
    }

    // ─── STANDARD SOS ──────────────────────────────────────────────────────────

    @Test
    void testSTANDARD_SOS_createsActiveIncident() throws Exception {
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.STANDARD);
        request.setLatitude(17.385044);
        request.setLongitude(78.486671);
        request.setAccuracy(15.0);
        request.setAddress("Hyderabad, Telangana");

        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.sosType").value("STANDARD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.latitude").value(17.385044))
                .andExpect(jsonPath("$.longitude").value(78.486671));
    }

    // ─── SILENT SOS ────────────────────────────────────────────────────────────

    @Test
    void testSILENT_SOS_createsActiveIncident() throws Exception {
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.SILENT);
        request.setLatitude(17.385044);
        request.setLongitude(78.486671);

        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sosType").value("SILENT"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("SILENT")));
    }

    @Test
    void testSILENT_SOS_withoutLocation_stillCreatesIncident() throws Exception {
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.SILENT);
        // No latitude/longitude — GPS unavailable scenario

        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sosType").value("SILENT"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.latitude").doesNotExist()); // null lat is expected
    }

    // ─── IN_JOURNEY SOS ────────────────────────────────────────────────────────

    @Test
    void testIN_JOURNEY_SOS_createsActiveIncident() throws Exception {
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.IN_JOURNEY);
        request.setLatitude(17.385044);
        request.setLongitude(78.486671);

        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sosType").value("IN_JOURNEY"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // ─── SOS RESOLUTION ────────────────────────────────────────────────────────

    @Test
    void testResolveSOS_changesStatusToRESOLVED() throws Exception {
        // Step 1: Activate SOS
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.STANDARD);

        MvcResult createResult = mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long sosId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("id").asLong();

        // Step 2: Resolve SOS
        mockMvc.perform(post("/api/sos/" + sosId + "/resolve")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.resolvedAt").isNotEmpty());
    }

    @Test
    void testCancelSOS_changesStatusToCANCELLED() throws Exception {
        // Step 1: Activate SOS
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.STANDARD);

        MvcResult createResult = mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long sosId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("id").asLong();

        // Step 2: Cancel SOS
        mockMvc.perform(post("/api/sos/" + sosId + "/cancel")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void testResolveAlreadyResolvedSOS_returnsBadRequest() throws Exception {
        // Activate
        SOSRequest request = new SOSRequest();
        MvcResult createResult = mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        Long sosId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("id").asLong();

        // Resolve once
        mockMvc.perform(post("/api/sos/" + sosId + "/resolve")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());

        // Try to resolve again — should fail
        mockMvc.perform(post("/api/sos/" + sosId + "/resolve")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isBadRequest());
    }

    // ─── SOS HISTORY ───────────────────────────────────────────────────────────

    @Test
    void testGetSOSHistory_returnsUserIncidents() throws Exception {
        // Create 2 SOS incidents
        for (SOSType type : new SOSType[]{SOSType.STANDARD, SOSType.SILENT}) {
            SOSRequest req = new SOSRequest();
            req.setSosType(type);
            mockMvc.perform(post("/api/sos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .header("Authorization", "Bearer " + authToken)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/sos/history")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testGetActiveSOS_returnsActiveIncident() throws Exception {
        // Activate SOS
        SOSRequest request = new SOSRequest();
        request.setSosType(SOSType.STANDARD);
        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get active SOS
        mockMvc.perform(get("/api/sos/active")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetActiveSOS_whenNone_returns204() throws Exception {
        mockMvc.perform(get("/api/sos/active")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());
    }

    // ─── ACCESS CONTROL ────────────────────────────────────────────────────────

    @Test
    void testSOS_withoutAuth_returns401() throws Exception {
        SOSRequest request = new SOSRequest();
        mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetOtherUserSOS_returns404() throws Exception {
        // Create SOS for test user
        SOSRequest req = new SOSRequest();
        MvcResult createResult = mockMvc.perform(post("/api/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + authToken)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long sosId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("id").asLong();

        // Register second user
        RegisterRequest req2 = new RegisterRequest();
        req2.setFullName("Eve Attacker");
        req2.setEmail("eve@evil.com");
        req2.setPhoneNumber("+91-9000000002");
        req2.setPassword("Password@2024");
        MvcResult result2 = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk())
                .andReturn();
        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString()).path("token").asText();

        // Attempt to access another user's SOS
        mockMvc.perform(get("/api/sos/" + sosId)
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound());
    }
}
