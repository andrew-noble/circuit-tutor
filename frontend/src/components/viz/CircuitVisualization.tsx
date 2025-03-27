import React, { useEffect, useRef } from "react";
import { CircuitData } from "../../types";
import { CircuitRenderer, rendererConfig } from "../../services/renderer";

interface CircuitVisualizationProps {
  width?: number;
  height?: number;
  circuitData?: CircuitData;
}

const CircuitVisualization: React.FC<CircuitVisualizationProps> = ({
  width = rendererConfig.dimensions.width,
  height = rendererConfig.dimensions.height,
  circuitData,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rendererRef = useRef<CircuitRenderer | null>(null);

  //init effect - instantiate a renderer object
  useEffect(() => {
    const initializeRenderer = () => {
      if (!svgRef.current) return;

      try {
        rendererRef.current = new CircuitRenderer(svgRef.current);

        // Render initial data if available
        if (circuitData && rendererRef.current) {
          rendererRef.current.render(circuitData);
        }
      } catch (error) {
        console.error("Failed to initialize renderer:", error);
      }
    };

    initializeRenderer();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.clear();
        rendererRef.current = null;
      }
    };
  }, []);

  //rendering effect - rerender the circuit if the data changes
  useEffect(() => {
    if (circuitData && rendererRef.current) {
      rendererRef.current.render(circuitData);
    }
  }, [circuitData]);

  return (
    <div className="circuit-visualization" style={{ width, height }}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
        }}
      />
    </div>
  );
};

export default CircuitVisualization;
