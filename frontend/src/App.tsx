import "./index.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CircuitVisualization from "./components/CircuitVisualization";
import CircuitForm from "./components/CircuitForm";
import SampleCircuitButtons from "./components/SampleCircuitButtons";
import CircuitTutor from "./components/CircuitTutor";
import Info from "./components/Info";
import type { CircuitData } from "./types";

const MobileWarning: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      style={{
        backgroundColor: "#fff3cd",
        color: "#856404",
        padding: "12px",
        margin: "10px",
        borderRadius: "4px",
        textAlign: "center",
        border: "1px solid #ffeeba",
      }}
    >
      ⚠️ This application is not yet optimized for mobile devices. For the best
      experience, please use a desktop or laptop computer.
    </div>
  );
};

const MainPage: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

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
      <MobileWarning />
      <CircuitForm onCircuitReceived={setCircuitData} />
      <SampleCircuitButtons onCircuitReceived={setCircuitData} />
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
