// Stateful Offline Database Simulator for FireGuard AI
// This file initializes and synchronizes mock data in localStorage so that all pages
// share state when the Spring Boot backend is offline (Sandbox Mode).

const INITIAL_SENSORS = [
  { id: 101, location: "Floor 1 Main Lobby", sensorType: "Heat Sensor", status: "ACTIVE", battery: 94, installDate: "2025-02-12", severity: "MEDIUM" },
  { id: 102, location: "Floor 2 Server Room", sensorType: "Smoke Detector", status: "ACTIVE", battery: 18, installDate: "2024-11-05", severity: "HIGH" },
  { id: 103, location: "Floor 3 Cafeteria", sensorType: "Flame Sensor", status: "FAULTY", battery: 85, installDate: "2025-01-20", severity: "MEDIUM" },
  { id: 104, location: "Floor 1 East Parking", sensorType: "CO2 Gas Sensor", status: "ACTIVE", battery: 88, installDate: "2025-03-01", severity: "LOW" },
  { id: 105, location: "Floor 2 North Office A", sensorType: "Smoke Detector", status: "ACTIVE", battery: 92, installDate: "2025-04-10", severity: "LOW" }
];

const INITIAL_ALARMS = [
  { id: 501, sensorId: 102, sensorLocation: "Floor 2 Server Room", severity: "MEDIUM", status: "RESOLVED", alarmTime: "2026-07-07 10:15:30" },
  { id: 502, sensorId: 104, sensorLocation: "Floor 1 East Parking", severity: "LOW", status: "RESOLVED", alarmTime: "2026-07-07 18:40:12" }
];

const INITIAL_INCIDENTS = [
  { id: 801, location: "Floor 2 Server Room", severity: "MEDIUM", incidentStatus: "CLOSED", summary: "Temperature spiked temporarily due to server rack AC unit glitch. Resolved manually.", date: "2026-07-07" },
  { id: 802, location: "Floor 1 East Parking", severity: "LOW", incidentStatus: "CLOSED", summary: "Exhaust fume accumulation triggered CO2 warning. Ventilators activated automatically.", date: "2026-07-07" }
];

const INITIAL_USERS = [
  { id: 1, username: "admin", role: "ADMIN" },
  { id: 2, username: "user", role: "USER" },
  { id: 3, username: "operator_sam", role: "USER" }
];

const INITIAL_WARNING_LOGS = [
  {
    id: 901,
    incidentId: 801,
    sensorId: 102,
    location: "Floor 2 Server Room",
    severity: "HIGH",
    warningMessage: "🚨 CRITICAL WARNING: Active HIGH fire hazard detected at Floor 2 Server Room by Sensor S-102.",
    alarmStatus: "RESOLVED",
    incidentStatus: "CLOSED",
    actionTaken: "Command Center reset alarm manually.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdBy: "admin"
  },
  {
    id: 902,
    incidentId: 802,
    sensorId: 104,
    location: "Floor 1 East Parking",
    severity: "LOW",
    warningMessage: "🚨 WARNING: Active LOW CO2 warning detected at Floor 1 East Parking by Sensor S-104.",
    alarmStatus: "RESOLVED",
    incidentStatus: "CLOSED",
    actionTaken: "Ventilators triggered automatically.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdBy: "operator_sam"
  }
];

export const initSimulatorData = (force = false) => {
  if (force || !localStorage.getItem("sim_sensors")) {
    localStorage.setItem("sim_sensors", JSON.stringify(INITIAL_SENSORS));
  }
  if (force || !localStorage.getItem("sim_alarms")) {
    localStorage.setItem("sim_alarms", JSON.stringify(INITIAL_ALARMS));
  }
  if (force || !localStorage.getItem("sim_incidents")) {
    localStorage.setItem("sim_incidents", JSON.stringify(INITIAL_INCIDENTS));
  }
  if (force || !localStorage.getItem("sim_users")) {
    localStorage.setItem("sim_users", JSON.stringify(INITIAL_USERS));
  }
  if (force || !localStorage.getItem("sim_warning_logs")) {
    localStorage.setItem("sim_warning_logs", JSON.stringify(INITIAL_WARNING_LOGS));
  }
};

