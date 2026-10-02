package com.safeher.repository;

import com.safeher.model.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
}
