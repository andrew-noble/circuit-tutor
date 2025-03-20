import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface TutorResponseProps {
  response: string | null;
}

const convertLatexDelimiters = (text: string): string => {
  if (!text) return "";

  // Convert block math delimiters from openAI \[\] to $$ that our parsing libs expect
  let converted = text.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, match) => `$$${match}$$`
  );

  // Convert inline math delimiters
  converted = converted.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, match) => `$${match}$`
  );

  return converted;
};

const TutorResponse: React.FC<TutorResponseProps> = ({ response }) => {
  if (!response) return null;

  const processedResponse = convertLatexDelimiters(response);
  // console.log("Processed response:", processedResponse);

  return (
    <div className="tutor-response">
      <h3>Tutor Response</h3>
      <div className="response-content">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {processedResponse}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default TutorResponse;
