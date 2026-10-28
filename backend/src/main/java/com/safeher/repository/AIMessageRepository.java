package com.safeher.repository;

import com.safeher.model.AIConversation;
import com.safeher.model.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {

    /** Load all messages for a conversation ordered chronologically (oldest first). */
    List<AIMessage> findByConversationOrderByCreatedAtAsc(AIConversation conversation);

    /** Delete all messages belonging to a conversation (used when cleaning up). */
    void deleteByConversation(AIConversation conversation);
}
