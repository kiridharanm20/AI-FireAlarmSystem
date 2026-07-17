import React from "react";
import {
  LayoutDashboard,
  Activity,
  Flame,
  BellRing,
  FileText,
  BarChart3,
  Sparkles,
  Map,
  Users,
  Settings,
  LogOut,
  ShieldAlert
} from "lucide-react";

function Sidebar({ currentPage, setPage }) {
  const user = JSON.parse(localStorage.getItem("user")) || { role: "USER", username: "Guest" };
  const isAdmin = user.role === "ADMIN";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sandboxMode");
    window.location.href = "/";
  };

  // Menu items list with roles configuration
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "USER"] },
    { id: "sensor", label: isAdmin ? "Sensor Management" : "View Sensors", icon: Activity, roles: ["ADMIN", "USER"] },
    { id: "fire", label: "Fire Detection", icon: Flame, roles: ["ADMIN"] },
    { id: "alarm", label: isAdmin ? "Alarm Monitoring" : "View Alarms", icon: BellRing, roles: ["ADMIN", "USER"] },
    { id: "incident", label: isAdmin ? "Incident Reports" : "View Incidents", icon: FileText, roles: ["ADMIN", "USER"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "USER"] },
    { id: "warning-logs", label: "Warning Logs", icon: ShieldAlert, roles: ["ADMIN", "USER"] },
    { id: "ai-assistant", label: "FireGuard AI", icon: Sparkles, roles: ["ADMIN", "USER"] },
    { id: "users", label: "User Management", icon: Users, roles: ["ADMIN"] },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Flame size={24} fill="var(--primary)" />
        </div>
        <span className="sidebar-title">FireGuard AI</span>
      </div>

      <div className="sidebar-menu">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`sidebar-menu-btn ${isActive ? "active" : ""} ${user.role === "USER" ? "user-style" : ""}`}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className={`user-avatar ${user.role === "USER" ? "user-style" : ""}`}>
            {user.username ? user.username.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>

        <button onClick={logout} className="sidebar-menu-btn" style={{ color: "var(--danger)", width: "100%" }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;