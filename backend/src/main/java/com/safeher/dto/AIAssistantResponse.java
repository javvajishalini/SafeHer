package com.safeher.dto;

import java.time.Instant;
import java.util.List;

public class AIAssistantResponse {
    private Long conversationId;
    private String reply;
    private List<MessageDTO> messages;

    public static class MessageDTO {
        private Long id;
        private String role;
        private String content;
        private Instant createdAt;

        public MessageDTO() {}
        public MessageDTO(Long id, String role, String content, Instant createdAt) {
            this.id = id; this.role = role; this.content = content; this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public List<MessageDTO> getMessages() { return messages; }
    public void setMessages(List<MessageDTO> messages) { this.messages = messages; }
}
