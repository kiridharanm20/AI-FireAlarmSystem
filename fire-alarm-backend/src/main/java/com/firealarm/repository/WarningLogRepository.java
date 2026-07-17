package com.firealarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import com.firealarm.entity.WarningLog;
import java.util.List;

public interface WarningLogRepository extends JpaRepository<WarningLog, Long> {
    
    List<WarningLog> findAllByOrderByCreatedAtDesc();

    @Transactional
    @Modifying
    @Query("DELETE FROM WarningLog w WHERE w.incidentStatus = 'CLOSED' OR w.alarmStatus = 'RESOLVED' OR w.alarmStatus = 'RESET'")
    void deleteResolvedLogs();

    @Transactional
    @Modifying
    @Query("DELETE FROM WarningLog w WHERE w.incidentId = :incidentId")
    void deleteByIncidentId(@Param("incidentId") Long incidentId);
}
