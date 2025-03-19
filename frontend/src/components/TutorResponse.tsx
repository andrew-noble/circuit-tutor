import React from "react";

interface TutorResponseProps {
  response: string | null;
}

const TutorResponse: React.FC<TutorResponseProps> = ({ response }) => {
  console.log("TutorResponse received:", response);

  if (!response) {
    console.log("Response is null, not rendering");
    return null;
  }

  return (
    <div className="tutor-response">
      <h3>Tutor Response</h3>
      <div className="response-content">
        {response.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default TutorResponse;
