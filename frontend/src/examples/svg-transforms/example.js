import * as d3 from "d3";
import {
  createSvg,
  createTransformableElement,
} from "../../utils/svg/index.js";

/**
 * Initialize the example
 */
export function initExample() {
  // Create the main SVG canvas
  const svg = createSvg("#app", 800, 600);

  // Define some sprites in defs section
  const defs = svg.append("defs");

  // Create a resistor symbol
  defs
    .append("symbol")
    .attr("id", "resistor")
    .attr("viewBox", "0 0 100 30")
    .append("path")
    .attr("d", "M0,15 H20 L25,5 L35,25 L45,5 L55,25 L65,5 L75,25 L80,15 H100")
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("fill", "none");

  // Create a capacitor symbol
  defs
    .append("symbol")
    .attr("id", "capacitor")
    .attr("viewBox", "0 0 100 30")
    .append("g")
    .call((g) => {
      g.append("path")
        .attr("d", "M0,15 H40")
        .attr("stroke", "black")
        .attr("stroke-width", "2");
      g.append("path")
        .attr("d", "M40,0 V30")
        .attr("stroke", "black")
        .attr("stroke-width", "2");
      g.append("path")
        .attr("d", "M60,0 V30")
        .attr("stroke", "black")
        .attr("stroke-width", "2");
      g.append("path")
        .attr("d", "M60,15 H100")
        .attr("stroke", "black")
        .attr("stroke-width", "2");
    });

  // Create a voltage source symbol
  defs
    .append("symbol")
    .attr("id", "voltage-source")
    .attr("viewBox", "0 0 100 100")
    .append("g")
    .call((g) => {
      g.append("circle")
        .attr("cx", "50")
        .attr("cy", "50")
        .attr("r", "40")
        .attr("stroke", "black")
        .attr("stroke-width", "2")
        .attr("fill", "none");
      g.append("text")
        .attr("x", "50")
        .attr("y", "55")
        .attr("text-anchor", "middle")
        .attr("font-size", "24")
        .text("V");
    });

  // Create a resistor with positioning but no draggable/rotatable functionality
  const resistor = createTransformableElement(svg, "#resistor", 100, 30, {
    x: 100,
    y: 100,
    // draggable: true,  // Commented out
    // rotatable: true   // Commented out
  });

  // Create a capacitor with positioning only
  const capacitor = createTransformableElement(svg, "#capacitor", 100, 30, {
    x: 300,
    y: 100,
    // draggable: true   // Commented out
  });

  // Create a voltage source with initial rotation but no interactive features
  const voltageSource = createTransformableElement(
    svg,
    "#voltage-source",
    80,
    80,
    {
      x: 200,
      y: 250,
      rotation: 45,
      // draggable: true,  // Commented out
      // rotatable: true   // Commented out
    }
  );

  // Add buttons to demonstrate programmatic transformation
  const controlsDiv = d3
    .select("body")
    .append("div")
    .attr("class", "controls")
    .style("margin-top", "10px");

  controlsDiv
    .append("button")
    .text("Rotate Resistor 45°")
    .on("click", () => {
      resistor.transform.rotate(45).apply();
    });

  controlsDiv
    .append("button")
    .style("margin-left", "10px")
    .text("Move Capacitor Right")
    .on("click", () => {
      capacitor.transform.translate(20, 0).apply();
    });

  controlsDiv
    .append("button")
    .style("margin-left", "10px")
    .text("Reset Voltage Source")
    .on("click", () => {
      voltageSource.transform.reset().setTranslate(200, 250).apply();
    });

  // Return the created elements for further manipulation if needed
  return {
    svg,
    resistor,
    capacitor,
    voltageSource,
  };
}

// Auto-initialize if this script is loaded directly
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    // Check if the app container exists
    if (document.getElementById("app")) {
      initExample();
    }
  });
}
