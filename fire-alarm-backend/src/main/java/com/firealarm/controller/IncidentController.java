package com.firealarm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.firealarm.entity.Incident;
import com.firealarm.entity.WarningLog;
import com.firealarm.repository.IncidentRepository;
import com.firealarm.repository.WarningLogRepository;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {

    @Autowired
    private IncidentRepository repository;

    @Autowired
    private WarningLogRepository warningLogRepository;

    @GetMapping
    public List<Incident> getIncidents() {
        return repository.findAll();
    }

    @PostMapping
    public Incident addIncident(
            @RequestBody Incident incident) {

        incident.setIncidentStatus("OPEN");
        return repository.save(incident);
    }
    @PutMapping("/{id}/close")
public Incident closeIncident(
        @PathVariable Long id) {

    Incident incident =
            repository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Incident Not Found"));

    incident.setIncidentStatus("CLOSED");

    // Automatically update corresponding warning logs to closed
    List<WarningLog> logs = warningLogRepository.findAll();
    for (WarningLog log : logs) {
        if (log.getIncidentId() != null && log.getIncidentId().equals(incident.getId())) {
            log.setIncidentStatus("CLOSED");
            log.setActionTaken("Incident closed by admin.");
            warningLogRepository.save(log);
        }
    }
    return repository.save(incident);
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncident(
            @PathVariable Long id) {
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.status(404)
                        .body(java.util.Map.of("message", "Incident record not found."));
            }

            // Cascade delete related warning logs
            warningLogRepository.deleteByIncidentId(id);

            repository.deleteById(id);

            return ResponseEntity.ok(java.util.Map.of("message", "Incident deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Database Constraint Violation: " + e.getMessage()));
        }
    }
}