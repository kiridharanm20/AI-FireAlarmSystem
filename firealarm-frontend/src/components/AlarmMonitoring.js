import React,
{
  useEffect,
  useState
}
from "react";

import axios from "axios";

function AlarmMonitoring() {

  const [alarms,
    setAlarms] =
    useState([]);

  useEffect(() => {

    loadAlarms();

  }, []);

  const loadAlarms =
    async () => {

      const response =
        await axios.get(
          "http://localhost:8081/api/alarms"
        );

      setAlarms(response.data);
    };

  const resetAlarm =
    async (id) => {

      await axios.put(
        `http://localhost:8081/api/alarms/${id}/reset`
      );

      loadAlarms();
    };

  return (

    <div>

      <h1>
        Alarm Monitoring
      </h1>

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Sensor ID</th>

            <th>Status</th>

            <th>Time</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {alarms.map(alarm => (

            <tr key={alarm.id}>

              <td>{alarm.id}</td>

              <td>{alarm.sensorId}</td>

              <td>{alarm.status}</td>

              <td>{alarm.alarmTime}</td>

              <td>

                {alarm.status ===
                  "ACTIVE" && (

                  <button
                    onClick={() =>
                      resetAlarm(
                        alarm.id
                      )
                    }
                  >
                    Reset
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

export default AlarmMonitoring;