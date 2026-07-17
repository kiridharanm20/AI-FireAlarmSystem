import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Flame,
  AlertTriangle,
  Thermometer,
  Wind,
  ShieldAlert
} from "lucide-react";

function FireDetection() {
  const [sensors, setSensors] = useState([]);
  const [selectedSensorId, setSelectedSensorId] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [fireType, setFireType] = useState("Electrical Short Circuit");
  const [temperature, setTemperature] = useState(85);
  const [smokeLevel, setSmokeLevel] = useState(70);
  const [triggering, setTriggering] = useState(false);

  // Siren states synchronized with backend API
  const [sirenActive, setSirenActive] = useState(false);
  const [sirenMuted, setSirenMuted] = useState(false);
  const [activeAlarmsCount, setActiveAlarmsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSensors();
    loadActiveAlarmsCount();
    syncSirenState();

    // Dynamic real-time synchronization interval
    const pollInterval = setInterval(() => {
      loadActiveAlarmsCount();
      syncSirenState();
    }, 1500);

    return () => clearInterval(pollInterval);
  }, []);

  const syncSirenState = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/alarms/siren-status");
      setSirenActive(res.data.active === true);
      setSirenMuted(res.data.muted === true);
    } catch (err) {
      console.error("Failed to sync siren status:", err);
    }
  };

  const handleSirenControl = async (active, muted) => {
    try {
      const res = await axios.put("http://localhost:8081/api/alarms/siren-status", { active, muted });
      setSirenActive(res.data.active === true);
      setSirenMuted(res.data.muted === true);
    } catch (err) {
      console.error("Failed to update siren status on backend:", err);
    }
  };

  const loadActiveAlarmsCount = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/alarms");
      const active = res.data.filter(a => a.status === "ACTIVE").length;
      setActiveAlarmsCount(active);
    } catch (error) {
      console.error("Backend offline, failed to count active alarms");
    }
  };

  const loadSensors = async () => {
    try {
      setErrorMessage("");
      const res = await axios.get("http://localhost:8081/api/sensors");
      // Load only ACTIVE sensors for trigger list
      const activeSensors = res.data.filter(s => s.status === "ACTIVE");
      setSensors(activeSensors);
      if (activeSensors.length > 0) setSelectedSensorId(activeSensors[0].id.toString());
    } catch (error) {
      console.error("Backend connection failure");
      setErrorMessage("Database offline. Incident Simulation requires an active backend server connection.");
    }
  };

  const getThreatAssessment = () => {
    if (temperature > 100 || smokeLevel > 80 || severity === "CRITICAL" || severity === "HIGH") {
      return { level: "CRITICAL", color: "var(--danger)", time: "1-2 minutes", desc: "Extreme hazard threat. Fire propagation high. Evacuation priority high." };
    }
    if (temperature > 65 || smokeLevel > 45 || severity === "MEDIUM") {
      return { level: "WARNING", color: "var(--warning)", time: "4-6 minutes", desc: "Moderate hazard threat. Elevated heat detected. Ventilation recommended." };
    }
    return { level: "ELEVATED", color: "var(--accent)", time: "10+ minutes", desc: "Minor temperature excursion. Auto monitoring enabled." };
  };

  const detectFire = async () => {
    if (!selectedSensorId) {
      alert("Please select a sensor to trigger an alarm.");
      return;
    }

    setTriggering(true);
    const sensor = sensors.find(s => s.id.toString() === selectedSensorId.toString());
    const location = sensor ? sensor.location : "Unknown Location";

    try {
      await axios.post("http://localhost:8081/api/alarms", {
        sensorId: Number(selectedSensorId),
        sensorLocation: location,
        severity,
        status: "ACTIVE"
      });
      setTriggering(false);
      loadActiveAlarmsCount();
      alert("Fire Alarm Triggered Successfully on Spring Boot backend.");
    } catch (error) {
      setTriggering(false);
      alert("Failed to simulate fire incident. Connection to database refused.");
    }
  };

  const threat = getThreatAssessment();

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
      {errorMessage && (
        <div className="glass-panel" style={{ gridColumn: "span 2", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "16px", color: "#fca5a5" }}>
          <AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
          {errorMessage}
        </div>
      )}

      {/* Active Fire Broadcast Warning Signals banner */}
      {activeAlarmsCount > 0 && (
        <div className="glass-panel animate-pulse" style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          gridColumn: "span 2",
          marginBottom: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: sirenActive ? "var(--danger)" : "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: sirenActive ? "0 0 20px rgba(239, 68, 68, 0.6)" : "none"
            }}>
              <AlertTriangle size={22} className={sirenActive ? "animate-bounce" : ""} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                Active Fire Broadcast Warning Signals
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Siren Status: <span style={{ color: sirenActive ? "var(--danger)" : "var(--success)", fontWeight: "bold" }}>{sirenActive ? "ACTIVE" : "OFF"}</span> | 
                Broadcast Status: <span style={{ color: sirenActive ? "var(--danger)" : "var(--text-muted)", fontWeight: "bold" }}>{sirenActive ? "ACTIVE" : "INACTIVE"}</span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {!sirenActive ? (
              <button
                onClick={() => handleSirenControl(true, false)}
                className="saas-btn saas-btn-danger"
                style={{ fontSize: "0.85rem", padding: "10px 20px" }}
              >
                BROADCAST ACTIVE EMERGENCY SIREN
              </button>
            ) : (
              <>
                {/* Mute Button */}
                <button
                  onClick={() => handleSirenControl(true, true)}
                  className="saas-btn saas-btn-secondary"
                  disabled={sirenMuted}
                  style={{ fontSize: "0.85rem", padding: "10px 16px" }}
                >
                  Mute
                </button>

                {/* Unmute Button */}
                <button
                  onClick={() => handleSirenControl(true, false)}
                  className="saas-btn saas-btn-success"
                  disabled={!sirenMuted}
                  style={{ fontSize: "0.85rem", padding: "10px 16px" }}
                >
                  Unmute
                </button>

                {/* Stop Siren Button */}
                <button
                  onClick={() => handleSirenControl(false, false)}
                  className="saas-btn saas-btn-danger"
                  style={{ fontSize: "0.85rem", padding: "10px 16px" }}
                >
                  STOP SIREN
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Control panel card */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "25px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Flame size={18} style={{ color: "var(--primary)" }} />
          Incident Simulation Console
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Sensor node select */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Select Monitor Node</label>
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="saas-select"
              style={{ marginBottom: 0 }}
            >
              <option value="">-- Choose Active Sensor --</option>
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  S-{s.id} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            {/* Severity select */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Alert Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="saas-select"
                style={{ marginBottom: 0 }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            {/* Fire Classification select */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Hazard Category</label>
              <select
                value={fireType}
                onChange={(e) => setFireType(e.target.value)}
                className="saas-select"
                style={{ marginBottom: 0 }}
              >
                <option value="Electrical Short Circuit">Electrical Failure</option>
                <option value="Chemical Hazard Leakage">Chemical Fire</option>
                <option value="Thermal Overrun">Thermal / HVAC</option>
                <option value="Gas Accumulation">Gaseous Ignition</option>
              </select>
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: "flex", justify: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><Thermometer size={14} /> Simulated Temperature</span>
              <span style={{ fontWeight: 600, color: temperature > 75 ? "var(--danger)" : "var(--text)" }}>{temperature}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
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

          {/* Smoke Slider */}
          <div>
            <div style={{ display: "flex", justify: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><Wind size={14} /> Smoke Concentration</span>
              <span style={{ fontWeight: 600, color: smokeLevel > 60 ? "var(--secondary)" : "var(--text)" }}>{smokeLevel} ppm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={smokeLevel}
              onChange={(e) => setSmokeLevel(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--secondary)",
                background: "rgba(255,255,255,0.05)",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer"
              }}
            />
          </div>

          {/* Big Trigger Button */}
          <button
            onClick={detectFire}
            className="saas-btn saas-btn-danger"
            disabled={triggering}
            style={{
              marginTop: "15px",
              padding: "16px",
              fontWeight: 600,
              fontSize: "1rem",
              background: "linear-gradient(135deg, var(--danger) 0%, var(--primary) 100%)",
              boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 77, 77, 0.25)",
              animation: "pulseGlow 2s infinite"
            }}
          >
            <Flame size={20} className="animate-pulse" />
            {triggering ? "SIMULATING FIRE..." : "TRIGGER EMULATED FIRE ALARM"}
          </button>
        </div>
      </div>

      {/* Dynamic AI preview warning panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Threat Assessor panel */}
        <div className="glass-panel" style={{ padding: "30px", borderLeft: `5px solid ${threat.color}` }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={18} style={{ color: threat.color }} />
            Dynamic AI Threat Assessment
          </h3>
          
          <div style={{ display: "inline-block", background: `rgba(239, 68, 68, 0.1)`, padding: "4px 12px", borderRadius: "20px", border: `1px solid ${threat.color}`, color: threat.color, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "15px" }}>
            Threat: {threat.level}
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.6" }}>
            {threat.desc}
          </p>

          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "15px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Est. Flashover Time</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{threat.time}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Fuel Classification</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--secondary)" }}>Class C/A</span>
            </div>
          </div>
        </div>

        {/* Live spread details card */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={16} style={{ color: "var(--secondary)" }} />
            Autonomous System Interlock Preview
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justify: "space-between", color: "var(--text-muted)" }}>
              <span>HVAC Dampers Trigger:</span>
              <span style={{ color: severity === "HIGH" ? "var(--success)" : "var(--text)" }}>AUTO-CLOSE</span>
            </div>
            <div style={{ display: "flex", justify: "space-between", color: "var(--text-muted)" }}>
              <span>Aerosol Extinguishers:</span>
              <span style={{ color: severity === "HIGH" && temperature > 110 ? "var(--success)" : "var(--text-muted)" }}>ARMED</span>
            </div>
            <div style={{ display: "flex", justify: "space-between", color: "var(--text-muted)" }}>
              <span>LED Exit Routing Arrows:</span>
              <span style={{ color: "var(--success)" }}>AUTO-ON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FireDetection;