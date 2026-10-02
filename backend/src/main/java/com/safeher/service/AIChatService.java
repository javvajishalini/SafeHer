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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIChatService {
    
    private final AIConversationRepository conversationRepository;
    private final AIMessageRepository messageRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.url}")
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
        AIConversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            conversation = new AIConversation();
            conversation.setUserId(userId);
            String title = request.getMessage().length() > 30 
                ? request.getMessage().substring(0, 30) + "..." 
                : request.getMessage();
            conversation.setTitle(title);
            conversation = conversationRepository.save(conversation);
        }

        // Save user message
        AIMessage userMessage = new AIMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole("user");
        userMessage.setContent(request.getMessage());
        messageRepository.save(userMessage);

        String aiResponseText = "AI is currently disabled or unavailable.";
        
        if (aiEnabled && apiKey != null && !apiKey.isBlank()) {
            try {
                // Build history for Gemini
                List<AIMessage> history = conversation.getMessages();
                
                StringBuilder contentBuilder = new StringBuilder();
                contentBuilder.append("{\"contents\":[");
                
                for (int i = 0; i < history.size(); i++) {
                    AIMessage msg = history.get(i);
                    String role = msg.getRole().equals("user") ? "user" : "model";
                    contentBuilder.append(String.format("{\"role\":\"%s\",\"parts\":[{\"text\":\"%s\"}]}", 
                        role, msg.getContent().replace("\"", "\\\"").replace("\n", "\\n")));
                    
                    if (i < history.size() - 1) {
                        contentBuilder.append(",");
                    }
                }
                
                // Add the current message if history didn't include the unsaved one
                if (!history.isEmpty()) contentBuilder.append(",");
                contentBuilder.append(String.format("{\"role\":\"user\",\"parts\":[{\"text\":\"%s\"}]}", 
                    request.getMessage().replace("\"", "\\\"").replace("\n", "\\n")));
                
                contentBuilder.append("],\"systemInstruction\":{\"parts\":[{\"text\":\"You are SafeHer AI, an empathetic, professional, and knowledgeable women's safety assistant. Provide helpful, trauma-informed advice regarding safety, situational awareness, and emergency preparedness. Do not give medical or legal advice.\"}]}}");
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<String> entity = new HttpEntity<>(contentBuilder.toString(), headers);
                
                String url = apiUrl + "/models/" + aiModel + ":generateContent?key=" + apiKey;
                String responseStr = restTemplate.postForObject(url, entity, String.class);
                
                JsonNode rootNode = objectMapper.readTree(responseStr);
                aiResponseText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            } catch (Exception e) {
                aiResponseText = "I'm having trouble connecting to my service right now. Please try again later.";
            }
        }

        // Save AI message
        AIMessage aiMessage = new AIMessage();
        aiMessage.setConversation(conversation);
        aiMessage.setRole("assistant");
        aiMessage.setContent(aiResponseText);
        messageRepository.save(aiMessage);

        AIAssistantResponse response = new AIAssistantResponse();
        response.setConversationId(conversation.getId());
        response.setReply(aiResponseText);
        
        // Reload messages to return full history
        List<AIAssistantResponse.MessageDTO> messageDTOs = conversationRepository.findById(conversation.getId())
            .get().getMessages().stream()
            .map(m -> new AIAssistantResponse.MessageDTO(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt()))
            .collect(Collectors.toList());
        response.setMessages(messageDTOs);
        
        return response;
    }
    
    public List<AIConversation> getConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }
}
