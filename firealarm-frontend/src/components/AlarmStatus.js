import React, { useEffect, useState } from "react";
import axios from "axios";

function AlarmStatus() {

  const [status, setStatus] = useState("NORMAL");

  const [sensors, setSensors] = useState([]);

  const [sensorId, setSensorId] = useState("");

  const [temperature, setTemperature] = useState("");

  useEffect(() => {

    loadSensors();

  }, []);

  const loadSensors = async () => {

    const response =
      await axios.get(
        "http://localhost:8081/api/sensors"
      );

    setSensors(response.data);
  };

  const checkFire = async () => {

    if (!sensorId) {

      alert("Select Sensor");

      return;
    }

    if (temperature < 60) {

      setStatus("NORMAL");

      alert("No Fire Detected");

      return;
    }

    const sensorResponse =
      await axios.get(
        `http://localhost:8081/api/sensors/${sensorId}`
      );

    const sensor =
      sensorResponse.data;

    await axios.post(
      "http://localhost:8081/api/alarms",
      {
        sensorId: sensor.id,
        status: "ACTIVE"
      }
    );

    await axios.post(
      "http://localhost:8081/api/incidents",
      {
        location: sensor.location,
        severity: "HIGH",
        incidentStatus: "OPEN"
      }
    );

    setStatus("FIRE DETECTED");
  };

  return (

    <div className="card">

      <h2>Fire Detection</h2>

      <h3>{status}</h3>

      <select
        value={sensorId}
        onChange={(e) =>
          setSensorId(e.target.value)
        }
      >

        <option value="">
          Select Sensor
        </option>

        {sensors.map(sensor => (

          <option
            key={sensor.id}
            value={sensor.id}
          >
            {sensor.location}
          </option>

        ))}

      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Temperature"
        value={temperature}
        onChange={(e) =>
          setTemperature(e.target.value)
        }
      />

      <br />

      <button
        onClick={checkFire}
      >
        Check Fire
      </button>

    </div>
  );
}

export default AlarmStatus;