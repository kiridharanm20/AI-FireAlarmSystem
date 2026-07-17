package com.firealarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.firealarm.entity.Alarm;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    long countByStatus(String status);

    @Transactional
    @Modifying
    @Query("DELETE FROM Alarm a WHERE a.id = :id")
    void deleteAlarmPermanently(@Param("id") Long id);
}