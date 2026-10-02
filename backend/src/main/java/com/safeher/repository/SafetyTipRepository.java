package com.safeher.repository;

import com.safeher.model.SafetyTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SafetyTipRepository extends JpaRepository<SafetyTip, Long> {
    List<SafetyTip> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<SafetyTip> findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(String category);
    List<SafetyTip> findAllByOrderByDisplayOrderAsc();
}
