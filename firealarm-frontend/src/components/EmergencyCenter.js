import React, { useEffect, useState } from "react";
import {
  Map,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Compass,
  ArrowRight,
  Zap,
  Info,
  Flame,
  CheckCircle
} from "lucide-react";
import axios from "axios";

function EmergencyCenter() {
  const [activeFloor, setActiveFloor] = useState(2);
  const [sensors, setSensors] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";
  
  // Spread Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [spreadRadius, setSpreadRadius] = useState(0);
  const [spreadTime, setSpreadTime] = useState(0); // in seconds

  useEffect(() => {
    loadLiveState();
    
    // Refresh state every 3 seconds to sync with mock fire triggers
    const interval = setInterval(loadLiveState, 3000);
    return () => clearInterval(interval);
  }, []);

  // Spread simulation timer loop
  useEffect(() => {
    let timer;
    if (isSimulating) {
      timer = setInterval(() => {
        setSpreadRadius(prev => Math.min(100, prev + 2.5));
        setSpreadTime(prev => prev + 5);
      }, 500);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  const loadLiveState = async () => {
    try {
      const sensRes = await axios.get("http://localhost:8081/api/sensors");
      setSensors(sensRes.data);

      const alarmRes = await axios.get("http://localhost:8081/api/alarms");
      setAlarms(alarmRes.data);
    } catch (err) {
      console.error("Failed to load emergency center telemetry:", err);
    }
  };

  const getActiveAlarmOnFloor = () => {
    // Check if there is an active alarm on the current floor
    return alarms.find(a => a.status === "ACTIVE" && a.sensorLocation && a.sensorLocation.includes(`Floor ${activeFloor}`));
  };

  const toggleSimulation = () => {
    if (!getActiveAlarmOnFloor()) {
      alert(`No active alarms detected on Floor ${activeFloor} to run a spread simulation. Try triggering a fire alarm in the Fire Detection page first!`);
      return;
    }
    setIsSimulating(!isSimulating);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSpreadRadius(0);
    setSpreadTime(0);
  };

  // Get coordinates for sensors on the SVG maps
  // Mapping floor layouts mathematically
  const getSensorCoords = (sensorId) => {
    const coords = {
      101: { x: 120, y: 150 }, // Floor 1 Lobby
      102: { x: 280, y: 110 }, // Floor 2 Server
      103: { x: 220, y: 140 }, // Floor 3 Cafeteria
      104: { x: 380, y: 160 }, // Floor 1 East Parking
      105: { x: 140, y: 120 }  // Floor 2 Office A
    };
    return coords[sensorId] || { x: 200, y: 100 };
  };

  const currentFloorSensors = sensors.filter(s => {
    if (activeFloor === 1) return s.location.includes("Floor 1");
    if (activeFloor === 2) return s.location.includes("Floor 2");
    return s.location.includes("Floor 3");
  });

  const activeAlarm = getActiveAlarmOnFloor();

  // Determine evacuation recommendation
  const getEvacuationInstructions = () => {
    if (activeAlarm) {
      if (activeAlarm.sensorLocation && activeAlarm.sensorLocation.includes("Server Room")) {
        return {
          priority: "CRITICAL (LEVEL 1)",
          route: "Evacuate Floor 2 immediately. Route occupants West through Office corridor directly to Stairwell A. Avoid elevator shaft.",
          exit: "Stairwell A (West Door)",
          spreadSpeed: "1.8 meters/minute",
          estSpreadTime: "2.8 minutes to corridor breach"
        };
      }
      return {
        priority: "IMMEDIATE (LEVEL 2)",
        route: "Evacuate active zones. Proceed through central corridor to East emergency fire doors.",
        exit: "East Fire Door B",
        spreadSpeed: "1.2 meters/minute",
        estSpreadTime: "4.5 minutes to corridor breach"
      };
    }
    return {
      priority: "NORMAL",
      route: "All floors reporting clear. Exit paths fully available. Standard paths through East and West stairwells active.",
      exit: "All Exit Doors (Main Lobby / West Stairs)",
      spreadSpeed: "N/A",
      estSpreadTime: "N/A"
    };
  };

  const evac = getEvacuationInstructions();

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1.9fr 1.1fr", gap: "25px" }}>
      
      {/* Interactive Blueprint Map */}
      <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column" }}>
        
        {/* Floor selectors */}
        <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Map size={18} style={{ color: "var(--primary)" }} />
            AI Digital Twin Building Map
          </h2>
          
          <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: "3px", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
            {[3, 2, 1].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setActiveFloor(f);
                  resetSimulation();
                }}
                className="saas-btn"
                style={{
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  borderRadius: "8px",
                  background: activeFloor === f ? "rgba(255, 77, 77, 0.15)" : "transparent",
                  color: activeFloor === f ? "#fff" : "var(--text-muted)",
                  border: activeFloor === f ? "1px solid rgba(255, 77, 77, 0.25)" : "none",
                  fontWeight: 600
                }}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic SVG Blueprint */}
        <div style={{
          background: "rgba(9, 13, 22, 0.4)",
          border: "1px solid var(--card-border)",
          borderRadius: "14px",
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
        }}>
          
          <svg width="100%" height="100%" viewBox="0 0 500 300" style={{ maxWidth: "460px" }}>
            {/* Grid background lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Floor exterior boundary */}
            <rect x="30" y="30" width="440" height="240" rx="14" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="2.5" strokeDasharray="6 3" />

            {/* Inner floor walls / offices */}
            {activeFloor === 1 && (
              <>
                {/* Lobby area */}
                <line x1="180" y1="30" x2="180" y2="270" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="70" y="70" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">MAIN RECEPTION LOBBY</text>
                
                {/* East corridor parking split */}
                <line x1="180" y1="180" x2="470" y2="180" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="240" y="230" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">EAST PARKING GARAGE</text>
                <text x="240" y="100" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">OFFICE UNIT B</text>

                {/* Exits */}
                <rect x="30" y="130" width="4" height="40" fill="var(--success)" />
                <text x="40" y="154" fill="var(--success)" fontSize="8" fontWeight="bold">EXIT A</text>
                
                <rect x="466" y="200" width="4" height="40" fill="var(--success)" />
                <text x="420" y="224" fill="var(--success)" fontSize="8" fontWeight="bold">EXIT B</text>
              </>
            )}

            {activeFloor === 2 && (
              <>
                {/* Server Room partition */}
                <rect x="220" y="30" width="140" height="120" rx="8" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="235" y="65" fill="rgba(255,255,255,0.25)" fontSize="9" fontWeight="bold">SERVER ROOM</text>
                <text x="248" y="80" fill="rgba(255,255,255,0.2)" fontSize="7">RACKS A1-D4</text>

                {/* Office space partitions */}
                <line x1="220" y1="150" x2="220" y2="270" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <line x1="30" y1="170" x2="220" y2="170" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="50" y="80" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">OFFICE SUITE A</text>
                <text x="50" y="220" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">CORRIDOR WEST</text>
                <text x="280" y="210" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">EXECUTIVE SUITE</text>

                {/* Stairwell exits */}
                <rect x="30" y="110" width="4" height="30" fill="var(--success)" />
                <text x="40" y="128" fill="var(--success)" fontSize="8" fontWeight="bold">STAIRWELL A</text>

                <rect x="466" y="110" width="4" height="30" fill="var(--success)" />
                <text x="408" y="128" fill="var(--success)" fontSize="8" fontWeight="bold">STAIRWELL B</text>
              </>
            )}

            {activeFloor === 3 && (
              <>
                {/* Cafeteria split */}
                <line x1="160" y1="30" x2="160" y2="270" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="50" y="120" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">CAFETERIA HALL</text>

                {/* Kitchen area */}
                <rect x="30" y="180" width="130" height="90" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
                <text x="60" y="225" fill="rgba(255,255,255,0.2)" fontSize="9" fontWeight="bold">KITCHEN</text>

                {/* Office unit C */}
                <text x="260" y="120" fill="rgba(255,255,255,0.2)" fontSize="10" fontWeight="bold">OFFICE BLOCK C</text>

                {/* Exit B stairwell */}
                <rect x="466" y="110" width="4" height="30" fill="var(--success)" />
                <text x="408" y="128" fill="var(--success)" fontSize="8" fontWeight="bold">STAIRWELL B</text>
              </>
            )}

            {/* Fire Spread Simulation Heat Overlay */}
            {activeAlarm && isSimulating && (
              <circle
                cx={getSensorCoords(activeAlarm.sensorId).x}
                cy={getSensorCoords(activeAlarm.sensorId).y}
                r={spreadRadius}
                fill="url(#fireSpreadGlow)"
                style={{ transition: "r 0.5s ease" }}
              />
            )}

            {/* SVG Gradients */}
            <defs>
              <radialGradient id="fireSpreadGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
                <stop offset="40%" stopColor="rgba(255, 138, 0, 0.4)" />
                <stop offset="85%" stopColor="rgba(239, 68, 68, 0.1)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
              </radialGradient>
            </defs>

            {/* Evacuation Arrows Paths (Scroll arrows effect using strokeDasharray animation) */}
            {activeAlarm ? (
              // Hazard Evacuation paths: route occupants AWAY from danger zone
              activeFloor === 2 && activeAlarm.sensorLocation && activeAlarm.sensorLocation.includes("Server Room") ? (
                // Fire is in Server Room (center-east). Evacuation goes WEST to Stairwell A
                <>
                  <path
                    d="M 280 210 L 140 210 L 140 125 L 34 125"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 6"
                    style={{ animation: "evacMove 1s linear infinite" }}
                  />
                  <path
                    d="M 120 120 L 34 120"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 6"
                    style={{ animation: "evacMove 1s linear infinite" }}
                  />
                </>
              ) : (
                // Evacuation to East Stairwell B
                <path
                  d="M 140 210 L 280 210 L 280 125 L 466 125"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  style={{ animation: "evacMove 1s linear infinite" }}
                />
              )
            ) : (
              // Standard Evacuation paths (healthy state)
              <path
                d="M 180 150 L 466 125 M 180 150 L 34 125"
                fill="none"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 6"
              />
            )}

            {/* Render Sensor nodes on layout */}
            {currentFloorSensors.map((s) => {
              const coords = getSensorCoords(s.id);
              const isTriggered = alarms.some(a => a.status === "ACTIVE" && a.sensorId === s.id);
              
              let nodeColor = "var(--success)"; // Green active
              if (s.status === "FAULTY") nodeColor = "var(--danger)"; // Faulty
              if (isTriggered) nodeColor = "var(--primary)"; // Red fire

              return (
                <g key={s.id} style={{ cursor: "pointer" }} onClick={() => alert(`Sensor S-${s.id}\nLocation: ${s.location}\nType: ${s.sensorType}\nStatus: ${s.status}\nBattery: ${s.battery}%`)}>
                  {/* Glowing halo */}
                  {isTriggered && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="16"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      className="animate-ping"
                      style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                    />
                  )}
                  {/* Outer ring */}
                  <circle cx={coords.x} cy={coords.y} r="10" fill="rgba(15, 23, 42, 0.8)" stroke={nodeColor} strokeWidth="2" />
                  {/* Inner dot */}
                  <circle cx={coords.x} cy={coords.y} r="5" fill={nodeColor} />
                  
                  {/* Node label */}
                  <text x={coords.x - 14} y={coords.y - 14} fill="#fff" fontSize="8" fontWeight="bold">S-{s.id}</text>
                </g>
              );
            })}
          </svg>

          {/* Map legend overlay */}
          <div style={{
            position: "absolute",
            bottom: "15px",
            left: "15px",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--card-border)",
            fontSize: "0.7rem",
            display: "flex",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} />
              <span>Normal Node</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)" }} />
              <span>Faulty Node</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 8px red" }} />
              <span>Active Hazard</span>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes evacMove {
              to { stroke-dashoffset: -20; }
            }
          `}} />
        </div>

        {/* Spread controls row */}
        <div style={{ marginTop: "20px", display: "flex", justify: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)" }}>Fire Spread Simulator status</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: isSimulating ? "var(--primary)" : "var(--text-muted)" }}>
              {isSimulating ? `Active (Simulating ${spreadTime}s)` : "Idle"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={toggleSimulation}
              className={`saas-btn ${isSimulating ? "saas-btn-secondary" : "saas-btn-danger"}`}
              style={{ padding: "8px 14px", fontSize: "0.8rem", gap: "6px" }}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              {isSimulating ? "Pause Propagation" : "Simulate Spread"}
            </button>
            
            <button
              onClick={resetSimulation}
              className="saas-btn saas-btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.8rem", gap: "6px" }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Decision Engine Sidebar Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Emergency Engine recommendation */}
        <div className="glass-panel" style={{ padding: "30px", borderLeft: activeAlarm ? "5px solid var(--danger)" : "5px solid var(--success)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={18} style={{ color: activeAlarm ? "var(--danger)" : "var(--success)" }} />
            Decision Engine Suggestion
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Evacuation Priority</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: activeAlarm ? "var(--danger)" : "var(--success)" }}>{evac.priority}</span>
            </div>

            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Escape Route Directives</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.6", marginTop: "3px" }}>{evac.route}</p>
            </div>

            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>Primary Assembly exit</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <Compass size={14} /> {evac.exit}
              </span>
            </div>
          </div>
        </div>

        {/* Live spread details panel */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame size={16} style={{ color: "var(--secondary)" }} />
            Spread Velocity Telemetry
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justify: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Estimated Spread Speed</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{evac.spreadSpeed}</span>
            </div>
            <div style={{ display: "flex", justify: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Flame Front Coverage</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                {isSimulating ? `${Math.round(spreadRadius * 0.15)} meters radius` : "0 meters"}
              </span>
            </div>
            <div style={{ display: "flex", justify: "space-between", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Floor-Breach Estimate</span>
              <span style={{ fontWeight: 600, color: activeAlarm ? "var(--warning)" : "var(--text-muted)" }}>{evac.estSpreadTime}</span>
            </div>
          </div>
        </div>

        {/* Building Systems control interlock status */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} style={{ color: "var(--accent)" }} />
            System Override Controls
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => {
                if (!isAdmin) {
                  alert("Access Denied: Administrator credentials required for HVAC override.");
                  return;
                }
                alert("Initiated override signal. Building HVAC shutdown confirmed.");
              }}
              className="saas-btn saas-btn-secondary"
              style={{ fontSize: "0.8rem", width: "100%", justifyContent: "space-between", padding: "10px 14px", opacity: isAdmin ? 1 : 0.6 }}
            >
              <span>HVAC Forced Shutdown {!isAdmin && "(Restricted)"}</span>
              <ArrowRight size={14} />
            </button>
            
            <button
              onClick={() => {
                if (!isAdmin) {
                  alert("Access Denied: Administrator credentials required for Fire Door override.");
                  return;
                }
                alert("Initiated override signal. Fire doors unlocked successfully.");
              }}
              className="saas-btn saas-btn-secondary"
              style={{ fontSize: "0.8rem", width: "100%", justifyContent: "space-between", padding: "10px 14px", opacity: isAdmin ? 1 : 0.6 }}
            >
              <span>Unlock Emergency Fire Doors {!isAdmin && "(Restricted)"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default EmergencyCenter;
