import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import generateLayout from "./generateLayout.js";
import circuitData from "./ex-circ.js";

const padding = { top: 40, right: 40, bottom: 40, left: 40 };

const width = 800 - padding.left - padding.right;
const height = 800 - padding.top - padding.bottom;

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
const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
const yScale = d3.scaleLinear().domain([-2, 2]).range([height, 0]); //range reversed bc y dir is down in web

const gx = svg
  .append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height / 2})`) //translate to bottom of svg
  .call(d3.axisBottom(xScale));

const gy = svg
  .append("g")
  .classed("y-axis", true)
  .attr("transform", `translate(0, 0)`) //translate to bottom of svg
  .call(d3.axisLeft(yScale));
//----------------

async function loadSymbols() {
  const spriteSheet = await d3.xml("/svg/symbol-sheet.svg");
  const defs = spriteSheet.documentElement.querySelector("defs"); //target defs section in the symbol sprite sheet
  svg.append("defs").node().appendChild(defs.cloneNode(true)); //inject defs section in this document
}

function renderCircuit(circuitData) {
  const layout = generateLayout(circuitData); //generate layout

  // Map component types to symbol IDs
  const typeToSymbol = {
    resistor: "#resistor",
    voltage_source: "#voltage-source",
    diode: "#diode",
  };

  //create a group for the components
  const componentGroup = svg
    .append("g")
    .classed("components", true)
    .selectAll("use")
    .data(layout)
    .join("use")
    .attr("xlink:href", (d) => typeToSymbol[d.type]) // Map component type to symbol ID
    // .attr("x", (d) => xScale(d.position.x + 1) - 50) //the + 1 is to just translate everything away from the left margin
    // .attr("y", (d) => yScale(d.position.y) - 50) //the -50 is to move per the 100x100 symbol's center (hardcoded yikes)

    .attr("width", 100)
    .attr("height", 100)
    .attr("transform", `translate(${d.position.x + 1}, ${d.position.y})`)
    //add a debugging border
    .classed("debug-border", true);

  //create a group for the nets (no net data though yet)
  const netGroup = svg.append("g").classed("nets", true);
}

loadSymbols();
renderCircuit(circuitData);
