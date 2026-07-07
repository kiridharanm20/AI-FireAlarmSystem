import React, { useState } from "react";
import axios from "axios";

function SensorForm() {

  const [sensor, setSensor] = useState({
    location: "",
    sensorType: "",
    status: "ACTIVE"
  });

  const handleChange = (e) => {
    setSensor({
      ...sensor,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:8081/api/sensors",
      sensor
    );

    alert("Sensor Added");

    setSensor({
      location: "",
      sensorType: "",
      status: "ACTIVE"
    });
  };

  return (
    <div className="card">
      <h2>Add Sensor</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={sensor.location}
          onChange={handleChange}
        />

        <input
          type="text"
          name="sensorType"
          placeholder="Sensor Type"
          value={sensor.sensorType}
          onChange={handleChange}
        />

        <button type="submit">
          Add Sensor
        </button>

      </form>
    </div>
  );
}

export default SensorForm;