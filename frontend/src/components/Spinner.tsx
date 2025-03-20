import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="spinner">
      <div className="spinner-circle"></div>
      <span className="spinner-text">Loading... (might take ~ 10s)</span>
    </div>
  );
};

export default Spinner;
