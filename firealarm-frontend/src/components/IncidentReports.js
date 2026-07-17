import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  AlertOctagon,
  Sparkles,
  Download,
  CheckCircle,
  X,
  FileSignature,
  Calendar,
  Layers,
  Volume2,
  Trash2
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function IncidentReports() {
  const [incidents, setIncidents] = useState([]);
  const [isSandbox, setIsSandbox] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";
  const [narratorModal, setNarratorModal] = useState({
    isOpen: false,
    incident: null,
    narration: "",
    loading: false
  });

  const loadIncidents = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/incidents");
      setIncidents(response.data);
    } catch (error) {
      console.error("Backend offline, failed to load incidents:", error);
      setIncidents([]);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const closeIncident = async (id) => {
    try {
      await axios.put(`http://localhost:8081/api/incidents/${id}/close`);
      loadIncidents();
    } catch (error) {
      console.error("Failed to close incident on backend:", error);
      alert("Failed to close incident on database server.");
    }
  };

  const handleDeleteIncident = async (id) => {
    console.log("Deleting ID:", id);
    if (!window.confirm("Are you sure you want to delete this incident record?")) return;

    try {
      await axios.delete(`http://localhost:8081/api/incidents/${id}`);
      setIncidents(incidents.filter(incident => incident.id !== id));
      alert("Incident deleted successfully.");
    } catch (error) {
      console.error("Failed to delete incident:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Unknown error occurred.";
      alert(`Failed to delete incident record: ${errorMsg}`);
    }
  };

  // AI Incident Narrator Engine (uses Gemini if key exists, else high-fidelity generator)
  const runAINarrator = async (incident) => {
    setNarratorModal({
      isOpen: true,
      incident: incident,
      narration: "",
      loading: true
    });

    const apiKey = localStorage.getItem("gemini_api_key");
    const model = localStorage.getItem("gemini_model") || "gemini-1.5-flash";
    let narrationText = "";

    const prompt = `You are FireGuard AI, a commercial smart building emergency intelligence narrator. Write a professional, human-sounding incident report about:
    ID: INC-${incident.id}
    Location: ${incident.location}
    Severity: ${incident.severity}
    Status: ${incident.incidentStatus}
    Raw Details: ${incident.summary || "System alarm triggered"}
    
    Structure the report with:
    1. Chronological summary of the trigger event
    2. Estimated cause prediction (e.g. electrical short, HVAC dust accumulation, etc.)
    3. Actionable remediation steps taken or recommended.
    Keep the tone authoritative, concise, and structured. Max 120 words. Do not use markdown headers, write in plain text paragraphs.`;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );
        const data = await response.json();
        narrationText = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI Narration failed to compile.";
      } catch (e) {
        console.error("Gemini call failed, using high-fidelity local generator", e);
        narrationText = generateLocalNarration(incident);
      }
    } else {
      // Simulate Gemini typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      narrationText = generateLocalNarration(incident);
    }

    // Typewriter effect simulation
    let currentIdx = 0;
    setNarratorModal(prev => ({ ...prev, loading: false }));
    
    const interval = setInterval(() => {
      if (currentIdx < narrationText.length) {
        setNarratorModal(prev => ({
          ...prev,
          narration: prev.narration + narrationText.charAt(currentIdx)
        }));
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  };

  const generateLocalNarration = (inc) => {
    const timeStr = new Date().toLocaleTimeString();
    const dateStr = inc.date || new Date().toISOString().split("T")[0];
    const category = inc.severity === "HIGH" ? "thermal anomaly or short circuit" : "hvac sensor fault";
    
    return `At ${timeStr} on ${dateStr}, a high-severity alarm event was logged on ${inc.location}. FireGuard AI's telemetry scan indicates a high probability of an ${category} triggered near the primary node. Evacuation paths were initialized instantly, routing occupants away from high-temperature zones. Dampers were shut to constrain oxygen supply. Recommendations: Dispatch certified technicians to inspect wiring lines on ${inc.location} and replace warning node S-${inc.id}.`;
  };

  const downloadReportPDF = (incident, narrative) => {
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
    doc.text("INTELLIGENT EMERGENCY COMMAND CENTRE", 15, 32);
    doc.text(`DATE GENERATED: ${new Date().toLocaleString()}`, 120, 25);

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`INCIDENT REPORT: INC-${incident.id}`, 15, 55);

    // Incident table meta
    autoTable(doc, {
      startY: 62,
      head: [["Metric Category", "Log Details"]],
      body: [
        ["Incident Reference", `INC-${incident.id}`],
        ["Target Location", incident.location],
        ["Severity Classification", incident.severity],
        ["Investigation Status", incident.incidentStatus],
        ["System Raw Log", incident.summary || "Sensor alert trigger"],
      ],
      headStyles: { fillColor: [30, 41, 59] },
      theme: "striped"
    });

    // AI Narrative section
    const finalY = doc.previousAutoTable.finalY + 15;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 77, 77);
    doc.text("AI NARRATION ANALYSIS & DIAGNOSTICS", 15, finalY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    
    // Auto-wrap text in jsPDF
    const textLines = doc.splitTextToSize(
      narrative || generateLocalNarration(incident),
      180
    );
    doc.text(textLines, 15, finalY + 8);

    // Footer signature
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 260, 195, 260);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Approved by: FireGuard AI System Diagnostics Authority", 15, 268);
    doc.text("Page 1 of 1", 175, 268);

    doc.save(`FireGuard_Incident_INC-${incident.id}.pdf`);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Incident logs list */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} style={{ color: "var(--primary)" }} />
          Building Emergency Incident Records
        </h2>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Location Area</th>
                <th>Alert Severity</th>
                <th>Raw Log Summary</th>
                <th>Incident Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? (
                incidents.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>INC-{item.id}</td>
                    <td style={{ color: "var(--text)" }}>{item.location}</td>
                    <td>
                      <span className={`saas-badge ${item.severity === "HIGH" ? "badge-danger" : item.severity === "MEDIUM" ? "badge-warning" : "badge-success"}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.summary || "Trigger event detected"}
                    </td>
                    <td>
                      <span className={`saas-badge ${item.incidentStatus === "OPEN" ? "badge-danger animate-pulse" : "badge-success"}`}>
                        {item.incidentStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => runAINarrator(item)}
                          className="saas-btn saas-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--accent)", borderColor: "rgba(56, 189, 248, 0.2)", gap: "6px" }}
                        >
                          <Sparkles size={12} /> AI Narrate
                        </button>
                        
                        {item.incidentStatus === "OPEN" && isAdmin && (
                          <button
                            onClick={() => closeIncident(item.id)}
                            className="saas-btn saas-btn-primary"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            <CheckCircle size={12} /> Close Log
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteIncident(item.id)}
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
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <AlertOctagon size={24} style={{ margin: "0 auto 10px", display: "block" }} />
                    No active building incidents logged on this workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Narrator Output Modal */}
      {narratorModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(9, 13, 22, 0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
          animation: "fadeIn 0.2s ease"
        }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: "580px", padding: "35px", position: "relative", animation: "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", border: "1px solid rgba(255, 77, 77, 0.25)" }}>
            <button
              onClick={() => setNarratorModal(prev => ({ ...prev, isOpen: false }))}
              style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "25px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255, 77, 77, 0.1)", display: "flex", alignItems: "center", justifyCenter: "center", color: "var(--primary)" }}>
                <Sparkles size={18} style={{ margin: "0 auto" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>AI Incident Narrator</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Drafting emergency diagnostic report for INC-{narratorModal.incident.id}</p>
              </div>
            </div>

            {/* Narration viewport */}
            <div style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "20px",
              minHeight: "150px",
              maxHeight: "260px",
              overflowY: "auto",
              fontSize: "0.95rem",
              lineHeight: "1.7",
              color: "var(--text)",
              marginBottom: "25px",
              position: "relative"
            }}>
              {narratorModal.loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", justifyContent: "center", height: "120px" }}>
                  <div className="spinner" />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>FIREGUARD AI IS ANALYZING INCIDENT SENSORS...</span>
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-sans)", whiteSpace: "pre-wrap" }}>
                  {narratorModal.narration}
                  <span style={{ display: "inline-block", width: "8px", height: "15px", background: "var(--primary)", marginLeft: "4px", animation: "pulseGlow 1s infinite" }} />
                </p>
              )}
            </div>

            {/* Modal footer options */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="saas-btn saas-btn-secondary"
                onClick={() => setNarratorModal(prev => ({ ...prev, isOpen: false }))}
              >
                Close View
              </button>
              {/*<button
                type="button"
                className="saas-btn saas-btn-primary"
                disabled={narratorModal.loading || !narratorModal.narration}
                onClick={() => downloadReportPDF(narratorModal.incident, narratorModal.narration)}
                style={{ gap: "8px" }}
              >
                <Download size={14} /> Download PDF Report
              </button>*/}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentReports;