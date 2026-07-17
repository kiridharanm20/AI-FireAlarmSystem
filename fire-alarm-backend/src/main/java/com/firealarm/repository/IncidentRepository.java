package com.firealarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.firealarm.entity.Incident;

public interface IncidentRepository
        extends JpaRepository<Incident, Long> {

    long countByIncidentStatus(String incidentStatus);

}