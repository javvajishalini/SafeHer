package com.safeher.controller;

import com.safeher.dto.AIAssistantRequest;
import com.safeher.dto.AIAssistantResponse;
import com.safeher.model.AIAnalysis;
import com.safeher.model.AIConversation;
import com.safeher.security.UserDetailsImpl;
import com.safeher.service.AIAnalysisService;
import com.safeher.service.AIChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIAnalysisService aiAnalysisService;
    private final AIChatService aiChatService;

    public AIController(AIAnalysisService aiAnalysisService, AIChatService aiChatService) {
        this.aiAnalysisService = aiAnalysisService;
        this.aiChatService = aiChatService;
    }

    @PostMapping("/analyze-diary")
    public ResponseEntity<AIAnalysis> analyzeDiary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(aiAnalysisService.analyzeDiary(userDetails.getId()));
    }

    @PostMapping("/chat")
    public ResponseEntity<AIAssistantResponse> chat(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody AIAssistantRequest request) {
        return ResponseEntity.ok(aiChatService.sendMessage(userDetails.getId(), request));
    }
    
    @GetMapping("/chat/conversations")
    public ResponseEntity<List<AIConversation>> getConversations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(aiChatService.getConversations(userDetails.getId()));
    }
}
