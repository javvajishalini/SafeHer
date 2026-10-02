package com.safeher.repository;

import com.safeher.model.SOSIncident;
import com.safeher.model.SOSStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SOSIncidentRepository extends JpaRepository<SOSIncident, Long> {
    List<SOSIncident> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SOSIncident> findByIdAndUserId(Long id, Long userId);
    long countByStatus(SOSStatus status);
    List<SOSIncident> findByStatus(SOSStatus status);
    List<SOSIncident> findAllByOrderByCreatedAtDesc();
}
