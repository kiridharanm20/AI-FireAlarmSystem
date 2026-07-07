import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [data, setData] = useState({
    sensors: 0,
    alarms: 0,
    incidents: 0
  });

  useEffect(() => {

  loadDashboard();

  const interval = setInterval(() => {
    loadDashboard();
  }, 3000);

  return () => clearInterval(interval);

}, []);

const loadDashboard = () => {

  axios
    .get("http://localhost:8081/api/dashboard")
    .then((response) => {
      setData(response.data);
    });

};

  return (

    <div className="card">

      <h2>Dashboard</h2>

      <div className="stats">

        <div className="box">
          <h3>{data.sensors}</h3>
          <p>Total Sensors</p>
        </div>

        <div className="box">
          <h3>{data.alarms}</h3>
          <p>Active Alarms</p>
        </div>

        <div className="box">
          <h3>{data.incidents}</h3>
          <p>Incidents</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;