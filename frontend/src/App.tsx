import React, { useState } from "react";
import "./index.css";
import CircuitVisualization from "./components/CircuitVisualization";
import CircuitForm from "./components/CircuitForm";
import ExampleCircuitButtons from "./components/ExampleCircuitButtons";
import CircuitTutor from "./components/CircuitTutor";
import "./components/CircuitTutor.css";
import type { CircuitData } from "./types";

const App: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

  return (
    <div className="app">
      <h1>Circuit Visualizer</h1>
      <ExampleCircuitButtons onCircuitReceived={setCircuitData} />
      <CircuitForm onCircuitReceived={setCircuitData} />
      {circuitData && <CircuitVisualization circuitData={circuitData} />}
      <CircuitTutor circuitData={circuitData} />
    </div>
  );
};

export default App;
