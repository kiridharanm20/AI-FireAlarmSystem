package com.firealarm.dto;

public class DashboardResponse {

    private long sensors;
    private long alarms;
    private long incidents;
    private int systemHealth;
    private String fireRisk;

    public DashboardResponse(
            long sensors,
            long alarms,
            long incidents,
            int systemHealth,
            String fireRisk) {

        this.sensors = sensors;
        this.alarms = alarms;
        this.incidents = incidents;
        this.systemHealth = systemHealth;
        this.fireRisk = fireRisk;
    }

    public long getSensors() {
        return sensors;
    }

    public long getAlarms() {
        return alarms;
    }

    public long getIncidents() {
        return incidents;
    }

    public int getSystemHealth() {
        return systemHealth;
    }

    public String getFireRisk() {
        return fireRisk;
    }
}