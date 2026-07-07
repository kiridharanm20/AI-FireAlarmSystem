import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

function FireDetection() {

  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("HIGH");

  const [sensors, setSensors] = useState([]);
  const [sensorId, setSensorId] = useState("");

    useEffect(() => {
      axios.get("http://localhost:8081/api/sensors")
        .then(res => setSensors(res.data));
    }, []);

  const detectFire = async () => {

    try {

      await axios.post(
        "http://localhost:8081/api/alarms",
        {
          location,
          severity,
          status: "ACTIVE"
        }
      );

      alert("Fire Detected Successfully");

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <div>

      <h1>Fire Detection</h1>

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

     <br /><br />
     
    <select
        value={severity}
        onChange={(e) =>
          setSeverity(e.target.value)
        }
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      <br /><br />

      <button onClick={detectFire}>
        Trigger Fire Alarm
      </button>

    </div>
  );
}

export default FireDetection;