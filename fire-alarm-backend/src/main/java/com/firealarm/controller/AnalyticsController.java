package com.firealarm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.firealarm.service.AnalyticsService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private AnalyticsService service;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        return service.getDashboardStats();
    }

    @GetMapping("/severity-distribution")
    public List<Map<String, Object>> getSeverityDistribution() {
        return service.getSeverityDistribution();
    }

    @GetMapping("/incidents-by-location")
    public List<Map<String, Object>> getIncidentsByLocation() {
        return service.getIncidentsByLocation();
    }

    @GetMapping("/monthly-trends")
    public List<Map<String, Object>> getMonthlyTrends() {
        return service.getMonthlyTrends();
    }
}
