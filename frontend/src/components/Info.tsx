import React from "react";
import { Link } from "react-router-dom";

const Info: React.FC = () => {
  return (
    <div className="info-page">
      <h1>About Circuit Tutor</h1>
      <div className="info-content">
        <p>
          Circuit Tutor is an interactive learning tool designed to help
          students understand basic circuit theory via visualization and
          feedback from an LLM.
        </p>
        <p>
          Currently, it only supports circuits with a single voltage source and
          resistors, inductors, capacitors, and diodes. It's a prototype for
          now, and I'd love to hear your{" "}
          <a href="https://forms.gle/xwDaoUbPF7cm1FmcA">suggestions</a> on
          features you'd like to see!
        </p>
        <p>You can also reach out directly via aknoble.andrew@gmail.com</p>
        <p> Made by Andrew. </p>
        <div className="social-links">
          <a href="https://github.com/andrew-noble">Github</a> |{" "}
          <a href="https://x.com/andrewrno">Twitter</a> |{" "}
          <a href="https://www.andrewnoble.me/">Website</a>
        </div>
        <hr />
        <Link to="/" className="back-link">
          Back to Circuit Tutor
        </Link>
      </div>
    </div>
  );
};

export default Info;
