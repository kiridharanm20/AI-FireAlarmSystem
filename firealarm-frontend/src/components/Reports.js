import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React,
{
  useEffect,
  useState
}
from "react";

import axios from "axios";

function Reports() {

  const [report,
    setReport] =
    useState({});

  useEffect(() => {

    loadReport();

  }, []);

  const loadReport =
    async () => {

      const response =
        await axios.get(
          "http://localhost:8081/api/reports/summary"
        );

      setReport(
        response.data
      );
    };

    const downloadPDF = () => {

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text(
    "Smart Fire Alarm Monitoring System",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Total Sensors : ${report.totalSensors}`,
    20,
    40
  );

  doc.text(
    `Total Alarms : ${report.totalAlarms}`,
    20,
    50
  );

  doc.text(
    `Total Incidents : ${report.totalIncidents}`,
    20,
    60
  );

  autoTable(doc, {

    startY: 80,

    head: [[
      "Metric",
      "Value"
    ]],

    body: [

      [
        "Sensors",
        report.totalSensors
      ],

      [
        "Alarms",
        report.totalAlarms
      ],

      [
        "Incidents",
        report.totalIncidents
      ]

    ]
  });

  doc.save(
    "FireAlarmReport.pdf"
  );
};

  return (

    <div>

      <h1>
        Reports & Analytics
      </h1>

        <button
          onClick={downloadPDF}
        >
          Download PDF Report
        </button>

      <div className="cards">

        <div className="card-box">

          <h2>
            {report.totalSensors}
          </h2>

          <p>
            Total Sensors
          </p>

        </div>

        <div className="card-box">

          <h2>
            {report.totalAlarms}
          </h2>

          <p>
            Total Alarms
          </p>

        </div>

        <div className="card-box">

          <h2>
            {report.totalIncidents}
          </h2>

          <p>
            Total Incidents
          </p>

        </div>

      </div>

    </div>
  );
}

export default Reports;