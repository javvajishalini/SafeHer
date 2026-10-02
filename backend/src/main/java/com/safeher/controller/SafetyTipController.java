package com.safeher.controller;

import com.safeher.model.SafetyTip;
import com.safeher.service.SafetyTipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safety-tips")
public class SafetyTipController {

    private final SafetyTipService safetyTipService;

    public SafetyTipController(SafetyTipService safetyTipService) {
        this.safetyTipService = safetyTipService;
    }

    // Public endpoints
    @GetMapping
    public ResponseEntity<List<SafetyTip>> getActiveTips(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(safetyTipService.getTipsByCategory(category));
        }
        return ResponseEntity.ok(safetyTipService.getActiveTips());
    }

    // Admin endpoints
    @GetMapping("/admin")
    public ResponseEntity<List<SafetyTip>> getAllTips() {
        return ResponseEntity.ok(safetyTipService.getAllTips());
    }

    @PostMapping("/admin")
    public ResponseEntity<SafetyTip> createTip(@RequestBody SafetyTip tip) {
        return new ResponseEntity<>(safetyTipService.createTip(tip), HttpStatus.CREATED);
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<SafetyTip> updateTip(@PathVariable Long id, @RequestBody SafetyTip tip) {
        return ResponseEntity.ok(safetyTipService.updateTip(id, tip));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteTip(@PathVariable Long id) {
        safetyTipService.deleteTip(id);
        return ResponseEntity.noContent().build();
    }
}
