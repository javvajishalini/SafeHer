package com.safeher.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeher.dto.AIAssistantRequest;
import com.safeher.dto.AIAssistantResponse;
import com.safeher.model.AIConversation;
import com.safeher.model.AIMessage;
import com.safeher.repository.AIConversationRepository;
import com.safeher.repository.AIMessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIChatService {

    private final AIConversationRepository conversationRepository;
    private final AIMessageRepository messageRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiUrl;

    @Value("${ai.api.model:gemini-2.0-flash}")
    private String aiModel;

    @Value("${ai.enabled:false}")
    private boolean aiEnabled;

    public AIChatService(AIConversationRepository conversationRepository, AIMessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public AIAssistantResponse sendMessage(Long userId, AIAssistantRequest request) {
        // 1. Resolve or create conversation
        AIConversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            conversation = new AIConversation();
            conversation.setUserId(userId);
            String title = request.getMessage().length() > 40
                    ? request.getMessage().substring(0, 40) + "..."
                    : request.getMessage();
            conversation.setTitle(title);
            conversation = conversationRepository.save(conversation);
        }

        // 2. Load existing message history BEFORE saving the new user message
        //    This prevents the double-append bug (history was loaded after save in old version).
        List<AIMessage> history = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        // 3. Save user message
        AIMessage userMessage = new AIMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole("user");
        userMessage.setContent(request.getMessage());
        messageRepository.save(userMessage);

        // 4. Call AI with history + current message
        String aiResponseText = "AI Safety Assistant is currently unavailable. Please check back when the AI provider is configured.";

        if (aiEnabled && apiKey != null && !apiKey.isBlank()) {
            try {
                StringBuilder requestBody = new StringBuilder("{\"contents\":[");

                // Add prior history messages
                for (int i = 0; i < history.size(); i++) {
                    AIMessage msg = history.get(i);
                    String role = "user".equals(msg.getRole()) ? "user" : "model";
                    appendGeminiMessage(requestBody, role, msg.getContent());
                    requestBody.append(",");
                }

                // Add the current user message
                appendGeminiMessage(requestBody, "user", request.getMessage());

                requestBody.append("],\"systemInstruction\":{\"parts\":[{\"text\":\"You are SafeHer AI — an empathetic, professional, and trauma-informed women's safety assistant. Provide accurate, compassionate safety guidance and situational awareness tips. Do not provide medical or legal advice. Encourage users to contact emergency services (112) in life-threatening situations.\"}]}}");

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

                String url = apiUrl + "/models/" + aiModel + ":generateContent?key=" + apiKey;
                String responseStr = restTemplate.postForObject(url, entity, String.class);

                JsonNode rootNode = objectMapper.readTree(responseStr);
                JsonNode candidateText = rootNode.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text");
                if (!candidateText.isMissingNode()) {
                    aiResponseText = candidateText.asText();
                }
            } catch (Exception e) {
                aiResponseText = "I'm having trouble connecting to my AI service right now. Please try again in a moment, or contact emergency services (112) if you are in immediate danger.";
            }
        }

        // 5. Save AI response
        AIMessage aiMessage = new AIMessage();
        aiMessage.setConversation(conversation);
        aiMessage.setRole("assistant");
        aiMessage.setContent(aiResponseText);
        messageRepository.save(aiMessage);

        // 6. Build response with full message history (reload fresh from DB)
        List<AIMessage> allMessages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        AIAssistantResponse response = new AIAssistantResponse();
        response.setConversationId(conversation.getId());
        response.setReply(aiResponseText);
        response.setMessages(allMessages.stream()
                .map(m -> new AIAssistantResponse.MessageDTO(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt()))
                .collect(Collectors.toList()));

        return response;
    }

    public List<AIConversation> getConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Appends a Gemini-format message object to the JSON builder. */
    private void appendGeminiMessage(StringBuilder sb, String role, String content) {
        String escapedContent = content
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
        sb.append(String.format("{\"role\":\"%s\",\"parts\":[{\"text\":\"%s\"}]}", role, escapedContent));
    }
}
