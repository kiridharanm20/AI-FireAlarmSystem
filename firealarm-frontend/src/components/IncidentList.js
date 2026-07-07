import React, { useEffect, useState } from "react";
import axios from "axios";

function IncidentList() {

  const [incidents, setIncidents] =
    useState([]);

  useEffect(() => {

    axios.get(
      "http://localhost:8081/api/incidents"
    )
    .then((response) => {

      setIncidents(
        response.data
      );

    });

  }, []);

  return (

    <div className="card">

      <h2>Incident Reports</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {incidents.map((item) => (

            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.location}</td>
              <td>{item.severity}</td>
              <td>{item.incidentStatus}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default IncidentList;