package com.safeher.repository;

import com.safeher.model.Journey;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JourneyRepository extends MongoRepository<Journey, String> {
    List<Journey> findByUserIdOrderByJourneyDateDesc(String userId);
    Optional<Journey> findByIdAndUserId(String id, String userId);
}
