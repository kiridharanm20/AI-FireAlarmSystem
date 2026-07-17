import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  BellRing,
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import "./DashboardHome.css";

function DashboardHome({ setPage }) {
  const [stats, setStats] = useState({
    sensors: 0,
    alarms: 0,
    incidents: 0,
    preventionScore: 100,
    riskLevel: "LOW",
    systemHealth: 100
  });

  const [recentAlarms, setRecentAlarms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setErrorMessage("");
      const dashRes = await axios.get("http://localhost:8081/api/dashboard");
      
      setStats({
        sensors: dashRes.data.sensors || 0,
        alarms: dashRes.data.alarms || 0,
        incidents: dashRes.data.incidents || 0,
        preventionScore: dashRes.data.systemHealth !== undefined ? dashRes.data.systemHealth : 100,
        riskLevel: dashRes.data.fireRisk || "LOW",
        systemHealth: dashRes.data.systemHealth !== undefined ? dashRes.data.systemHealth : 100
      });

      // Load recent alarms from backend
      const alarmRes = await axios.get("http://localhost:8081/api/alarms");
      setRecentAlarms(alarmRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
      setErrorMessage("Failed to connect to real-time safety database. Please ensure your backend server is online.");
    }
  };

  const getSuggestions = () => {
    const list = [];
    const activeAlarms = stats.alarms;

    if (activeAlarms > 0) {
      list.push("Immediately dispatch personnel to Floor fire zones");
      list.push("Confirm automatic vent triggers are open");
    }

    list.push("Conduct routine HVAC check on Floor 3 corridor");
    list.push("Inspect emergency exit pathways for debris");

    return list.slice(0, 3);
  };

  return (
    <div className="animate-fade-in">
      {errorMessage && (
        <div className="glass-panel" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "16px", marginBottom: "20px", color: "#fca5a5", fontSize: "0.9rem" }}>
          <AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
          {errorMessage}
        </div>
      )}

      {/* 5 KPI Cards Row */}
      <div className="dashboard-grid">
        {/* Card 1: Sensors */}
        <div className="kpi-card kpi-sensors" onClick={() => setPage("sensor")} style={{ cursor: "pointer" }}>
          <div className="kpi-card-header">
            <span className="kpi-label">Monitored Fleet</span>
            <div className="kpi-icon-wrap">
              <Activity size={18} />
            </div>
          </div>
          <div className="kpi-val">{stats.sensors}</div>
          <div className="kpi-trend">
            <span style={{ color: "var(--success)" }}>Online</span> • Total Sensors
          </div>
        </div>

        {/* Card 2: Active Alarms */}
        <div
          className={`kpi-card kpi-alarms ${stats.alarms > 0 ? "active-alert" : ""}`}
          onClick={() => setPage("alarm")}
          style={{ cursor: "pointer" }}
        >
          <div className="kpi-card-header">
            <span className="kpi-label">Active Broadcasts</span>
            <div className="kpi-icon-wrap">
              <BellRing size={18} className={stats.alarms > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          <div className="kpi-val">{stats.alarms}</div>
          <div className="kpi-trend">
            {stats.alarms > 0 ? (
              <span style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "2px" }}>
                <TrendingUp size={12} /> Emergency Active
              </span>
            ) : (
              <span>No Active Alarms</span>
            )}
          </div>
        </div>

        {/* Card 3: Open Incidents */}
        <div className="kpi-card kpi-incidents" onClick={() => setPage("incident")} style={{ cursor: "pointer" }}>
          <div className="kpi-card-header">
            <span className="kpi-label">Open Incidents</span>
            <div className="kpi-icon-wrap">
              <Flame size={18} />
            </div>
          </div>
          <div className="kpi-val">{stats.incidents}</div>
          <div className="kpi-trend">
            <span>Pending Investigations</span>
          </div>
        </div>

        {/* Card 4: Risk Level */}
        <div className={`kpi-card kpi-risk ${stats.riskLevel === "HIGH" || stats.riskLevel === "CRITICAL" ? "risk-high" : ""}`}>
          <div className="kpi-card-header">
            <span className="kpi-label">AI Fire Risk</span>
            <div className="kpi-icon-wrap">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ fontSize: "1.8rem", color: stats.riskLevel === "CRITICAL" || stats.riskLevel === "HIGH" ? "var(--danger)" : stats.riskLevel === "MEDIUM" ? "var(--warning)" : "var(--success)" }}>
            {stats.riskLevel}
          </div>
          <div className="kpi-trend">
            <span>Dynamic AI Risk Index</span>
          </div>
        </div>

        {/* Card 5: System Health */}
        <div className="kpi-card kpi-health">
          <div className="kpi-card-header">
            <span className="kpi-label">System Health</span>
            <div className="kpi-icon-wrap">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: stats.systemHealth > 80 ? "var(--success)" : "var(--warning)" }}>
            {stats.systemHealth}%
          </div>
          <div className="kpi-trend">
            <span>Operational efficiency</span>
          </div>
        </div>
      </div>

      {/* Two-Column Centerpieces */}
      <div className="dashboard-two-col">
        {/* Left Card: Preventative Actions */}
        <div className="glass-panel safety-score-card">
          <div className="score-suggestions">
            <div className="suggestions-title">Preventative Actions</div>
            {getSuggestions().map((sug, idx) => (
              <div key={idx} className="suggestion-item">
                <AlertTriangle size={14} />
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Recent Alarm Broadcast Feed */}
        <div className="glass-panel feed-panel">
          <div className="feed-header">
            <div className="feed-title">
              <BellRing size={18} style={{ color: "var(--primary)" }} />
              <span>Real-Time Broadcast Feed</span>
            </div>
            <button
              className="saas-btn saas-btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "8px" }}
              onClick={() => setPage("alarm")}
            >
              Logs View <ChevronRight size={14} />
            </button>
          </div>

          <div className="feed-list">
            {recentAlarms.length > 0 ? (
              recentAlarms.map((item) => (
                <div key={item.id} className="feed-item">
                  <div className="feed-item-left">
                    <div className={`feed-badge-icon ${item.status === "ACTIVE" ? "active" : "resolved"}`}>
                      <Flame size={16} />
                    </div>
                    <div className="feed-info">
                      <span className="feed-message">
                        {item.status === "ACTIVE" ? "Active Alarm" : "Resolved"} at {item.sensorLocation}
                      </span>
                      <span className="feed-time">Sensor #{item.sensorId || "N/A"} • {item.alarmTime}</span>
                    </div>
                  </div>
                  <div className="feed-item-right">
                    <span className={`saas-badge ${item.severity === "HIGH" ? "badge-danger" : item.severity === "MEDIUM" ? "badge-warning" : "badge-success"}`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0", fontSize: "0.9rem" }}>
                <Info size={28} style={{ margin: "0 auto 10px", display: "block", color: "var(--text-muted)", opacity: 0.5 }} />
                No alarm activity recorded on this server.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;