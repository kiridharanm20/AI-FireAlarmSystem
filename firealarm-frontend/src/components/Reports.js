import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, Cpu, Bell, Flame } from "lucide-react";

function Reports() {
  const [report, setReport] = useState({ totalSensors: 0, totalAlarms: 0, totalIncidents: 0 });
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const sandbox = localStorage.getItem("sandboxMode") === "true";
    setIsSandbox(sandbox);
    loadReport(sandbox);
  }, []);

  const loadReport = async (sandboxActive) => {
    if (sandboxActive) {
      setReport({ totalSensors: 12, totalAlarms: 4, totalIncidents: 3 });
    } else {
      try {
        const response = await axios.get("http://localhost:8081/api/reports/summary");
        setReport(response.data);
      } catch (error) {
        console.error("Backend offline, counting local simulator data");
        setIsSandbox(true);
        localStorage.setItem("sandboxMode", "true");
        setReport({ totalSensors: 12, totalAlarms: 4, totalIncidents: 3 });
      }
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Premium PDF styling
    doc.setFillColor(15, 23, 42); // slate bg header block
    doc.rect(0, 0, 210, 40, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 77, 77); // Red
    doc.text("FIREGUARD AI", 15, 25);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // muted slate
    doc.text("SYSTEM STATUS SUMMARY REPORT", 15, 32);
    doc.text(`DATE GENERATED: ${new Date().toLocaleString()}`, 120, 25);

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("Fleet Operational Metrics Summary", 15, 55);

    autoTable(doc, {
      startY: 62,
      head: [["Metric Category", "Log Details Value"]],
      body: [
        ["Total Registered Sensors", String(report.totalSensors)],
        ["Total Active/Triggered Alarms", String(report.totalAlarms)],
        ["Total Logged Fire Incidents", String(report.totalIncidents)],
      ],
      headStyles: { fillColor: [30, 41, 59] },
      theme: "striped"
    });

    // Footer signature
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 260, 195, 260);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Approved by: FireGuard AI System Diagnostics Authority", 15, 268);
    doc.text("Page 1 of 1", 175, 268);

    doc.save("FireAlarmSystemReport.pdf");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      <div className="glass-panel" style={{ padding: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
            <FileText size={18} style={{ color: "var(--primary)" }} />
            System Fleet Reports
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Generate and export comprehensive hardware status and hazard history summaries as PDFs.
          </p>
        </div>
        <button
          onClick={downloadPDF}
          className="saas-btn saas-btn-danger animate-pulse"
          style={{
            padding: "12px 24px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, var(--danger) 0%, var(--primary) 100%)",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
            border: "1px solid rgba(255, 77, 77, 0.2)"
          }}
        >
          <Download size={16} /> Export PDF Report
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        
        {/* Total Sensors */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <Cpu size={24} style={{ alignSelf: "center" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{report.totalSensors}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Total Sensors</p>
          </div>
        </div>

        {/* Total Alarms */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning)" }}>
            <Bell size={24} style={{ alignSelf: "center" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{report.totalAlarms}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Total Alarms</p>
          </div>
        </div>

        {/* Total Incidents */}
        <div className="glass-panel" style={{ padding: "25px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)" }}>
            <Flame size={24} style={{ alignSelf: "center" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{report.totalIncidents}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Total Incidents</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Reports;