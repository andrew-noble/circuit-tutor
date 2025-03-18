import React from "react";
import type { CircuitData } from "../types";
import "./ExampleCircuitButtons.css";

interface ExampleCircuitButtonsProps {
  onCircuitReceived: (circuit: CircuitData) => void;
}

const ExampleCircuitButtons: React.FC<ExampleCircuitButtonsProps> = ({
  onCircuitReceived,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const fetchCircuit = async (endpoint: string) => {
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onCircuitReceived(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="example-circuit-buttons">
      {error && <div className="error-message">{error}</div>}
      <div className="button-group">
        <button
          onClick={() => fetchCircuit("voltage-divider")}
          className="example-button"
        >
          Load Voltage Divider
        </button>
        <button
          onClick={() => fetchCircuit("current-divider")}
          className="example-button"
        >
          Load Current Divider
        </button>
      </div>
    </div>
  );
};

export default ExampleCircuitButtons;
