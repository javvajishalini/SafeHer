package com.safeher.repository;

import com.safeher.model.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserIdOrderByPriorityAsc(Long userId);
    Optional<EmergencyContact> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    List<EmergencyContact> findByUserIdAndIsActiveTrue(Long userId);
}
