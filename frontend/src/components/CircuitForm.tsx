import React, { useState } from "react";
import type { CircuitData } from "../types";
import Spinner from "./Spinner";
import "../styles/forms.css";

interface CircuitFormProps {
  onCircuitReceived: (circuit: CircuitData) => void;
}

const CIRCUIT_SUGGESTIONS = [
  "Simple voltage divider with two resistors",
  "Simple current divider with two resistors",
  "Design an RC low-pass filter",
  "Make a basic LED circuit with current-limiting resistor",
  "Build a simple RLC circuit",
];

const CircuitForm: React.FC<CircuitFormProps> = ({ onCircuitReceived }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/generate-circuit", {
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

  const handleSuggestionClick = async (suggestion: string) => {
    setPrompt(suggestion);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/generate-circuit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: suggestion }),
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
      <div className="suggestion-buttons">
        {CIRCUIT_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
            className="suggestion-button"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="circuit-form">
        <div className="form-group">
          <label htmlFor="circuit-prompt">
            Describe the circuit you want to create:
          </label>
          <textarea
            id="circuit-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a voltage divider with two resistors one 1kOhm and the other 2kOhm"
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

export default CircuitForm;
