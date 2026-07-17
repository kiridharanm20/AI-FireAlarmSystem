package com.firealarm.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firealarm.repository.AlarmRepository;
import com.firealarm.repository.IncidentRepository;
import com.firealarm.repository.SensorRepository;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private SensorRepository sensorRepo;

    @Autowired
    private AlarmRepository alarmRepo;

    @Autowired
    private IncidentRepository incidentRepo;

    @GetMapping("/summary")
    public Map<String,Object> summary() {

        Map<String,Object> report =
                new HashMap<>();

        report.put("totalSensors",
                sensorRepo.count());

        report.put("totalAlarms",
                alarmRepo.count());

        report.put("totalIncidents",
                incidentRepo.count());

        return report;
    }
}