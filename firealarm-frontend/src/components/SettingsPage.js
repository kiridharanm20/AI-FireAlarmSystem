import React, { useEffect, useState } from "react";
import {
  Settings,
  Key,
  Database,
  Cpu,
  Trash2,
  Users,
  Sliders,
  CheckCircle,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { initSimulatorData } from "./SimulatorState";

function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("gemini-1.5-flash");
  const [sandbox, setSandbox] = useState(false);
  const [communityShare, setCommunityShare] = useState(true);
  const [tempThreshold, setTempThreshold] = useState(70);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";

  useEffect(() => {
    setApiKey(localStorage.getItem("gemini_api_key") || "");
    setModel(localStorage.getItem("gemini_model") || "gemini-1.5-flash");
    setSandbox(localStorage.getItem("sandboxMode") === "true");
    setCommunityShare(localStorage.getItem("community_share") !== "false");
    setTempThreshold(Number(localStorage.getItem("temp_threshold") || "70"));
  }, []);

  const saveSettings = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Access Denied: System preferences can only be modified by administrators.");
      return;
    }

    localStorage.setItem("gemini_api_key", apiKey.trim());
    localStorage.setItem("gemini_model", model);
    localStorage.setItem("sandboxMode", sandbox ? "true" : "false");
    localStorage.setItem("community_share", communityShare ? "true" : "false");
    localStorage.setItem("temp_threshold", tempThreshold.toString());

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      // Reload page to re-trigger state changes
      window.location.reload();
    }, 1200);
  };

  const clearSandboxData = () => {
    if (!isAdmin) {
      alert("Access Denied: Re-seeding sandbox database requires administrator clearance.");
      return;
    }
    if (window.confirm("Are you sure you want to clear and re-initialize the offline sandbox database? This resets all sensor logs, alarms, and incidents to defaults.")) {
      initSimulatorData(true);
      alert("Offline database reset successfully!");
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
      
      {/* Settings form */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "25px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} style={{ color: "var(--primary)" }} />
          System Preferences
        </h2>

        <form onSubmit={saveSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* API Key */}
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Key size={14} /> Google Gemini API Key</span>
            </label>
            <input
              type={showKey ? "text" : "password"}
              className="saas-input"
              placeholder="AI features will fall back to simulation if left blank"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ marginBottom: 0, paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ position: "absolute", right: 14, top: 32, background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Model select */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Cpu size={14} /> Gemini Model Endpoint</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="saas-select"
              style={{ marginBottom: 0 }}
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - High Speed)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Experimental)</option>
            </select>
          </div>

          {/* Connection Mode checkbox */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Database size={14} /> Operational Mode</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(26, 6, 6, 0.5)", border: "1px solid var(--card-border)", padding: "14px", borderRadius: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={sandbox}
                  onChange={(e) => setSandbox(e.target.checked)}
                />
                Force Offline Sandbox Mode
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "26px" }}>
                Forces system to read/write state from browser local storage rather than calling Spring Boot backend. Ideal for local testing and offline demos.
              </span>
            </div>
          </div>

          {/* Heat threshold slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)" }}>Thermal Alarm Threshold</span>
              <span style={{ fontWeight: 600, color: "var(--primary)" }}>{tempThreshold}°C</span>
            </div>
            <input
              type="range"
              min="50"
              max="110"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--primary)",
                background: "rgba(255,255,255,0.05)",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer"
              }}
            />
          </div>

          <button type="submit" className="saas-btn saas-btn-primary" style={{ padding: "12px", width: "100%", marginTop: "10px", opacity: isAdmin ? 1 : 0.6 }} disabled={!isAdmin}>
            {saveSuccess ? <><CheckCircle size={16} /> Preferences Applied!</> : isAdmin ? "Save Preferences" : "Save Preferences (Restricted)"}
          </button>
        </form>
      </div>

      {/* Auxiliary settings */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Community intelligence config */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} style={{ color: "var(--accent)" }} />
            Community Risk Intelligence
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "15px", lineHeight: "1.5" }}>
            Participate in collaborative threat learning. When enabled, anonymized telemetry profiles are analyzed collectively to identify recurring sensor failure patterns across nearby buildings.
          </p>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              className="checkbox-custom"
              checked={communityShare}
              onChange={(e) => setCommunityShare(e.target.checked)}
            />
            Share sensor telemetry with peer systems
          </label>
        </div>

        {/* Database tools */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Database size={16} style={{ color: "var(--warning)" }} />
            Sandbox Developer Tools
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.5" }}>
            Clean local storage keys and trigger fresh mock databases to clear active alerts or restore sensor rosters.
          </p>

          <button
            onClick={clearSandboxData}
            className="saas-btn saas-btn-danger"
            style={{ width: "100%", fontSize: "0.85rem", gap: "8px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.25)", opacity: isAdmin ? 1 : 0.6 }}
            disabled={!isAdmin}
          >
            <Trash2 size={14} /> Clear & Re-Seed Database {!isAdmin && "(Restricted)"}
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default SettingsPage;
