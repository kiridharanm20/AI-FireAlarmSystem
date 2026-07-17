import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  X,
  Clock,
  MapPin,
  Activity,
  ShieldAlert,
  FileText,
  RefreshCw
} from "lucide-react";
import "./WarningLogs.css";

function WarningLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/api/warning-logs");
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to query warning telemetry logs:", error);
      setLogs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearResolved = async () => {
    if (!window.confirm("Are you sure you want to clear all resolved/closed warning logs permanently?")) return;

    try {
      await axios.delete("http://localhost:8081/api/warning-logs/resolved");
      loadLogs();
    } catch (error) {
      console.error("Failed to clear resolved logs from backend:", error);
      alert("Failed to clear resolved telemetry logs. Database is unreachable.");
    }
  };

  const exportCSV = () => {
    const headers = ["Log ID", "Incident ID", "Sensor ID", "Date & Time", "Location", "Severity", "Alarm Status", "Incident Status", "Warning Message", "Action Taken", "Triggered By"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.incidentId || "N/A",
      log.sensorId || "N/A",
      new Date(log.createdAt).toLocaleString(),
      log.location,
      log.severity,
      log.alarmStatus,
      log.incidentStatus,
      log.warningMessage,
      log.actionTaken || "N/A",
      log.createdBy || "System"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warning_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Active Warning Logs & Records Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
            h1 { color: #dc2626; font-size: 24px; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f6; color: #111827; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .badge-danger { background-color: #fee2e2; color: #991b1b; }
            .badge-warning { background-color: #fef3c7; color: #92400e; }
            .badge-success { background-color: #d1fae5; color: #065f46; }
            .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>FireGuard AI - Warning Logs & Telemetry Records Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()} | Total Filtered Logs: ${filteredLogs.length}</div>
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Alarm Status</th>
                <th>Incident Status</th>
                <th>Warning Message</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs.map(log => `
                <tr>
                  <td><b>LOG-${log.id}</b></td>
                  <td>${new Date(log.createdAt).toLocaleString()}</td>
                  <td>${log.location}</td>
                  <td><span class="badge ${log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'badge-danger' : log.severity === 'MEDIUM' ? 'badge-warning' : 'badge-success'}">${log.severity}</span></td>
                  <td><span class="badge ${log.alarmStatus === 'ACTIVE' ? 'badge-danger' : 'badge-success'}">${log.alarmStatus}</span></td>
                  <td><span class="badge ${log.incidentStatus === 'OPEN' ? 'badge-danger' : 'badge-success'}">${log.incidentStatus}</span></td>
                  <td>${log.warningMessage}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setShowModal(false);
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const locationStr = log.location ? String(log.location).toLowerCase() : "";
    const messageStr = log.warningMessage ? String(log.warningMessage).toLowerCase() : "";

    const matchesSearch = locationStr.includes(searchTerm.toLowerCase()) ||
      messageStr.includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === "ALL" || log.severity === filterSeverity;

    const matchesStatus = filterStatus === "ALL" || 
      (filterStatus === "ACTIVE" && (log.alarmStatus === "ACTIVE" || log.incidentStatus === "OPEN")) ||
      (filterStatus === "RESOLVED" && (log.alarmStatus === "RESOLVED" || log.alarmStatus === "RESET" || log.alarmStatus === "RESOLVED") && log.incidentStatus === "CLOSED");

    let matchesDate = true;
    if (filterDate) {
      const logDateString = log.createdAt ? new Date(log.createdAt).toISOString().split('T')[0] : "";
      matchesDate = logDateString === filterDate;
    }

    return matchesSearch && matchesSeverity && matchesStatus && matchesDate;
  });

  return (
    <div className="warning-logs-container animate-fade-in">
      <div className="warning-logs-actions-bar">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by location or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <Filter size={14} className="filter-icon" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="saas-select"
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="filter-item">
            <Filter size={14} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="saas-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Warnings</option>
              <option value="RESOLVED">Resolved Warnings</option>
            </select>
          </div>

          <div className="filter-item">
            <Clock size={14} className="filter-icon" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="saas-date-input"
            />
          </div>
        </div>

        <div className="action-buttons-group">
          {isAdmin && (
            <button
              onClick={handleClearResolved}
              className="saas-btn saas-btn-danger"
              style={{ gap: "6px" }}
            >
              <Trash2 size={14} /> Clear Resolved
            </button>
          )}

          <button
            onClick={exportCSV}
            className="saas-btn saas-btn-secondary"
            style={{ gap: "6px" }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="saas-btn saas-btn-secondary"
            style={{ gap: "6px" }}
          >
            <FileText size={14} /> Export PDF
          </button>

          <button
            onClick={() => loadLogs(isSandbox)}
            className="saas-btn saas-btn-primary"
            style={{ width: "40px", height: "40px", padding: 0, justifyContent: "center" }}
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="saas-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="saas-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Date & Time</th>
              <th>Sensor ID</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Alarm Status</th>
              <th>Incident Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  <div className="animate-spin" style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%" }} />
                  <span style={{ marginLeft: "10px", color: "var(--text-muted)" }}>Fetching warning telemetry logs...</span>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const isWarningActive = log.alarmStatus === "ACTIVE" || log.incidentStatus === "OPEN";
                return (
                  <tr key={log.id} className={isWarningActive ? "active-row" : ""}>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--text)" }}>LOG-{log.id}</span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="sensor-id-tag">
                        {log.sensorId ? `S-${log.sensorId}` : "Manual Trigger"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                        {log.location}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${
                        log.severity === "HIGH" || log.severity === "CRITICAL" ? "badge-danger" : 
                        log.severity === "MEDIUM" ? "badge-warning" : "badge-success"
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${log.alarmStatus === "ACTIVE" ? "badge-danger animate-pulse" : "badge-success"}`}>
                        {log.alarmStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${log.incidentStatus === "OPEN" ? "badge-danger" : "badge-success"}`}>
                        {log.incidentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenDetails(log)}
                        className="saas-btn saas-btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", gap: "6px", display: "inline-flex" }}
                      >
                        <Eye size={12} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <ShieldAlert size={24} style={{ margin: "0 auto 10px", display: "block" }} />
                  No warning records found matching current query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedLog && (
        <div className="saas-modal-backdrop" onClick={handleCloseDetails}>
          <div className="saas-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="saas-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={18} style={{ color: "var(--danger)" }} />
                <h3>Warning Log Details: LOG-{selectedLog.id}</h3>
              </div>
              <button onClick={handleCloseDetails} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="saas-modal-body">
              <div className="details-grid">
                <div className="details-card">
                  <h4>Telemetry Overview</h4>
                  <p><strong>Log ID:</strong> LOG-{selectedLog.id}</p>
                  <p><strong>Incident ID:</strong> {selectedLog.incidentId || "N/A"}</p>
                  <p><strong>Sensor Source ID:</strong> {selectedLog.sensorId ? `S-${selectedLog.sensorId}` : "N/A"}</p>
                  <p><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</p>
                  <p><strong>Triggered By:</strong> {selectedLog.createdBy || "System"}</p>
                </div>
                <div className="details-card">
                  <h4>Diagnostic State</h4>
                  <p><strong>Location:</strong> {selectedLog.location}</p>
                  <p><strong>Severity:</strong> <span className={`saas-badge ${selectedLog.severity === 'HIGH' || selectedLog.severity === 'CRITICAL' ? 'badge-danger' : selectedLog.severity === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>{selectedLog.severity}</span></p>
                  <p><strong>Alarm Status:</strong> <span className={`saas-badge ${selectedLog.alarmStatus === 'ACTIVE' ? 'badge-danger' : 'badge-success'}`}>{selectedLog.alarmStatus}</span></p>
                  <p><strong>Incident Status:</strong> <span className={`saas-badge ${selectedLog.incidentStatus === 'OPEN' ? 'badge-danger' : 'badge-success'}`}>{selectedLog.incidentStatus}</span></p>
                </div>
              </div>
              <div className="details-full-width">
                <h4>Warning Message Summary</h4>
                <div className="message-summary-box">
                  {selectedLog.warningMessage}
                </div>
              </div>
              <div className="details-full-width" style={{ marginTop: "15px" }}>
                <h4>Emergency Actions Taken</h4>
                <div className="action-taken-box">
                  {selectedLog.actionTaken || "No automated/administrative action details available."}
                </div>
              </div>
            </div>
            <div className="saas-modal-footer">
              <button onClick={handleCloseDetails} className="saas-btn saas-btn-primary">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarningLogs;
