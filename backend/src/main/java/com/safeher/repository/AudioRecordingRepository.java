package com.safeher.repository;

import com.safeher.model.AudioRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AudioRecordingRepository extends JpaRepository<AudioRecording, Long> {
    List<AudioRecording> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<AudioRecording> findByIdAndUserId(Long id, Long userId);
}
