import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p className="mb-4">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-2">{children}</li>,
          }}
        >
          {response}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default TutorResponse;
