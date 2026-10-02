package com.safeher.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safeher.model.AIAnalysis;
import com.safeher.model.SafetyDiaryEntry;
import com.safeher.repository.AIAnalysisRepository;
import com.safeher.repository.DiaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIAnalysisService {
    private static final Logger log = LoggerFactory.getLogger(AIAnalysisService.class);

    private final DiaryRepository diaryRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
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

    public AIAnalysisService(DiaryRepository diaryRepository, AIAnalysisRepository aiAnalysisRepository) {
        this.diaryRepository = diaryRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
    }

    public AIAnalysis analyzeDiary(Long userId) {
        List<SafetyDiaryEntry> entries = diaryRepository.findByUserIdOrderByIncidentDateDesc(userId);
        if (entries.isEmpty()) {
            throw new RuntimeException("No diary entries found to analyze");
        }

        String diaryContent = entries.stream()
                .map(e -> String.format("Date: %s, Type: %s, Risk: %s\nTitle: %s\nDescription: %s",
                        e.getIncidentDate(), e.getIncidentType(), e.getRiskLevel(),
                        e.getTitle(), e.getDescription()))
                .collect(Collectors.joining("\n\n---\n\n"));

        AIAnalysis analysis = new AIAnalysis();
        analysis.setUserId(userId);
        analysis.setEntryCount(entries.size());
        analysis.setDisclaimer("This is an AI-generated analysis based on your safety diary entries. It is for informational purposes only and not a substitute for professional advice or emergency services.");

        if (!aiEnabled || apiKey == null || apiKey.isBlank()) {
            // Fallback for when AI is not configured
            analysis.setAiProvider("RULE_BASED_FALLBACK");
            analysis.setSummary("Based on your " + entries.size() + " entries, we notice some ongoing safety concerns.");
            analysis.setPatterns("[\"Multiple incidents logged recently\"]");
            analysis.setRecommendations("[\"Consider sharing your location with trusted contacts\", \"Trust your instincts in uncomfortable situations\"]");
        } else {
            try {
                analysis.setAiProvider("GEMINI");
                String prompt = "You are a specialized AI safety assistant for women. Analyze the following safety diary entries and provide: 1. A short empathetic summary of their overall safety situation. 2. A JSON array of strings identifying any patterns (e.g. specific locations, times, or types of harassment). 3. A JSON array of strings providing actionable safety recommendations. Keep it extremely professional and supportive.\n\nEntries:\n" + diaryContent + "\n\nFormat your response EXACTLY as a JSON object with keys: 'summary' (string), 'patterns' (array of strings), 'recommendations' (array of strings). Do not use markdown blocks like ```json.";
                
                String requestBody = String.format("{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}", prompt.replace("\"", "\\\"").replace("\n", "\\n"));
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
                
                String url = apiUrl + "/models/" + aiModel + ":generateContent?key=" + apiKey;
                String responseStr = restTemplate.postForObject(url, entity, String.class);
                
                JsonNode rootNode = objectMapper.readTree(responseStr);
                String responseText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                
                // Parse the expected JSON output from the model
                JsonNode aiResult = objectMapper.readTree(responseText);
                analysis.setSummary(aiResult.path("summary").asText());
                analysis.setPatterns(aiResult.path("patterns").toString());
                analysis.setRecommendations(aiResult.path("recommendations").toString());
                
            } catch (Exception e) {
                log.error("AI Analysis failed", e);
                analysis.setAiProvider("ERROR_FALLBACK");
                analysis.setSummary("We couldn't generate an AI analysis right now.");
                analysis.setPatterns("[]");
                analysis.setRecommendations("[\"Please try again later.\"]");
            }
        }

        return aiAnalysisRepository.save(analysis);
    }
}
