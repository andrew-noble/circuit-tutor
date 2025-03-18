import React, { useEffect, useState } from "react";
import "./index.css";
import CircuitVisualization from "./components/CircuitVisualization";
import type { CircuitData } from "./types";

const App: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();

  useEffect(() => {
    // Load circuit data
    fetch("ex-circ.json")
      .then((res) => res.json())
      .then((data) => setCircuitData(data))
      .catch(console.error);
  }, []);

  return (
    <div className="app">
      <CircuitVisualization circuitData={circuitData} />
    </div>
  );
};

export default App;
