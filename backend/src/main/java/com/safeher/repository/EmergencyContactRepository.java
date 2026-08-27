package com.safeher.repository;

import com.safeher.model.EmergencyContact;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface EmergencyContactRepository extends MongoRepository<EmergencyContact, String> {
    List<EmergencyContact> findByUserIdOrderByPriorityAsc(String userId);
    Optional<EmergencyContact> findByIdAndUserId(String id, String userId);
}
