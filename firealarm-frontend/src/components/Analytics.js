import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  AlertTriangle,
  FileText,
  Layers,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  MapPin
} from "lucide-react";
import "./Analytics.css";

function Analytics() {
  const [isSandbox, setIsSandbox] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    totalIncidents: 0,
    mostAffectedLocation: "N/A",
    mostCommonSeverity: "N/A",
    activeAlarms: 0,
    closedIncidents: 0,
    insights: []
  });
  
  const [severityData, setSeverityData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);

  const SEVERITY_COLORS = {
    LOW: "var(--success)",
    MEDIUM: "var(--warning)",
    HIGH: "var(--danger)",
    CRITICAL: "#ef4444"
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, sevRes, locRes, trendsRes] = await Promise.all([
        axios.get("http://localhost:8081/api/analytics/dashboard"),
        axios.get("http://localhost:8081/api/analytics/severity-distribution"),
        axios.get("http://localhost:8081/api/analytics/incidents-by-location"),
        axios.get("http://localhost:8081/api/analytics/monthly-trends")
      ]);

      setDashboardStats(statsRes.data);
      setSeverityData(sevRes.data);
      setLocationData(locRes.data);
      setTrendsData(trendsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Backend error loading charts analytics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const exportPDF = () => {
    window.print();
  };

  const isSeverityEmpty = severityData.length === 0 || severityData.every(d => d.value === 0);
  const isLocationEmpty = locationData.length === 0 || locationData.every(d => d.count === 0);
  const isTrendsEmpty = trendsData.length === 0 || trendsData.every(d => d.incidents === 0);

  return (
    <div className="analytics-module-container animate-fade-in">
      
      <div className="analytics-header-controls">
        <div className="refresh-status">
          <RefreshCw size={14} className={loading ? "animate-spin text-primary" : "text-success"} />
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {loading ? "Synchronizing database metrics..." : "Metrics linked to live DB. Auto-refreshing in 5s."}
          </span>
        </div>
        
        {/*<button onClick={exportPDF} className="saas-btn saas-btn-secondary" style={{ gap: "8px" }}>
          <FileText size={16} /> Export PDF
        </button>*/}
      </div>

      {/* Recharts Graphical Panels */}
      <div className="analytics-charts-row">
        
        {/* Pie Chart: Severity */}
        <div className="glass-panel chart-panel">
          <h3 className="chart-title">Incident Severity Distribution</h3>
          <div className="chart-container">
            {isSeverityEmpty ? (
              <div className="no-data-placeholder">
                <AlertTriangle size={24} style={{ color: "var(--text-muted)" }} />
                <span>No Data Available</span>
              </div>
            ) : (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || "var(--accent)"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-center-value">
                  <h4>{severityData.reduce((a, b) => a + (b.value || 0), 0)}</h4>
                  <span>Logs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Location */}
        <div className="glass-panel chart-panel" style={{ gridColumn: "span 2" }}>
          <h3 className="chart-title">Fire Incidents by Location</h3>
          <div className="chart-container">
            {isLocationEmpty ? (
              <div className="no-data-placeholder">
                <AlertTriangle size={24} style={{ color: "var(--text-muted)" }} />
                <span>No Data Available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                  <XAxis dataKey="location" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar name="Incident count" dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-charts-row-full">
        {/* Line Chart: Monthly Trend */}
        {/*<div className="glass-panel chart-panel">
          <h3 className="chart-title">Monthly Incident Trend</h3>
          <div className="chart-container">
            {isTrendsEmpty ? (
              <div className="no-data-placeholder">
                <AlertTriangle size={24} style={{ color: "var(--text-muted)" }} />
                <span>No Data Available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Line name="Incidents" type="monotone" dataKey="incidents" stroke="var(--secondary)" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>*/}
      </div>

      {/* KPI Stats Cards Block */}
      <h3 className="chart-title" style={{ marginTop: "15px", marginBottom: "5px" }}>Analytical Summary</h3>
      <div className="kpi-stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue">
            <Layers size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Incidents</span>
            <h3 className="kpi-value">{dashboardStats.totalIncidents}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper orange">
            <MapPin size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Most Affected Location</span>
            <h3 className="kpi-value" style={{ fontSize: "1rem" }}>{dashboardStats.mostAffectedLocation}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper green">
            <ShieldAlert size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Most Common Severity</span>
            <h3 className="kpi-value">{dashboardStats.mostCommonSeverity}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper red">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Alarms</span>
            <h3 className="kpi-value">{dashboardStats.activeAlarms}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper green">
            <CheckCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Closed Incidents</span>
            <h3 className="kpi-value">{dashboardStats.closedIncidents}</h3>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="glass-panel intelligence-panel" style={{ padding: "20px 24px" }}>
        <h3 className="intelligence-title">
          <ShieldAlert size={18} className="text-danger" />
          Safety Assessment & Insights
        </h3>
        <div className="intelligence-body">
          {dashboardStats.insights.map((insight, index) => (
            <div key={index} className="insight-item-row" style={{ padding: "10px 15px" }}>
              <div className="insight-indicator-dot" />
              <span className="insight-text" style={{ fontSize: "0.9rem" }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Analytics;