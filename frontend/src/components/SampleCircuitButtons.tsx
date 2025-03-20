import React from "react";
import type { CircuitData } from "../types";

interface SampleCircuitButtonsProps {
  onCircuitReceived: (circuit: CircuitData) => void;
}

const DebugCircuitButtons: React.FC<SampleCircuitButtonsProps> = ({
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
          Load Sample Voltage Divider
        </button>
        <button
          onClick={() => fetchCircuit("current-divider")}
          className="example-button"
        >
          Load Sample Current Divider
        </button>
      </div>
    </div>
  );
};

export default DebugCircuitButtons;
