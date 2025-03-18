import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CircuitData } from "../types";
import { CircuitRenderer, config } from "./CircuitRenderer";

interface CircuitVisualizationProps {
  width?: number;
  height?: number;
  circuitData?: CircuitData;
}

const CircuitVisualization: React.FC<CircuitVisualizationProps> = ({
  width = config.dimensions.width,
  height = config.dimensions.height,
  circuitData,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rendererRef = useRef<CircuitRenderer | null>(null);

  useEffect(() => {
    const loadSymbols = async () => {
      const spriteSheet = await d3.xml("/svg/symbol-sheet.svg");
      const defs = spriteSheet.documentElement.querySelector("defs");
      if (defs && svgRef.current) {
        svgRef.current.appendChild(defs.cloneNode(true));
      }
    };

    // Initialize the renderer
    const initializeRenderer = async () => {
      await loadSymbols();

      // Clear any existing content
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }

      // Create new renderer
      rendererRef.current = new CircuitRenderer();
    };

    initializeRenderer();

    // Cleanup function
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect for rendering circuit data
  useEffect(() => {
    if (circuitData && rendererRef.current) {
      rendererRef.current.render(circuitData);
    }
  }, [circuitData]); // Re-render when circuitData changes

  return (
    <div className="circuit-visualization" style={{ width, height }}>
      <svg
        ref={svgRef}
        id="d3-svg"
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
