package com.firealarm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firealarm.entity.Alarm;
import com.firealarm.entity.Sensor;
import com.firealarm.entity.WarningLog;
import com.firealarm.repository.AlarmRepository;
import com.firealarm.repository.SensorRepository;
import com.firealarm.repository.WarningLogRepository;
import com.firealarm.service.EmailService;

@RestController
@RequestMapping("/api/alarms")
@CrossOrigin(origins = "http://localhost:3000")
public class AlarmController {

    private static boolean isSirenBroadcastActive = false;
    private static boolean isSirenBroadcastMuted = false;

    @Autowired
    private AlarmRepository repository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private com.firealarm.repository.IncidentRepository incidentRepository;

    @Autowired
    private WarningLogRepository warningLogRepository;

    private void sanitizeAlarm(Alarm alarm) {
        if (alarm.getSensorLocation() == null || alarm.getSensorLocation().trim().isEmpty()) {
            Sensor sensor = null;
            if (alarm.getSensorId() != null) {
                sensor = sensorRepository.findById(alarm.getSensorId()).orElse(null);
            }
            alarm.setSensorLocation(sensor != null ? sensor.getLocation() : "Unknown Location");
        }
        if (alarm.getSeverity() == null || alarm.getSeverity().trim().isEmpty()) {
            Sensor sensor = null;
            if (alarm.getSensorId() != null) {
                sensor = sensorRepository.findById(alarm.getSensorId()).orElse(null);
            }
            String sev = (sensor != null && sensor.getSeverity() != null && !sensor.getSeverity().trim().isEmpty()) 
                         ? sensor.getSeverity() : "Unknown Severity";
            alarm.setSeverity(sev);
        }
    }

    @PostMapping
    public Alarm createAlarm(
            @RequestBody Alarm alarm) {
        alarm.setStatus("ACTIVE");

        Sensor sensor = sensorRepository.findById(alarm.getSensorId()).orElse(null);
        
        // Resolve sensorLocation: prior to sensor location, then fall back
        String location = sensor != null ? sensor.getLocation() : alarm.getSensorLocation();
        if (location == null || location.trim().isEmpty()) {
            location = "Unknown Location";
        }
        alarm.setSensorLocation(location);

        // Resolve severity: prior to request severity, then sensor severity, then default to HIGH
        String severity = alarm.getSeverity();
        if (severity == null || severity.trim().isEmpty()) {
            severity = (sensor != null && sensor.getSeverity() != null && !sensor.getSeverity().trim().isEmpty()) 
                       ? sensor.getSeverity() : "HIGH";
        }
        alarm.setSeverity(severity);

        // Save after setting the resolved fields
        Alarm savedAlarm = repository.save(alarm);

        // Automatically create a corresponding OPEN incident
        com.firealarm.entity.Incident incident = new com.firealarm.entity.Incident();
        incident.setLocation(location);
        incident.setSeverity(severity);
        incident.setIncidentStatus("OPEN");
        incident.setDate(java.time.LocalDate.now().toString());
        incident.setSummary(String.format("Automated Incident Log. Active %s alarm detected by Sensor #%s at %s. Spread hazard simulation underway.",
                severity, alarm.getSensorId(), java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19)));

        incidentRepository.save(incident);

        // Automatically create a corresponding WarningLog record
        WarningLog warningLog = new WarningLog();
        warningLog.setIncidentId(incident.getId());
        warningLog.setSensorId(savedAlarm.getSensorId());
        warningLog.setLocation(location);
        warningLog.setSeverity(severity);
        warningLog.setAlarmStatus("ACTIVE");
        warningLog.setIncidentStatus("OPEN");
        warningLog.setWarningMessage(String.format("🚨 CRITICAL WARNING: Active %s fire hazard detected at %s by Sensor S-%s.", 
                severity, location, savedAlarm.getSensorId()));
        warningLog.setActionTaken("Command Center alerted. Aerosol systems armed. LED Exit arrows enabled.");
        warningLog.setCreatedAt(java.time.LocalDateTime.now());
        warningLog.setCreatedBy("admin");
        warningLogRepository.save(warningLog);

        try {
            emailService.sendAlarmEmailToVerifiedUsers(savedAlarm, incident, warningLog);
        } catch (Exception e) {
            System.err.println("Error sending email notification to verified users: " + e.getMessage());
        }

        return savedAlarm;
    }

    @GetMapping
    public List<Alarm> getAlarms() {
        List<Alarm> alarms = repository.findAll();
        for (Alarm a : alarms) {
            sanitizeAlarm(a);
        }
        return alarms;
    }

    @PutMapping("/{id}/reset")
    public Alarm resetAlarm(
        @PathVariable Long id) {

        Alarm alarm = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alarm Not Found"));

        alarm.setStatus("RESET");
        sanitizeAlarm(alarm);

        // Automatically update corresponding warning logs to resolved
        List<WarningLog> logs = warningLogRepository.findAll();
        for (WarningLog log : logs) {
            if (log.getSensorId() != null && log.getSensorId().equals(alarm.getSensorId()) && "ACTIVE".equals(log.getAlarmStatus())) {
                log.setAlarmStatus("RESOLVED");
                log.setActionTaken("Alarm reset by admin.");
                warningLogRepository.save(log);
            }
        }

        return repository.save(alarm);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteAlarm(
            @PathVariable Long id) {
        repository.deleteAlarmPermanently(id);
        return org.springframework.http.ResponseEntity.ok("Alarm record deleted successfully.");
    }

    @GetMapping("/siren-status")
    public java.util.Map<String, Boolean> getSirenStatus() {
        return java.util.Map.of("active", isSirenBroadcastActive, "muted", isSirenBroadcastMuted);
    }

    @PutMapping("/siren-status")
    public java.util.Map<String, Boolean> updateSirenStatus(@RequestBody java.util.Map<String, Boolean> body) {
        if (body != null) {
            if (body.containsKey("active")) {
                isSirenBroadcastActive = body.get("active");
            }
            if (body.containsKey("muted")) {
                isSirenBroadcastMuted = body.get("muted");
            }
        }
        return java.util.Map.of("active", isSirenBroadcastActive, "muted", isSirenBroadcastMuted);
    }
}