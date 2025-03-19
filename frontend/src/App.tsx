import "./index.css";
import React, { useState } from "react";
import CircuitVisualization from "./components/CircuitVisualization";
import CircuitForm from "./components/CircuitForm";
import DebugCircuitButtons from "./components/DebugCircuitButtons";
import CircuitTutor from "./components/CircuitTutor";
import type { CircuitData } from "./types";

const App: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

  return (
    <div className="app">
      <h1>Circuit Tutor</h1>
      {/* <DebugCircuitButtons onCircuitReceived={setCircuitData} /> */}
      <CircuitForm onCircuitReceived={setCircuitData} />
      {circuitData && <CircuitVisualization circuitData={circuitData} />}
      <CircuitTutor circuitData={circuitData} />
    </div>
  );
};

// the debug circuit buttons are useful for debugging the renderer

export default App;
