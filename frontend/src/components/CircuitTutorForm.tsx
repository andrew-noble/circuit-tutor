import React, { useState } from "react";
import TutorForm from "./TutorForm";
import TutorResponse from "./TutorResponse";
import type { CircuitData } from "../types";

interface CircuitTutorFormProps {
  circuitData: CircuitData | undefined;
}

const CircuitTutorForm: React.FC<CircuitTutorFormProps> = ({ circuitData }) => {
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);

  return (
    <div className="circuit-tutor">
      <TutorForm
        circuitData={circuitData}
        onResponseReceived={setTutorResponse}
      />
      <TutorResponse response={tutorResponse} />
    </div>
  );
};

export default CircuitTutorForm;
