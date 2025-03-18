import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CircuitData } from "../types";
import { CircuitRenderer, config } from "../services/CircuitRenderer";

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
      if (!svgRef.current) return;

      const spriteSheet = await d3.xml("/svg/symbol-sheet.svg");
      const defs = spriteSheet.documentElement.querySelector("defs");
      if (defs) {
        svgRef.current.appendChild(defs.cloneNode(true));
      }
    };

    const initializeRenderer = async () => {
      if (!svgRef.current) return;

      await loadSymbols();
      rendererRef.current = new CircuitRenderer(svgRef.current);

      if (circuitData) {
        rendererRef.current.render(circuitData);
      }
    };

    initializeRenderer();

    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, []);

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
