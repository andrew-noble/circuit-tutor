import React from "react";
import "./Spinner.css";

const Spinner: React.FC = () => {
  return (
    <div className="spinner">
      <div className="spinner-circle"></div>
      <span className="spinner-text">Loading...</span>
    </div>
  );
};

export default Spinner;
