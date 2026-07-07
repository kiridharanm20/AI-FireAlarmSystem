import React,
{
  useEffect,
  useState
}
from "react";

import axios from "axios";

function IncidentReports() {

  const [incidents,
    setIncidents] =
    useState([]);

  useEffect(() => {

    loadIncidents();

  }, []);

  const loadIncidents =
    async () => {

      const response =
        await axios.get(
          "http://localhost:8081/api/incidents"
        );

      setIncidents(
        response.data
      );
    };

    const closeIncident = async (id) => {

      await axios.put(
        `http://localhost:8081/api/incidents/${id}/close`
      );

      loadIncidents();
    };

  return (

    <div>

      <h1>
        Incident Reports
      </h1>

      <table>

        <thead>

          <tr>

              <th>ID</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Action</th>


          </tr>

        </thead>

<tbody>

  {incidents.map((item) => (

    <tr key={item.id}>

      <td>{item.id}</td>

      <td>{item.location}</td>

      <td>{item.severity}</td>

      <td>{item.incidentStatus}</td>

      <td>

        {item.incidentStatus === "OPEN" && (

          <button
            onClick={() =>
              closeIncident(item.id)
            }
          >
            Close
          </button>

        )}

      </td>

    </tr>

  ))}

</tbody>

      </table>

    </div>
  );
}

export default IncidentReports;