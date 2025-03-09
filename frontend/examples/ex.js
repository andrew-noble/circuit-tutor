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

//make random data of random lenth, for demo
export function randomizeData() {
  const data = [];
  // Random number of data points between 5 and 20
  const numPoints = Math.floor(Math.random() * 16) + 5;
  for (let i = 0; i < numPoints; i++) {
    data.push({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      id: i, // Adding an id to help with data joining
    });
  }
  return data;
}

export function plotData(data) {
  // Using the modern join approach with only enter/exit animations
  svg
    .selectAll("circle") //1 this step instantiates a selection object targeting circles within the svg container, none of which exist yet (this is the confusing bit)
    .data(data) //2 this step binds the data to the (empty) selection object
    .join("circle") //3 this step creates a circle for each item in the data array, associating a piece of data with
    //4 the below code gets run for each item in the selection
    .attr("cx", (d) => xScale(d.x)) //passing d.x to xScale maps it from data value -> presentation scale
    .attr("cy", (d) => yScale(d.y)) //because we want to be able to have different sized plots of the same data
    .attr("r", 5);
}

//the above is equivalent to this:!!
// const selection1 = svg.selectAll("circle");
// const selection2 = selection1.data(data);
// const selection3 = selection2.join("circle");
// const selection4 = selection3.attr("cx", (d) => x(d.x));
// // etc.

// passing a little randomizer button handler to show how this works.
window.handleButtonClick = function () {
  plotData(randomizeData());
};
