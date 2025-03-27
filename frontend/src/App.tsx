import "./index.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CircuitVisualization from "./components/CircuitVisualization";
// import CircuitForm from "./components/CircuitForm";
import SampleCircuitButtons from "./components/SampleCircuitButtons";
import CircuitTutor from "./components/CircuitTutor";
import Info from "./components/Info";
import type { CircuitData } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MainPage: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/voltage-divider`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCircuitData(data);
      } catch (error) {
        console.error("Failed to fetch circuit:", error);
      }
    };

    fetchCircuit();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1 style={{ height: "60px" }}>Circuit Tutor</h1>
        <div className="header-links">
          <a
            href="https://forms.gle/xwDaoUbPF7cm1FmcA"
            className="info-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Form for Feedback
          </a>
          <Link to="/info" className="info-link">
            Info
          </Link>
        </div>
      </div>
      <SampleCircuitButtons onCircuitReceived={setCircuitData} />
      {/* <CircuitForm onCircuitReceived={setCircuitData} /> */}

      {circuitData && <CircuitVisualization circuitData={circuitData} />}
      <CircuitTutor circuitData={circuitData} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/info" element={<Info />} />
      </Routes>
    </Router>
  );
};

// the debug circuit buttons are useful for debugging the renderer

export default App;
