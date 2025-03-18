import * as d3 from "d3";

interface Position {
  x: number;
  y: number;
}

interface ComponentData {
  id: string;
  type: string;
  position: Position;
  [key: string]: any;
}

interface NetData {
  id: string;
  name: string;
  connections: [string, string][];
  position: Position;
}

interface CircuitData {
  components: ComponentData[];
  nets: NetData[];
  [key: string]: any;
}

const padding = { top: 40, right: 40, bottom: 40, left: 150 };

const width = 1000 - padding.left - padding.right;
const height = 400 - padding.top - padding.bottom;

//this makes an svg, then puts a group wrapper under it that is
//slightly smaller, making a padding effect and preventing stuff
// from getting rendered outside the svg, invisibly
const svg = d3
  .select("#d3-svg")
  .attr("width", width + padding.left + padding.right)
  .attr("height", height + padding.top + padding.bottom)
  .append("g")
  .attr("id", "d3-g")
  .attr("transform", `translate(${padding.left}, ${padding.top})`);

//SET UP AXES-------
// domain is data-based (like 0-100%), range is pixel based (like 0-400px).
// I suspect range will need to be dynamic based on responsivity
const xScale = d3.scaleLinear().domain([0, 8]).range([0, width]);
const yScale = d3.scaleLinear().domain([-2, 2]).range([height, 0]); //range reversed bc y dir is down in web

// const gx = svg
//   .append("g")
//   .classed("x-axis", true)
//   .attr("transform", `translate(0, ${height / 2})`) //translate to bottom of svg
//   .call(d3.axisBottom(xScale));

//don't need y axis right now
// const gy = svg
//   .append("g")
//   .classed("y-axis", true)
//   .attr("transform", `translate(0, 0)`) //translate to bottom of svg
//   .call(d3.axisLeft(yScale));
//----------------

async function loadSymbols(): Promise<void> {
  const spriteSheet = await d3.xml("/svg/symbol-sheet.svg");
  const defs = spriteSheet.documentElement.querySelector("defs"); //target defs section in the symbol sprite sheet
  if (defs) {
    svg.node()?.appendChild(defs.cloneNode(true)); //inject defs section in this document
  }
}

async function fetchCircuitData(): Promise<CircuitData> {
  const response = await fetch("ex-circ.json");
  const data = await response.json();
  return data;
}

function getComponentConnectionPoint(
  component: ComponentData,
  isSource: boolean // true if this component is the source (right side/pin), false if target (left side/pin)
): { x: number; y: number } {
  const componentX = xScale(component.position.x);
  const componentY = yScale(component.position.y);

  // Assuming components are 100x100 pixels
  const offsetX = isSource ? 50 : -50; // Connect to right (+50) or left (-50) edge

  return {
    x: componentX + offsetX,
    y: componentY,
  };
}

function renderCircuit(circuitData: CircuitData): void {
  // Map component types to symbol IDs
  const typeToSymbol: Record<string, string> = {
    resistor: "#resistor",
    voltage_source: "#voltage-source",
    diode: "#diode",
  };

  //create a group for the components
  const componentGroups = svg
    .append("g")
    .classed("components", true)
    .selectAll("use")
    .data(circuitData.components)
    .join("g")
    .classed("component", true)
    .attr(
      "transform",
      (d) =>
        `translate(${xScale(d.position.x) - 50}, ${yScale(d.position.y) - 50})`
    );

  // //debug rect, can remove later
  // componentGroups
  //   .append("rect")
  //   .attr("width", 100)
  //   .attr("height", 100)
  //   .attr("fill", "rgba(255,0,0,0.3)");

  //add symbols
  componentGroups
    .append("use")
    .attr("xlink:href", (d) => typeToSymbol[d.type] || "")
    .attr("width", 100)
    .attr("height", 100);

  //create a group for the nets
  const netGroups = svg
    .append("g")
    .classed("nets", true)
    .selectAll("use")
    .data(circuitData.nets)
    .join("g")
    .classed("net", true);

  // //create a circle for the net "hub" location for debug
  // netGroups
  //   .append("circle")
  //   .attr("r", 5)
  //   .attr(
  //     "transform",
  //     (d) => `translate(${xScale(d.position.x)}, ${yScale(d.position.y)})`
  //   )
  //   .attr("fill", "black");

  // Create paths for each connection in the net
  netGroups.each((netData, i, nodes) => {
    const group = d3.select(nodes[i]);
    const isLastNet = i === circuitData.nets.length - 1;

    // Select all paths (none exist yet) and bind connection data
    group
      .selectAll("path")
      .data(netData.connections)
      .join("path")
      .attr("d", (connection) => {
        const [componentId, pinId] = connection;
        const component = circuitData.components.find(
          (c) => c.id === componentId
        );

        if (!component) return "";

        const isSource = component.position.x < netData.position.x;
        const connectionPoint = getComponentConnectionPoint(
          component,
          isSource
        );
        const netX = xScale(netData.position.x);
        const netY = yScale(netData.position.y);

        // Use special routing for the last net's connection to V1
        if (isLastNet && componentId === "V1") {
          // For V1, we want to connect to its left side regardless of position
          const v1X = xScale(component.position.x);
          const v1Y = yScale(component.position.y);
          const v1LeftPoint = {
            x: v1X - 50, // Left side of V1
            y: v1Y,
          };

          return createFinishPathData(netX, netY, v1LeftPoint.x, v1LeftPoint.y);
        }

        if (isSource) {
          // Component is on left, draw from component's right side to net hub
          return createManhattanPathData(
            connectionPoint.x,
            connectionPoint.y,
            netX,
            netY
          );
        } else {
          // Component is on right, draw from net hub to component's left side
          return createManhattanPathData(
            netX,
            netY,
            connectionPoint.x,
            connectionPoint.y
          );
        }
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none");
  });
}

const createManhattanPathData = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  midpoint?: number // optional parameter to control where the path bends
): string => {
  // If midpoint is not provided, use the halfway point
  const xMid = midpoint ?? x1 + (x2 - x1) / 2;

  // Return just the path data string
  return `M ${x1} ${y1} L ${xMid} ${y1} L ${xMid} ${y2} L ${x2} ${y2}`;
};

const createFinishPathData = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  yOffset: number = 100 // How far up/down to route the path
): string => {
  // For the finish path, we'll go:
  // 1. Right from the component
  // 2. Up/down to clear other components
  // 3. All the way left past all components
  // 4. Back to original y-level
  // 5. To final destination
  return `M ${x1} ${y1} 
          L ${x1 + 50} ${y1} 
          L ${x1 + 50} ${y1 + yOffset} 
          L ${x2 - 50} ${y1 + yOffset}
          L ${x2 - 50} ${y2}
          L ${x2} ${y2}`.replace(/\s+/g, " ");
};

loadSymbols();

(async () => {
  const circuit = await fetchCircuitData();
  console.log(circuit);
  renderCircuit(circuit);
})();
