import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import circuitData from "./example-circ.json" assert { type: "json" };

const padding = { top: 40, right: 40, bottom: 40, left: 40 };

const width = 800 - padding.left - padding.right;
const height = 800 - padding.top - padding.bottom;

const data = [5, 10, 15, 20, 25, 30, 35, 40, 50];

//this makes an svg, then puts a group wrapper under it that is
//slightly smaller, making a padding effect and preventing stuff
// from getting rendered outside the svg, invisibly
const svg = d3
  .select("#d3-svg")
  .attr("width", width + padding.left + padding.right)
  .attr("height", height + padding.top + padding.bottom)
  .append("g")
  .attr("transform", `translate(${padding.left}, ${padding.top})`);

// domain is data-based (like 0-100%), range is pixel based (like 0-400px).
// I suspect range will need to be dynamic based on responsivity
const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([-50, 50]).range([height, 0]); //range reversed bc y dir is down in web

const gx = svg
  .append("g")
  .attr("transform", `translate(0, ${height})`) //translate to bottom of svg
  .call(d3.axisBottom(xScale));

const gy = svg.append("g").call(d3.axisLeft(yScale));
