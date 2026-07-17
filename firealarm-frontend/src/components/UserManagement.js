import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  User,
  Info,
  CheckCircle
} from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isSandbox, setIsSandbox] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER"
  });

  const loadUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Backend offline, failed to load users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;

    try {
      await axios.post("http://localhost:8081/api/users", form);
      loadUsers();
    } catch (error) {
      console.error("Failed to add user to database:", error);
      alert("Failed to add user to database.");
    }

    setForm({
      username: "",
      password: "",
      role: "USER"
    });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:8081/api/users/${id}`);
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user from database.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* Create User Form */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={18} style={{ color: "var(--primary)" }} />
          Register New Account
        </h2>

        <form onSubmit={addUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 140px", gap: "15px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. fire_warden"
              className="saas-input"
              value={form.username}
              onChange={handleFormChange}
              style={{ marginBottom: 0 }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Secure password"
              className="saas-input"
              value={form.password}
              onChange={handleFormChange}
              style={{ marginBottom: 0 }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>System Role</label>
            <select
              name="role"
              className="saas-select"
              value={form.role}
              onChange={handleFormChange}
              style={{ marginBottom: 0 }}
            >
              <option value="USER">USER (Standard Operator)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <button type="submit" className="saas-btn saas-btn-primary" style={{ height: "46px" }}>
            Add Account
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} style={{ color: "var(--accent)" }} />
          Personnel Directory
        </h2>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Authorization Role</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>#{u.id}</td>
                    <td style={{ color: "var(--text)", fontWeight: 500 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <User size={14} style={{ color: "var(--text-muted)" }} />
                        {u.username}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${u.role === "ADMIN" ? "badge-danger" : "badge-success"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Shield size={10} />
                        {u.role || "USER"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {u.username === "admin" || u.username === "user" ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", paddingRight: "10px" }}>System Protected</span>
                        ) : (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="saas-btn saas-btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", gap: "6px" }}
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
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <Info size={24} style={{ margin: "0 auto 10px", display: "block" }} />
                    No registered user accounts found in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

export default UserManagement;