import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";
import SensorManagement from "./SensorManagement";
import FireDetection from "./FireDetection";
import AlarmMonitoring from "./AlarmMonitoring";
import IncidentReports from "./IncidentReports";
import Analytics from "./Analytics";
import UserManagement from "./UserManagement";
import AIAssistant from "./AIAssistant";
import EmergencyCenter from "./EmergencyCenter";
import SettingsPage from "./SettingsPage";
import WarningLogs from "./WarningLogs";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "ADMIN") {
      navigate("/user");
    }

    // Check if we are running in sandbox demo mode
    const sandbox = localStorage.getItem("sandboxMode") === "true";
    setIsSandbox(sandbox);
  }, [navigate]);

  const getPageInfo = () => {
    switch (page) {
      case "sensor":
        return { title: "Sensor Fleet Management", subtitle: "Register, monitor, and configure system sensor hardware" };
      case "fire":
        return { title: "Fire Control Center", subtitle: "Simulate and trigger real-time hazard notifications" };
      case "alarm":
        return { title: "Alarm Monitor Logs", subtitle: "Active alarm broadcasts and sensor alert tracking" };
      case "incident":
        return { title: "Incident Log Reports", subtitle: "Historical record of emergencies and automated AI narrations" };
      case "analytics":
        return { title: "Intelligence & Analytics", subtitle: "System health metrics and statistical heatmaps" };
      case "warning-logs":
        return { title: "Warning Logs & Telemetry Records", subtitle: "Audit historical warnings, simulated fire telemetry, and evacuation alerts" };
      case "users":
        return { title: "User Directory Management", subtitle: "Manage system access privileges and user roles" };
      case "ai-assistant":
        return { title: "FireGuard AI Assistant", subtitle: "AI risk advisor, device prognosis, and emergency action engine" };
      case "emergency-center":
        return { title: "AI Digital Twin & Emergency Center", subtitle: "Building layouts, hazard spreads, and evacuation escapes" };
      case "settings":
        return { title: "System Preferences", subtitle: "Manage Gemini API integrations, risk scoring, and mock sensors" };
      default:
        return { title: "Command Dashboard", subtitle: "Real-time safety overview, sensor diagnostics, and preventative scores" };
    }
  };

  const renderPage = () => {
    switch (page) {
      case "sensor":
        return <SensorManagement />;
      case "fire":
        return <FireDetection />;
      case "alarm":
        return <AlarmMonitoring />;
      case "incident":
        return <IncidentReports />;
      case "analytics":
        return <Analytics />;
      case "warning-logs":
        return <WarningLogs />;
      case "users":
        return <UserManagement />;
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
    <div className="admin-container">
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

export default AdminDashboard;