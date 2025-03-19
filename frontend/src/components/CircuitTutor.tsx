import React, { useState } from "react";
import TutorForm from "./TutorForm";
import TutorResponse from "./TutorResponse";
import type { CircuitData } from "../types";

interface CircuitTutorProps {
  circuitData: CircuitData | undefined;
}

const CircuitTutor: React.FC<CircuitTutorProps> = ({ circuitData }) => {
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);

  return (
    <div className="circuit-tutor">
      <h2>Circuit Tutor</h2>
      <TutorForm
        circuitData={circuitData}
        onResponseReceived={setTutorResponse}
      />
      <TutorResponse response={tutorResponse} />
    </div>
  );
};

export default CircuitTutor;
