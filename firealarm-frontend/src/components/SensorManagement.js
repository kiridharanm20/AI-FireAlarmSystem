import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Edit,
  Activity,
  AlertCircle,
  Battery,
  Calendar,
  X,
  Sliders,
  CheckCircle
} from "lucide-react";

function SensorManagement() {
  const [sensors, setSensors] = useState([]);
  const [isSandbox, setIsSandbox] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER" };
  const isAdmin = user.role === "ADMIN";
  
  const [form, setForm] = useState({
    location: "",
    sensorType: "Smoke Detector",
    status: "ACTIVE",
    battery: 100
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    sensor: null,
    location: "",
    status: "ACTIVE"
  });

  const loadSensors = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/sensors");
      setSensors(response.data);
    } catch (error) {
      console.error("Backend offline, failed to load sensors:", error);
      setSensors([]);
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addSensor = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) return;

    try {
      await axios.post("http://localhost:8081/api/sensors", {
        location: form.location,
        sensorType: form.sensorType,
        status: form.status
      });
      loadSensors();
    } catch (error) {
      console.error("Failed to add sensor to backend database:", error);
      alert("Failed to add sensor to database.");
    }

    setForm({
      location: "",
      sensorType: "Smoke Detector",
      status: "ACTIVE",
      battery: 100
    });
  };

  const deleteSensor = async (id) => {
    if (!window.confirm(`Are you sure you want to delete sensor S-${id}?`)) return;

    try {
      await axios.delete(`http://localhost:8081/api/sensors/${id}`);
      loadSensors();
    } catch (error) {
      console.error("Failed to delete sensor:", error);
      alert("Failed to delete sensor from database.");
    }
  };

  const openEditModal = (sensor) => {
    setEditModal({
      isOpen: true,
      sensor: sensor,
      location: sensor.location,
      status: sensor.status || "ACTIVE"
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      sensor: null,
      location: "",
      status: "ACTIVE"
    });
  };

  const saveEditSensor = async (e) => {
    e.preventDefault();
    const sensorId = editModal.sensor.id;

    try {
      await axios.put(`http://localhost:8081/api/sensors/${sensorId}`, {
        ...editModal.sensor,
        location: editModal.location,
        status: editModal.status
      });
      loadSensors();
      closeEditModal();
    } catch (error) {
      console.error("Failed to update sensor:", error);
      alert("Failed to update sensor settings on database.");
    }

    closeEditModal();
  };

  // Battery bar helper
  const getBatteryColor = (level) => {
    if (level < 25) return "var(--danger)";
    if (level < 55) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* Sensor adding block */}
      {isAdmin && (
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} style={{ color: "var(--primary)" }} />
            Provision New Sensor Node
          </h2>

          <form onSubmit={addSensor} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 120px", gap: "15px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Location Name</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Floor 3 South Corridor"
                className="saas-input"
                value={form.location}
                onChange={handleFormChange}
                style={{ marginBottom: 0 }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Hardware Type</label>
              <select
                name="sensorType"
                className="saas-select"
                value={form.sensorType}
                onChange={handleFormChange}
                style={{ marginBottom: 0 }}
              >
                <option value="Smoke Detector">Smoke Detector</option>
                <option value="Heat Sensor">Heat Sensor</option>
                <option value="Flame Sensor">Flame Sensor</option>
                <option value="CO2 Gas Sensor">CO2 Gas Sensor</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Initial State</label>
              <select
                name="status"
                className="saas-select"
                value={form.status}
                onChange={handleFormChange}
                style={{ marginBottom: 0 }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="FAULTY">FAULTY</option>
              </select>
            </div>

            <button type="submit" className="saas-btn saas-btn-primary" style={{ height: "46px" }}>
              Add Node
            </button>
          </form>
        </div>
      )}

      {/* Fleet table */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} style={{ color: "var(--accent)" }} />
          Hardware Node Registry
        </h2>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Hardware Type</th>
                <th>Power (Battery)</th>
                <th>Install Date</th>
                <th>Operational Status</th>
                {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sensors.length > 0 ? (
                sensors.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>S-{s.id}</td>
                    <td style={{ color: "var(--text)" }}>{s.location}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Activity size={12} style={{ color: "var(--accent)" }} />
                        {s.sensorType || "Thermal Node"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Battery size={16} style={{ color: getBatteryColor(s.battery || 100) }} />
                        <div style={{ width: "60px", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${s.battery || 100}%`, height: "100%", background: getBatteryColor(s.battery || 100) }} />
                        </div>
                        <span style={{ fontSize: "0.8rem", width: "30px", textAlign: "right" }}>{s.battery || 100}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
                        <Calendar size={12} />
                        {s.installDate || "2025-01-01"}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${s.status === "ACTIVE" ? "badge-success" : s.status === "FAULTY" ? "badge-danger" : "badge-warning"}`}>
                        {s.status || "ACTIVE"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          <button
                            className="saas-btn saas-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => openEditModal(s)}
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            className="saas-btn saas-btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => deleteSensor(s.id)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <AlertCircle size={24} style={{ margin: "0 auto 10px", display: "block" }} />
                    No registered sensors found in the active workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (Glassmorphism popup overlay) */}
      {isAdmin && editModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(9, 13, 22, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
          animation: "fadeIn 0.2s ease"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "30px", position: "relative", animation: "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <button
              onClick={closeEditModal}
              style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit size={18} style={{ color: "var(--primary)" }} />
              Configure Node S-{editModal.sensor.id}
            </h3>

            <form onSubmit={saveEditSensor}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Installed Location</label>
                <input
                  type="text"
                  className="saas-input"
                  value={editModal.location}
                  onChange={(e) => setEditModal({ ...editModal, location: e.target.value })}
                  style={{ marginBottom: 0 }}
                  required
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Status Mode</label>
                <select
                  className="saas-select"
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  style={{ marginBottom: 0 }}
                >
                  <option value="ACTIVE">ACTIVE (Online)</option>
                  <option value="INACTIVE">INACTIVE (Muted)</option>
                  <option value="FAULTY">FAULTY (Maintenance Required)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="saas-btn saas-btn-primary">
                  <CheckCircle size={14} /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorManagement;