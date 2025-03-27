import React, { useState } from "react";
import TutorForm from "./TutorForm";
import TutorResponse from "./TutorResponse";
import type { CircuitData } from "../../types";

interface TutorProps {
  circuitData: CircuitData | undefined;
}

const Tutor: React.FC<TutorProps> = ({ circuitData }) => {
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

export default Tutor;
