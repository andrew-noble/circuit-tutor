import React, { useState } from "react";
import type { CircuitData } from "../types";
import Spinner from "./Spinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CircuitGeneratorFormProps {
  onCircuitReceived: (circuit: CircuitData) => void;
}

const CircuitGeneratorForm: React.FC<CircuitGeneratorFormProps> = ({
  onCircuitReceived,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-circuit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onCircuitReceived(data);
      setPrompt(""); // Clear the form after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="circuit-form-container">
      <form onSubmit={handleSubmit} className="circuit-form">
        <div className="form-group">
          <label htmlFor="circuit-prompt">Generate a circuit with AI:</label>
          <p style={{ color: "#e28743" }}>
            Currently, only circuits with a single voltage source and resistors,
            inductors, capacitors, and diodes are supported.
          </p>
          <textarea
            id="circuit-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a voltage divider with two resistors, one 1kOhm and the other 2kOhm. Voltage source is 5V."
            rows={3}
            disabled={isLoading}
            className="form-control"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="form-button"
        >
          {isLoading ? <Spinner /> : "Generate Circuit"}
        </button>
      </form>
    </div>
  );
};

export default CircuitGeneratorForm;
