import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CircuitVisualization from "./viz/CircuitVisualization";
import CircuitButtons from "./generation/CircuitButtons";
import CircuitGeneratorForm from "./generation/GeneratorForm";
import Tutor from "./tutor/Tutor";
import type { CircuitData } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MainPage: React.FC = () => {
  const [circuitData, setCircuitData] = useState<CircuitData | undefined>();
  const [showCircuitGeneratorForm, setShowCircuitGeneratorForm] =
    useState(false);

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/voltage-divider`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCircuitData(data);
      } catch (error) {
        console.error("Failed to fetch circuit:", error);
      }
    };

    fetchCircuit();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>Circuit Tutor</h1>
        <div className="header-links">
          <a
            href="https://www.loom.com/share/f82e56015c594f72849e23723d4216f8?sid=39a86c84-54e2-4c5b-80b3-c54f8b8ae4cb"
            className="info-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Loom Demo
          </a>

          <a
            href="https://forms.gle/xwDaoUbPF7cm1FmcA"
            className="info-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Form for Feedback
          </a>
          <Link to="/info" className="info-link">
            Info
          </Link>
        </div>
      </div>

      <CircuitButtons onCircuitReceived={setCircuitData} />

      {showCircuitGeneratorForm && (
        <CircuitGeneratorForm onCircuitReceived={setCircuitData} />
      )}

      {circuitData && <CircuitVisualization circuitData={circuitData} />}

      <Tutor circuitData={circuitData} />
      <button
        className="generator-button"
        onClick={() => setShowCircuitGeneratorForm((prev) => !prev)}
      >
        Text-to-Circuit Generation (beta)
      </button>
    </div>
  );
};

export default MainPage;
