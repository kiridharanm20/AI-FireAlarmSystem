import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

function Analytics() {

  const [report, setReport] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    const response =
      await axios.get(
        "http://localhost:8081/api/reports/summary"
      );

    setReport(response.data);
  };

  const pieData = [

    {
      name: "Sensors",
      value: report.totalSensors || 0
    },

    {
      name: "Alarms",
      value: report.totalAlarms || 0
    },

    {
      name: "Incidents",
      value: report.totalIncidents || 0
    }

  ];

  return (

    <div>

      <h1>Analytics Dashboard</h1>

      <PieChart
        width={500}
        height={350}
      >

        <Pie
          data={pieData}
          dataKey="value"
          outerRadius={120}
          label
        >

          <Cell fill="#2563eb" />
          <Cell fill="#f59e0b" />
          <Cell fill="#dc2626" />

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

      <BarChart
        width={600}
        height={300}
        data={pieData}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Bar
          dataKey="value"
          fill="#2563eb"
        />

      </BarChart>

    </div>
  );
}

export default Analytics;