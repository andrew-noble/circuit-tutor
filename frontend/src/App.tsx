import "./index.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CircuitVisualization from "./components/CircuitVisualization";
import CircuitForm from "./components/CircuitForm";
// import DebugCircuitButtons from "./components/DebugCircuitButtons";
import CircuitTutor from "./components/CircuitTutor";
import Info from "./components/Info";
import type { CircuitData } from "./types";

const MainPage: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

  return (
    <div className="app">
      <div className="header">
        <h1>Circuit Tutor</h1>
        <Link to="/info" className="info-link">
          Info
        </Link>
      </div>
      {/* <DebugCircuitButtons onCircuitReceived={setCircuitData} /> */}
      <CircuitForm onCircuitReceived={setCircuitData} />
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
