import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";
import SensorManagement from "./SensorManagement";
import AlarmMonitoring from "./AlarmMonitoring";
import IncidentReports from "./IncidentReports";
import Analytics from "./Analytics";
import AIAssistant from "./AIAssistant";
import EmergencyCenter from "./EmergencyCenter";
import SettingsPage from "./SettingsPage";
import WarningLogs from "./WarningLogs";
import "./AdminDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "USER") {
      navigate("/admin");
    }

    // Check if we are running in sandbox demo mode
    const sandbox = localStorage.getItem("sandboxMode") === "true";
    setIsSandbox(sandbox);
  }, [navigate]);

  const getPageInfo = () => {
    switch (page) {
      case "sensor":
        return { title: "Monitored Devices", subtitle: "Real-time list of building sensors and status indicators" };
      case "alarm":
        return { title: "Active Alarm Alerts", subtitle: "View building alarms and alert broadcasts" };
      case "incident":
        return { title: "Safety Incidents Log", subtitle: "Log of safety incidents and AI summaries" };
      case "analytics":
        return { title: "Analytics & Trends", subtitle: "Analytical trends and hazard severity ratios" };
      case "warning-logs":
        return { title: "Warning Logs & Telemetry Records", subtitle: "Audit historical warnings, simulated fire telemetry, and evacuation alerts" };
      case "ai-assistant":
        return { title: "FireGuard AI Assistant", subtitle: "Ask fire hazard questions, risk forecasting, or emergency guides" };
      case "emergency-center":
        return { title: "Evacuation Center", subtitle: "Interactive building layout, evacuation maps, and exit directions" };
      case "settings":
        return { title: "Account Preferences", subtitle: "Manage your local profile preferences and API configurations" };
      default:
        return { title: "User Command Dashboard", subtitle: "Real-time safety summary, safety score, and building status" };
    }
  };

  const renderPage = () => {
    switch (page) {
      case "sensor":
        return <SensorManagement />;
      case "alarm":
        return <AlarmMonitoring />;
      case "incident":
        return <IncidentReports />;
      case "analytics":
        return <Analytics />;
      case "warning-logs":
        return <WarningLogs />;
      case "ai-assistant":
        return <AIAssistant />;
      case "emergency-center":
        return <EmergencyCenter />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardHome setPage={setPage} />;
    }
  };

  const info = getPageInfo();

  return (
    <div className="user-container">
      <Sidebar currentPage={page} setPage={setPage} />

      <div className="content animate-fade-in">
        <div className="content-header">
          <div className="content-title-area">
            <h1 className="page-title">{info.title}</h1>
            <p className="page-subtitle">{info.subtitle}</p>
          </div>

          <div className={`system-status-indicator ${isSandbox ? "sandbox" : ""}`}>
            <span className="status-dot" />
            <span>
              {isSandbox
                ? "REAL-TIME MONITOR ACTIVE (ONLINE)"
                : "REAL-TIME MONITOR ACTIVE (ONLINE)"}
            </span>
          </div>
        </div>

        <div className="page-content-wrapper">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;