// Auto-run on import to ensure seed data exists
initSimulatorData();

export const SimulatorDb = {
  // SENSORS
  getSensors: () => JSON.parse(localStorage.getItem("sim_sensors") || "[]"),
  saveSensors: (sensors) => localStorage.setItem("sim_sensors", JSON.stringify(sensors)),
  addSensor: (sensor) => {
    const sensors = SimulatorDb.getSensors();
    const newSensor = {
      ...sensor,
      id: sensors.length > 0 ? Math.max(...sensors.map(s => s.id)) + 1 : 101,
      battery: sensor.battery || 100,
      installDate: sensor.installDate || new Date().toISOString().split("T")[0]
    };
    sensors.push(newSensor);
    SimulatorDb.saveSensors(sensors);
    return newSensor;
  },
  updateSensor: (id, updatedFields) => {
    const sensors = SimulatorDb.getSensors();
    const index = sensors.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      sensors[index] = { ...sensors[index], ...updatedFields };
      SimulatorDb.saveSensors(sensors);
    }
  },
  deleteSensor: (id) => {
    const sensors = SimulatorDb.getSensors();
    const filtered = sensors.filter(s => s.id !== Number(id));
    SimulatorDb.saveSensors(filtered);
  },

  // ALARMS
  getAlarms: () => JSON.parse(localStorage.getItem("sim_alarms") || "[]"),
  saveAlarms: (alarms) => localStorage.setItem("sim_alarms", JSON.stringify(alarms)),
  triggerAlarm: (sensorId, location, severity) => {
    const alarms = SimulatorDb.getAlarms();
    const newAlarm = {
      id: alarms.length > 0 ? Math.max(...alarms.map(a => a.id)) + 1 : 501,
      sensorId: Number(sensorId) || null,
      sensorLocation: location,
      severity,
      status: "ACTIVE",
      alarmTime: new Date().toLocaleString()
    };
    alarms.unshift(newAlarm); // put at front
    SimulatorDb.saveAlarms(alarms);

    // Also automatically create an OPEN incident associated with this alarm!
    const incidents = SimulatorDb.getIncidents();
    const newIncident = {
      id: incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 801,
      location,
      severity,
      incidentStatus: "OPEN",
      summary: `Automated Incident Log. Active ${severity} alarm detected by Sensor #${sensorId || "Unknown"} at ${newAlarm.alarmTime}. Spread hazard simulation underway.`,
      date: new Date().toISOString().split("T")[0]
    };
    incidents.unshift(newIncident);
    SimulatorDb.saveIncidents(incidents);

    // Also automatically create a Warning Log record
    const warningLogs = SimulatorDb.getWarningLogs();
    const newWarningLog = {
      id: warningLogs.length > 0 ? Math.max(...warningLogs.map(w => w.id)) + 1 : 901,
      incidentId: newIncident.id,
      sensorId: Number(sensorId) || null,
      location,
      severity,
      warningMessage: `🚨 CRITICAL WARNING: Active ${severity} fire hazard detected at ${location} by Sensor S-${sensorId || "Unknown"}.`,
      alarmStatus: "ACTIVE",
      incidentStatus: "OPEN",
      actionTaken: "Command Center alerted. Aerosol systems armed. LED Exit arrows enabled.",
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    };
    warningLogs.unshift(newWarningLog);
    SimulatorDb.saveWarningLogs(warningLogs);
    
    return newAlarm;
  },
  resetAlarm: (id) => {
    const alarms = SimulatorDb.getAlarms();
    const index = alarms.findIndex(a => a.id === Number(id));
    if (index !== -1) {
      const alarm = alarms[index];
      alarm.status = "RESOLVED";
      SimulatorDb.saveAlarms(alarms);

      // Automatically update corresponding warning logs to resolved
      const warningLogs = SimulatorDb.getWarningLogs();
      warningLogs.forEach(log => {
        if (log.sensorId === alarm.sensorId && log.alarmStatus === "ACTIVE") {
          log.alarmStatus = "RESOLVED";
          log.actionTaken = "Alarm reset by admin.";
        }
      });
      SimulatorDb.saveWarningLogs(warningLogs);
    }
  },
  deleteAlarm: (id) => {
    const alarms = SimulatorDb.getAlarms();
    const filtered = alarms.filter(a => a.id !== Number(id));
    SimulatorDb.saveAlarms(filtered);
  },

  // INCIDENTS
  getIncidents: () => JSON.parse(localStorage.getItem("sim_incidents") || "[]"),
  saveIncidents: (incidents) => localStorage.setItem("sim_incidents", JSON.stringify(incidents)),
  closeIncident: (id) => {
    const incidents = SimulatorDb.getIncidents();
    const index = incidents.findIndex(i => i.id === Number(id));
    if (index !== -1) {
      const incident = incidents[index];
      incident.incidentStatus = "CLOSED";
      SimulatorDb.saveIncidents(incidents);

      // Automatically update corresponding warning logs to closed
      const warningLogs = SimulatorDb.getWarningLogs();
      warningLogs.forEach(log => {
        if (log.incidentId === incident.id) {
          log.incidentStatus = "CLOSED";
          log.actionTaken = "Incident closed by admin.";
        }
      });
      SimulatorDb.saveWarningLogs(warningLogs);
    }
  },

  // WARNING LOGS
  getWarningLogs: () => JSON.parse(localStorage.getItem("sim_warning_logs") || "[]"),
  saveWarningLogs: (logs) => localStorage.setItem("sim_warning_logs", JSON.stringify(logs)),
  clearResolvedWarningLogs: () => {
    const logs = SimulatorDb.getWarningLogs();
    const filtered = logs.filter(log => log.incidentStatus !== "CLOSED" && log.alarmStatus !== "RESOLVED" && log.alarmStatus !== "RESET");
    SimulatorDb.saveWarningLogs(filtered);
  },

  // USERS
  getUsers: () => JSON.parse(localStorage.getItem("sim_users") || "[]"),
  saveUsers: (users) => localStorage.setItem("sim_users", JSON.stringify(users)),
  addUser: (user) => {
    const users = SimulatorDb.getUsers();
    const newUser = {
      ...user,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
    };
    users.push(newUser);
    SimulatorDb.saveUsers(users);
    return newUser;
  },
  deleteUser: (id) => {
    const users = SimulatorDb.getUsers();
    const filtered = users.filter(u => u.id !== Number(id));
    SimulatorDb.saveUsers(filtered);
  },

  // DYNAMIC STATS CALCULATOR
  getStats: () => {
    const sensors = SimulatorDb.getSensors();
    const alarms = SimulatorDb.getAlarms();
    const incidents = SimulatorDb.getIncidents();

    const totalSensors = sensors.length;
    const activeAlarms = alarms.filter(a => a.status === "ACTIVE").length;
    const openIncidents = incidents.filter(i => i.incidentStatus === "OPEN").length;

    let score = 100;
    
    score -= activeAlarms * 15;
    score -= openIncidents * 10;
    
    sensors.forEach(s => {
      if (s.status === "FAULTY") score -= 8;
      if (s.battery < 25) score -= 4;
    });

    score = Math.max(0, Math.min(100, score));

    let riskLevel = "LOW";
    if (score < 50 || activeAlarms > 0) riskLevel = "HIGH";
    else if (score < 80 || openIncidents > 0) riskLevel = "MEDIUM";

    const activeCount = sensors.filter(s => s.status === "ACTIVE").length;
    const healthPercent = totalSensors > 0 ? Math.round((activeCount / totalSensors) * 100) : 100;

    return {
      sensors: totalSensors,
      alarms: activeAlarms,
      incidents: openIncidents,
      preventionScore: score,
      riskLevel,
      systemHealth: healthPercent
    };
  },

  getAnalyticsDashboard: () => {
    const alarms = SimulatorDb.getAlarms();
    const incidents = SimulatorDb.getIncidents();

    const totalIncidents = incidents.length;
    const activeAlarms = alarms.filter(a => a.status === "ACTIVE").length;
    const closedIncidents = incidents.filter(i => i.incidentStatus === "CLOSED").length;

    let mostAffected = "N/A";
    if (incidents.length > 0) {
      const counts = incidents.reduce((acc, curr) => {
        acc[curr.location] = (acc[curr.location] || 0) + 1;
        return acc;
      }, {});
      mostAffected = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "N/A");
    }

    let mostCommon = "N/A";
    if (incidents.length > 0) {
      const counts = incidents.reduce((acc, curr) => {
        acc[curr.severity] = (acc[curr.severity] || 0) + 1;
        return acc;
      }, {});
      mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "N/A");
    }

    const insights = [];
    if (mostAffected !== "N/A") {
      insights.push(`${mostAffected} has the highest number of incidents.`);
    } else {
      insights.push("No dangerous locations logged yet.");
    }
    if (mostCommon !== "N/A") {
      insights.push(`${mostCommon} severity incidents are the most common.`);
    } else {
      insights.push("No severity distribution recorded.");
    }
    insights.push("Incidents increased by 20% compared to last month.");

    return {
      totalIncidents,
      mostAffectedLocation: mostAffected,
      mostCommonSeverity: mostCommon,
      activeAlarms,
      closedIncidents,
      insights
    };
  },

  getAnalyticsSeverityDistribution: () => {
    const incidents = SimulatorDb.getIncidents();
    const counts = incidents.reduce((acc, curr) => {
      acc[curr.severity] = (acc[curr.severity] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "LOW", value: counts["LOW"] || 0 },
      { name: "MEDIUM", value: counts["MEDIUM"] || 0 },
      { name: "HIGH", value: counts["HIGH"] || 0 },
      { name: "CRITICAL", value: counts["CRITICAL"] || 0 }
    ];
  },

  getAnalyticsIncidentsByLocation: () => {
    const incidents = SimulatorDb.getIncidents();
    const counts = incidents.reduce((acc, curr) => {
      acc[curr.location] = (acc[curr.location] || 0) + 1;
      return acc;
    }, {});
    const list = Object.keys(counts).map(loc => ({
      location: loc,
      count: counts[loc]
    }));
    return list.sort((a, b) => b.count - a.count);
  },

  getAnalyticsMonthlyTrends: () => {
    const incidents = SimulatorDb.getIncidents();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const baseCount = incidents.length;
    return months.map((month, i) => {
      const count = Math.round((baseCount * (0.5 + (i * 0.1))) + (i % 2));
      return {
        month,
        incidents: Math.max(1, count)
      };
    });
  },

  getAnalyticsAIInsights: () => {
    const stats = SimulatorDb.getStats();
    const incidents = SimulatorDb.getIncidents();
    const insights = [];
    if (stats.preventionScore < 85) {
      insights.push("Building safety score decreased this week due to active alarms.");
    } else {
      insights.push(`Building safety score remains stable and secure at ${Math.round(stats.preventionScore)}%.`);
    }
    if (stats.alarms > 0) {
      insights.push("High risk detected! Active alarms require immediate action.");
    }
    if (incidents.length > 0) {
      const counts = incidents.reduce((acc, curr) => {
        acc[curr.location] = (acc[curr.location] || 0) + 1;
        return acc;
      }, {});
      const maxLoc = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "");
      if (maxLoc && counts[maxLoc] > 1) {
        insights.push(`${maxLoc} has repeated incidents. Immediate inspection is recommended.`);
      }
    }
    insights.push("Scheduled maintenance check for smoke sensors recommended next Monday.");
    return insights;
  },

  getAnalyticsPredictions: () => {
    const incidents = SimulatorDb.getIncidents();
    const currentCount = incidents.length;
    const predictedNextMonth = Math.round(currentCount * 0.12) + 2;
    return {
      predictedNextMonthIncidentCount: predictedNextMonth,
      highRiskLocations: ["Floor 2 Server Room", "Floor 3 Cafeteria"],
      predictedSensorFailures: ["S-102", "S-105"],
      predictedAlarmTrend: "Upward trend projected due to summer temperature rise."
    };
  }
};
