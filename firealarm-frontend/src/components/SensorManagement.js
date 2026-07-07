import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

function SensorManagement() {

  const [sensors, setSensors] =
    useState([]);

  const [sensor, setSensor] =
    useState({
      location: "",
      sensorType: "",
      status: "ACTIVE"
    });

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

  const handleChange = (e) => {

    setSensor({
      ...sensor,
      [e.target.name]: e.target.value
    });
  };

  const addSensor = async (e) => {

    e.preventDefault();

    await axios.post(
      "http://localhost:8081/api/sensors",
      sensor
    );

    setSensor({
      location: "",
      sensorType: "",
      status: "ACTIVE"
    });

    loadSensors();
  };

  const deleteSensor =
    async (id) => {

      await axios.delete(
        `http://localhost:8081/api/sensors/${id}`
      );

      loadSensors();
    };

    const editSensor = async (sensor) => {

  const location =
    prompt(
      "Enter New Location",
      sensor.location
    );

  if(!location) return;

  await axios.put(
    `http://localhost:8081/api/sensors/${sensor.id}`,
    {
      ...sensor,
      location
    }
  );

  loadSensors();
};

  return (

    <div>

      <h1>Sensor Management</h1>

      <form onSubmit={addSensor}>

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

      <br />

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Location</th>

            <th>Type</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {sensors.map(sensor => (

            <tr key={sensor.id}>

              <td>{sensor.id}</td>

              <td>{sensor.location}</td>

              <td>{sensor.sensorType}</td>

              <td>{sensor.status}</td>

              <td>

                <button
                  onClick={() =>
                    deleteSensor(sensor.id)
                  }
                >
                  Delete
                </button>

                <button
                 onClick={() =>
                    editSensor(sensor)
                 }
                >
                  Edit
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default SensorManagement;