import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  RotateCcw,
  Clock,
  MapPin,
  Cpu,
  Info,
  Trash2,
  AlertTriangle
} from "lucide-react";

function AlarmMonitoring() {
  const [alarms, setAlarms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";

  useEffect(() => {
    loadAlarms();

    // Dynamic real-time synchronization interval
    const pollInterval = setInterval(() => {
      loadAlarms();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadAlarms = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/alarms");
      setAlarms(response.data);
    } catch (error) {
      console.error("Backend offline, failed to load active alarms");
      setErrorMessage("Failed to connect to the safety database. Please ensure your backend is online.");
    }
  };

  const resetAlarm = async (id) => {
    try {
      await axios.put(`http://localhost:8081/api/alarms/${id}/reset`);
      loadAlarms();
    } catch (error) {
      alert("Failed to reset alarm on backend database.");
    }
  };

  const handleDeleteAlarm = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alarm record?")) return;

    try {
      await axios.delete(`http://localhost:8081/api/alarms/${id}`);
      loadAlarms();
    } catch (error) {
      alert("Failed to delete alarm on backend database.");
    }
  };

  const getSirenStatus = (status, severity) => {
    if (!status || status === "RESET" || status === "RESOLVED") {
      return { label: "OFF", badgeClass: "badge-success", showDot: false };
    }
    const sev = String(severity || "").toUpperCase();
    if (sev === "LOW") {
      return { label: "ALERT", badgeClass: "badge-info", showDot: true };
    }
    if (sev === "MEDIUM") {
      return { label: "WARNING", badgeClass: "badge-warning", showDot: true };
    }
    if (sev === "HIGH") {
      return { label: "BLASTING", badgeClass: "badge-danger", showDot: true };
    }
    if (sev === "CRITICAL") {
      return { label: "EMERGENCY", badgeClass: "badge-danger animate-pulse", showDot: true };
    }
    return { label: "IDLE", badgeClass: "badge-success", showDot: false };
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {errorMessage && (
        <div className="glass-panel" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "16px", color: "#fca5a5" }}>
          <AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
          {errorMessage}
        </div>
      )}

      {/* Main Alarms table logs */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} style={{ color: "var(--primary)" }} />
            Active Warning Logs & Records
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Showing {alarms.length} entries
          </span>
        </div>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source Node ID</th>
                <th>Sensor Location</th>
                <th>Severity</th>
                <th>Trigger Timestamp</th>
                <th>Siren Status</th>
                <th style={{ textAlign: "right" }}>Operational Action</th>
              </tr>
            </thead>
            <tbody>
              {alarms.length > 0 ? (
                alarms.map((a) => (
                  <tr key={a.id} style={{ background: a.status === "ACTIVE" ? "rgba(239, 68, 68, 0.02)" : "" }}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>A-{a.id}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Cpu size={12} style={{ color: "var(--accent)" }} />
                        S-{a.sensorId || "Unknown"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                        {a.sensorLocation || "Unknown Location"}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${a.severity === "HIGH" ? "badge-danger" : a.severity === "MEDIUM" ? "badge-warning" : "badge-success"}`}>
                        {a.severity || "Unknown Severity"}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
                        <Clock size={12} />
                        {a.alarmTime}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const siren = getSirenStatus(a.status, a.severity);
                        return (
                          <span className={`saas-badge ${siren.badgeClass}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            {siren.showDot && <span style={{ width: "6px", height: "6px", background: "red", borderRadius: "50%" }} />}
                            {siren.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                        {a.status === "ACTIVE" ? (
                          isAdmin ? (
                            <button
                              onClick={() => resetAlarm(a.id)}
                              className="saas-btn saas-btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem", gap: "6px" }}
                            >
                              <RotateCcw size={12} /> Reset Signal
                            </button>
                          ) : (
                            <span style={{ color: "var(--warning)", fontSize: "0.8rem" }}>Admin Reset Required</span>
                          )
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Cleared</span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAlarm(a.id)}
                            className="saas-btn saas-btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--danger)" }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <Info size={24} style={{ margin: "0 auto 10px", display: "block" }} />
                    No alarm warning signals registered in logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AlarmMonitoring;