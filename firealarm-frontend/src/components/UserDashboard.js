import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHome from "./DashboardHome";
import SensorManagement from "./SensorManagement";
import AlarmMonitoring from "./AlarmMonitoring";
import IncidentReports from "./IncidentReports";
import Reports from "./Reports";
import Analytics from "./Analytics";

function UserDashboard() {

    const [page, setPage] = useState("dashboard");
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const renderPage = () => {

        switch(page){

            case "dashboard":
                return <DashboardHome />;

            case "sensors":
                return <SensorManagement />;

            case "alarms":
                return <AlarmMonitoring />;

            case "incidents":
                return <IncidentReports />;

            case "reports":
                return <Reports />;

            case "analytics":
                return <Analytics />;

            default:
                return <DashboardHome />;
        }

    };

    return (

        <div className="dashboard">

            <div className="sidebar">

                <h2>User Panel</h2>

                <button onClick={() => setPage("dashboard")}>
                    Dashboard
                </button>

                <button onClick={() => setPage("sensors")}>
                    View Sensors
                </button>

                <button onClick={() => setPage("alarms")}>
                    View Alarms
                </button>

                <button onClick={() => setPage("incidents")}>
                    View Incidents
                </button>

                <button onClick={() => setPage("reports")}>
                    Reports
                </button>

                <button onClick={() => setPage("analytics")}>
                    Analytics
                </button>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

            <div className="content">

                {renderPage()}

            </div>

        </div>

    );
}

export default UserDashboard;