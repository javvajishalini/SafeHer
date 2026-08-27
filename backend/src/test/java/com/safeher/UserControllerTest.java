package com.safeher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeher.dto.AuthResponse;
import com.safeher.dto.LoginRequest;
import com.safeher.dto.RegisterRequest;
import com.safeher.dto.UpdateProfileRequest;
import com.safeher.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private String getAuthToken() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Jane Doe");
        req.setEmail("jane@example.com");
        req.setPhoneNumber("1234567890");
        req.setPassword("password123");

        mockMvc.perform(get("/api/health")); // health check bypass

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andReturn();
        
        AuthResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        return response.getToken();
    }
    
    // Quick helper alias
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder post(String url) {
        return org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url);
    }

    @Test
    void testProtectedEndpointWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testProtectedEndpointWithValidAuthentication() throws Exception {
        String token = getAuthToken();

        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void testInvalidJwt() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + "invalid.jwt.token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testProfileUpdate() throws Exception {
        String token = getAuthToken();

        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setFullName("Jane Updated");
        updateReq.setPhoneNumber("0987654321");

        mockMvc.perform(put("/api/users/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Jane Updated"))
                .andExpect(jsonPath("$.phoneNumber").value("0987654321"));
    }
}
