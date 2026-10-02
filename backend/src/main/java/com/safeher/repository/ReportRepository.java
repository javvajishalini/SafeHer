package com.safeher.repository;

import com.safeher.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<IncidentReport> findByIdAndUserId(Long id, Long userId);
    long countByStatus(String status);
    List<IncidentReport> findAllByOrderByCreatedAtDesc();
}
