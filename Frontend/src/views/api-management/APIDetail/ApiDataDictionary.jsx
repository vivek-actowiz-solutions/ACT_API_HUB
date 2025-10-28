import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, ProgressBar, Form, InputGroup } from "react-bootstrap";
import { api } from "views/api";
import MainCard from "components/Card/MainCard";
import { FaLink, FaHashtag, FaSearch } from "react-icons/fa";
import { PiTextAaBold } from "react-icons/pi";
import { TbBracketsContain } from "react-icons/tb";

const DataFieldAnalysis = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [fieldStats, setFieldStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/get-api-sample-data/${id}`, {
        withCredentials: true,
      });

      const data = res.data?.data || [];
      if (data.length === 0) {
        setFieldStats([]);
        setLoading(false);
        return;
      }

      const totalRows = data.length;
      const keys = Object.keys(data[0]);

      const stats = keys.map((key) => {
        const values = data.map((row) => row[key]);

        // ✅ Ignore null, undefined, empty string, and 'N/A'
        const nonEmptyCount = values.filter(
          (v) =>
            v !== null &&
            v !== undefined &&
            v !== "" &&
            String(v).trim().toLowerCase() !== "n/a"
        ).length;

        const fillRate = ((nonEmptyCount / totalRows) * 100).toFixed(2);

        const sampleValue = values.find(
          (v) =>
            v !== null &&
            v !== undefined &&
            v !== "" &&
            String(v).trim().toLowerCase() !== "n/a"
        );

        let dataType = typeof sampleValue;
        if (Array.isArray(sampleValue)) dataType = "Array";
        if (sampleValue && typeof sampleValue === "object" && !Array.isArray(sampleValue))
          dataType = "Object";
        if (
          key.toLowerCase().includes("url") ||
          (typeof sampleValue === "string" && sampleValue.startsWith("http"))
        )
          dataType = "Url";

        return { column: key, dataType, fillRate };
      });

      setFieldStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case "url":
        return <FaLink className="text-secondary me-2" />;
      case "text":
      case "string":
        return <PiTextAaBold className="text-secondary me-2" />;
      case "number":
        return <FaHashtag className="text-secondary me-2" />;
      case "array":
      case "object":
        return <TbBracketsContain className="text-warning me-2" />;
      default:
        return <PiTextAaBold className="text-muted me-2" />;
    }
  };

  const filteredFields = fieldStats.filter((f) =>
    f.column.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainCard title="Data Fields Overview" cardClass="mb-3">
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "150px" }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      ) : fieldStats.length > 0 ? (
        <>
          {/* 🔍 Search Bar */}
          <div className="mb-3">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search column..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {/* 🧾 Data Table */}
          <div className="table-responsive">
            {/* <Table responsive hover>
                 <thead style={{ backgroundColor: "#3F4D67", color: "#fff" }}>
                <tr>
                  <th style={{ width: "400px" }}>Column Name</th>
                  <th>Data Type</th>
                  <th style={{ maxWidt: "200px" }}>Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredFields.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: "500" }}>{f.column}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getIconForType(f.dataType)}
                        <span>{f.dataType}</span>
                      </div>
                    </td>
                    <td>
                        <span>{f.fillRate}%</span>
                      <ProgressBar
                        now={parseFloat(f.fillRate)}
                        style={{
                          height: "8px",
                          marginTop: "4px",
                        }}
                        // custom bar color
                        variant="custom"
                        visuallyHidden
                        
                      >
                           <div
                          style={{
                            width: `${f.fillRate}%`,
                            height: "100%",
                            backgroundColor: "#3F4D67",
                            borderRadius: "4px",
                          }}
                        />
                      </ProgressBar>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table> */}
             <Table
        hover
        responsive="md"
        className="align-middle text-nowrap"
      >
        <thead style={{ backgroundColor: "#3F4D67", color: "#fff" }}>
          <tr>
            <th style={{ minWidth: "250px" }}>Column Name</th>
            <th style={{ minWidth: "150px" }}>Data Type</th>
            <th style={{ minWidth: "200px" }}>Fill Rate</th>
          </tr>
        </thead>

        <tbody>
          {filteredFields.map((f, i) => (
            <tr key={i}>
              {/* Column Name */}
              <td className="fw-medium text-break">{f.column}</td>

              {/* Data Type */}
              <td>
                <div className="d-flex align-items-center">
                  {getIconForType(f.dataType)}
                  <span>{f.dataType}</span>
                </div>
              </td>

              {/* Fill Rate */}
              <td>
                <div>
                  <span>{f.fillRate}%</span>
                  <ProgressBar
                    now={parseFloat(f.fillRate)}
                    style={{ height: "8px", marginTop: "6px" }}
                    className="bg-light"
                  >
                    <div
                      className="rounded"
                      style={{
                        width: `${f.fillRate}%`,
                        height: "100%",
                        backgroundColor: "#3F4D67",
                        transition: "width 0.5s ease",
                      }}
                    ></div>
                  </ProgressBar>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
          </div>
        </>
      ) : (
        <h5 className="text-center mt-3">No data available</h5>
      )}
    </MainCard>
  );
};

export default DataFieldAnalysis;

