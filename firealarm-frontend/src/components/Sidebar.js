import React from "react";

function Sidebar({ setPage }) {
    const logout = () => {

  localStorage.removeItem("user");

  window.location.href = "/";
};

  return (
    <div className="sidebar">

      <h2>🔥 Fire Alarm</h2>

      <button onClick={() => setPage("dashboard")}>
        Dashboard
      </button>

      <button onClick={() => setPage("sensor")}>
        Sensor Management
      </button>

      <button onClick={() => setPage("fire")}>
        Fire Detection
      </button>

      <button onClick={() => setPage("alarm")}>
        Alarm Monitoring
      </button>

      <button onClick={() => setPage("incident")}>
        Incident Reports
      </button>

      <button onClick={logout}>
        Logout
      </button>
      <button
        onClick={() =>
          setPage("reports")
      }
        >
          Reports
      </button>

      <button
      onClick={() =>
        setPage("analytics")
      }
    >
          Analytics
      </button>

      <button
        onClick={() =>
         setPage("users")
        }
        >
         User Management
      </button>
    </div>
  );
}

export default Sidebar;