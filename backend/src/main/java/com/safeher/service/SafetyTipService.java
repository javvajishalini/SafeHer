package com.safeher.service;

import com.safeher.model.SafetyTip;
import com.safeher.repository.SafetyTipRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SafetyTipService {
    private final SafetyTipRepository safetyTipRepository;

    public SafetyTipService(SafetyTipRepository safetyTipRepository) {
        this.safetyTipRepository = safetyTipRepository;
    }

    public List<SafetyTip> getActiveTips() {
        return safetyTipRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<SafetyTip> getTipsByCategory(String category) {
        return safetyTipRepository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
    }

    public List<SafetyTip> getAllTips() {
        return safetyTipRepository.findAllByOrderByDisplayOrderAsc();
    }

    public SafetyTip createTip(SafetyTip tip) {
        return safetyTipRepository.save(tip);
    }

    public SafetyTip updateTip(Long id, SafetyTip updatedTip) {
        SafetyTip tip = safetyTipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tip not found"));
        
        tip.setCategory(updatedTip.getCategory());
        tip.setTitle(updatedTip.getTitle());
        tip.setContent(updatedTip.getContent());
        tip.setIcon(updatedTip.getIcon());
        tip.setActive(updatedTip.isActive());
        tip.setDisplayOrder(updatedTip.getDisplayOrder());
        
        return safetyTipRepository.save(tip);
    }
    
    public void deleteTip(Long id) {
        safetyTipRepository.deleteById(id);
    }
}
