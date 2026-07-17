package com.firealarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.firealarm.entity.Sensor;

public interface SensorRepository
        extends JpaRepository<Sensor, Long> {
}