import React, { useEffect, useState } from "react";
import axios from "axios";

function DashboardHome() {

  const [dashboard, setDashboard] = useState({
    sensors: 0,
    alarms: 0,
    incidents: 0
  });

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:8081/api/dashboard"
        );

      setDashboard(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  return (

    <div>

      <h1>Dashboard</h1>

      <div className="cards">

        <div className="card-box">
          <h2>{dashboard.sensors}</h2>
          <p>Total Sensors</p>
        </div>

        <div className="card-box">
          <h2>{dashboard.alarms}</h2>
          <p>Active Alarms</p>
        </div>

        <div className="card-box">
          <h2>{dashboard.incidents}</h2>
          <p>Incidents</p>
        </div>

      </div>

    </div>
  );
}

export default DashboardHome;