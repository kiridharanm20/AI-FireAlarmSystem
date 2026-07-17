package com.firealarm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firealarm.dto.DashboardResponse;
import com.firealarm.entity.Sensor;
import com.firealarm.repository.AlarmRepository;
import com.firealarm.repository.IncidentRepository;
import com.firealarm.repository.SensorRepository;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private SensorRepository sensorRepo;

    @Autowired
    private AlarmRepository alarmRepo;

    @Autowired
    private IncidentRepository incidentRepo;

    @GetMapping
    public DashboardResponse getDashboard() {
        long totalSensors = sensorRepo.count();
        long activeAlarms = alarmRepo.countByStatus("ACTIVE");
        long openIncidents = incidentRepo.countByIncidentStatus("OPEN");

        // Calculate safety score (System Health)
        int score = 100;
        score -= activeAlarms * 15;
        score -= openIncidents * 10;

        // Check if any sensor is faulty (status = 'FAULTY')
        List<Sensor> sensors = sensorRepo.findAll();
        for (Sensor s : sensors) {
            if ("FAULTY".equalsIgnoreCase(s.getStatus())) {
                score -= 8;
            }
        }

        score = Math.max(0, Math.min(100, score));

        // Determine risk level
        String risk = "LOW";
        if (score < 40 || activeAlarms > 0) {
            risk = "CRITICAL";
        } else if (score < 70) {
            risk = "HIGH";
        } else if (score < 90) {
            risk = "MEDIUM";
        }

        return new DashboardResponse(
                totalSensors,
                activeAlarms,
                openIncidents,
                score,
                risk
        );
    }
}