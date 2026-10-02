package com.safeher.repository;

import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    List<Journey> findByUserIdOrderByJourneyDateDesc(Long userId);
    Optional<Journey> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndStatus(Long userId, JourneyStatus status);
    List<Journey> findByUserIdAndStatusOrderByJourneyDateDesc(Long userId, JourneyStatus status);
}
