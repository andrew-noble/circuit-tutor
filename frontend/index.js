import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import generateLayout from "./generateLayout.js";
import circuitData from "./ex-circ.js";

const padding = { top: 40, right: 40, bottom: 40, left: 80 };

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

async function loadSymbols() {
  const spriteSheet = await d3.xml("/svg/symbol-sheet.svg");
  const defs = spriteSheet.documentElement.querySelector("defs"); //target defs section in the symbol sprite sheet
  svg.append("defs").node().appendChild(defs.cloneNode(true)); //inject defs section in this document
}

const createSeriesTrace = (selection, x1, y1, x2, y2) => {
  return selection
    .append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2);
};

const createParallelTrace = (selection, x1, y1, x2, y2) => {
  return selection
    .append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2);
};

function renderCircuit(circuitData) {
  const layout = generateLayout(circuitData); //generate layout

  // Map component types to symbol IDs
  const typeToSymbol = {
    resistor: "#resistor",
    voltage_source: "#voltage-source",
    diode: "#diode",
  };

  //create a group for the components, then a group for
  const componentGroups = svg
    .append("g") //group for all symbols
    .classed("components", true)
    .selectAll("use")
    .data(layout)
    .join("g") //the <use> dom element is fiddly, so bind data to a <g> wrapper instead to each datapoint
    .classed("component", true)
    .attr(
      "transform",
      (d) =>
        `translate(${xScale(d.position.x) - 50}, ${yScale(d.position.y) - 50})` //50 to move wrt center
    );

  //debug rect, can remove later
  componentGroups
    .append("rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("fill", "rgba(255,0,0,0.3)");

  //add symbols
  componentGroups
    .append("use")
    .attr("xlink:href", (d) => typeToSymbol[d.type]) // Map component type to symbol ID
    .attr("width", 100)
    .attr("height", 100);

  //create a group for the nets (no net data though yet)
  const netGroup = svg.append("g").classed("nets", true);
}

loadSymbols();
renderCircuit(circuitData);
