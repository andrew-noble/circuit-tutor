import React, { useState } from "react";
import type { CircuitData } from "../types";

interface CircuitFormProps {
  onCircuitReceived: (circuit: CircuitData) => void;
}

const CircuitForm: React.FC<CircuitFormProps> = ({ onCircuitReceived }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/request-circuit", {
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
    <form onSubmit={handleSubmit} className="circuit-form">
      <div className="form-group">
        <label htmlFor="circuit-prompt">
          Describe the circuit you want to create:
        </label>
        <textarea
          id="circuit-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Create a voltage divider with two resistors"
          rows={3}
          disabled={isLoading}
          className="form-control"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={isLoading || !prompt.trim()}>
        {isLoading ? "Generating Circuit..." : "Generate Circuit"}
      </button>
    </form>
  );
};

export default CircuitForm;
