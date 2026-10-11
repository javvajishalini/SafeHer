package com.safeher.repository;

import com.safeher.model.Journey;
import com.safeher.model.JourneyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {

    List<Journey> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Journey> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndStatus(Long userId, JourneyStatus status);

    List<Journey> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, JourneyStatus status);

    /** Find the user's currently active journey */
    Optional<Journey> findFirstByUserIdAndStatus(Long userId, JourneyStatus status);

    /**
     * Overdue check: all ACTIVE journeys whose expected_arrival_at is in the past
     * AND whose overdue_alert_sent is false.
     */
    @Query("SELECT j FROM Journey j WHERE j.status = 'ACTIVE' AND j.expectedArrivalAt IS NOT NULL AND j.expectedArrivalAt < :now AND j.overdueAlertSent = false")
    List<Journey> findOverdueJourneys(Instant now);

    /** All journeys with status ACTIVE or OVERDUE for admin monitoring */
    List<Journey> findByStatus(JourneyStatus status);
}
