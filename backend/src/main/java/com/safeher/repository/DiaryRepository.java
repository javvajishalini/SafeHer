package com.safeher.repository;

import com.safeher.model.SafetyDiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<SafetyDiaryEntry, Long> {
    List<SafetyDiaryEntry> findByUserIdOrderByIncidentDateDesc(Long userId);
    Optional<SafetyDiaryEntry> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    List<SafetyDiaryEntry> findByUserIdAndIncidentTypeOrderByIncidentDateDesc(Long userId, String incidentType);

    @Query("SELECT s FROM SafetyDiaryEntry s WHERE s.userId = ?1 AND (LOWER(s.title) LIKE LOWER(CONCAT('%',?2,'%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%',?2,'%'))) ORDER BY s.incidentDate DESC")
    List<SafetyDiaryEntry> searchByUserIdAndKeyword(Long userId, String keyword);
}
