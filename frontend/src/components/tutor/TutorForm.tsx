import React, { useState } from "react";
import type { CircuitData } from "../../types";
import Spinner from "../Spinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TutorFormProps {
  circuitData: CircuitData | undefined;
  onResponseReceived: (response: string) => void;
}

const TutorForm: React.FC<TutorFormProps> = ({
  circuitData,
  onResponseReceived,
}) => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!circuitData) {
      setError("No circuit data available. Please generate a circuit first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tutor-circuit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
          circuit_data: circuitData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onResponseReceived(data.tutor_response);
      setQuestion(""); // Clear the form after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tutor-form">
      <div className="form-group">
        <label htmlFor="tutor-question">
          Ask a question about the circuit:
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Examples: What is the voltage across R1? How can I calculate equivalent resistance of this circuit?"
          rows={3}
          disabled={isLoading || !circuitData}
          className="form-control"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button
        type="submit"
        disabled={isLoading || !question.trim() || !circuitData}
        className="form-button"
      >
        {isLoading ? <Spinner /> : "Ask Tutor"}
      </button>
    </form>
  );
};

export default TutorForm;
