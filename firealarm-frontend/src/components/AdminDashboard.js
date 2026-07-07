import React, { useState } from "react";

import Sidebar from "../components/Sidebar";
import DashboardHome from "../components/DashboardHome";
import SensorManagement from "../components/SensorManagement";
import FireDetection from "../components/FireDetection";
import AlarmMonitoring from "../components/AlarmMonitoring";
import IncidentReports from "../components/IncidentReports";
import Reports from "../components/Reports";
import Analytics from "./Analytics";
import UserManagement from "./UserManagement";

import "../components/AdminDashboard.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const navigate = useNavigate();

    useEffect(() => {

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            navigate("/");
            return;
        }

        if (user.role !== "ADMIN") {
            navigate("/");
        }

    }, []);

    useEffect(() => {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  if(!user) {

    window.location.href="/";
  }

}, []);

  const [page, setPage] =
    useState("dashboard");

  const renderPage = () => {

    switch (page) {

      case "sensor":
        return <SensorManagement />;

      case "fire":
        return <FireDetection />;

      case "alarm":
        return <AlarmMonitoring />;

      case "incident":
        return <IncidentReports />;

      case "reports":
        return <Reports />;  

      case "analytics":
        return <Analytics />;

      case "users":
        return <UserManagement />;

      default:
        return <DashboardHome />;
    }
  };

  return (

    <div className="admin-container">

      <Sidebar setPage={setPage} />

      <div className="content">

        {renderPage()}

      </div>

    </div>
  );
}

export default AdminDashboard;