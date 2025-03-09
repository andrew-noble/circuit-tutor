import circuitData from "./ex-circ.js";

//this file takes a json circuit representation (list of components, list of nets)
// and returns a simple array of components augmented with positions
//in preparation for rendering via d3 in index.js

//input: json from llm, format: {components[], nets[], labels[]}
//output: json, format (for now): [component{...component, position: {x, y}}]
//the output order matters for rendering the traces correctly. The
//algo runs around the circuit starting with voltage source

//ASSUMPTIONS (this is an mvp, suitable only for very simple circuits)
//there is only one voltage source
//there is only one level of nesting, i.e. you can either have a resistor in series
//with the voltage source or two resistors in parallel

const circuit = circuitData;

export default function layout(circuit) {
  console.log("Layout function called with circuit:", circuit);
  const { components, nets, labels } = circuit;

  const layout = [];

  //note: all this find usage will need to change, the find usage is central to
  //the simplification assumptions we're making

  //find the voltage source (assume one, for now)
  const vs = components.find((c) => c.type === "voltage_source");
  console.log("Found voltage source:", vs);
  const vsPosition = { x: 0, y: 0 }; //init to 0,0 by default

  layout.push({ ...vs, position: vsPosition }); //tack on position and push to list

  //find the net that vs+ is connected to
  const vsPlusNet = nets.find((n) =>
    n.connections.some((c) => c.component === vs.id && c.pin === "+")
  );

  console.log("Found vs+ net:", vsPlusNet);

  let prevComponent = vs;
  let currentNet = vsPlusNet;

  //x tracks our horizontal position, we're drawing our components across the screen.
  for (let x = 0; x < nets.length - 1; x++) {
    //we know last net is connected to vs-/ground, so stop short
    console.log(
      `Processing net at position ${x}, connections:`,
      currentNet?.connections?.length
    );

    if (!currentNet) {
      console.log("Current net is undefined, breaking loop");
      break;
    }

    if (currentNet.connections.length === 2) {
      //LAYOUT SERIES COMPONENT
      //this net is connected to one resistor/component
      console.log("Found series component connection");
      const component = components.find(
        (comp) =>
          comp.id ===
          currentNet.connections.find(
            (conn) => conn.component !== prevComponent.id
          )
      );
      console.log("Series component:", component);
      const componentPosition = { x: x + 1, y: 0 }; //then place component 1 unit to right
      layout.push({ ...component, position: componentPosition }); //store
    } else if (currentNet.connections.length === 3) {
      //LAYOUT PARALLEL COMPONENT
      //this net is connected to two resistors/components, lets place it deterministically in parallel
      console.log("Found parallel component connection");

      const componentA = components.find(
        (comp) =>
          comp.id ===
          currentNet.connections.find(
            //finds first parallel component (filter out upstream comp)
            (c) => c.component !== prevComponent.id
          ).component
      );
      console.log("Parallel component A:", componentA);

      const componentB = components.find(
        (comp) =>
          comp.id ===
          currentNet.connections.find(
            //finds second parallel component (filter out A and upstream comp)
            (c) => c.component !== vs.id && c.component !== componentA.component
          ).component
      );
      console.log("Parallel component B:", componentB);

      const componentAPosition = { x: x + 1, y: 1 }; //arrange the two in simple parallel arrangement
      const componentBPosition = { x: x + 1, y: -1 };
      layout.push({ ...componentA, position: componentAPosition }); //store
      layout.push({ ...componentB, position: componentBPosition });
    }

    // Need to update currentNet for the next iteration
    // This was missing in the original code
    // Find the next net connected to the current component
    // This is a simplified approach and may need refinement
    prevComponent = layout[layout.length - 1]; //works fine for parallel, btw
    currentNet = nets.find(
      (n) =>
        n.id !== currentNet.id &&
        n.connections.some((c) => c.component === prevComponent.component)
    );
  }

  console.log("Final layout:", layout);
  return layout;
}

// For testing/debugging - this will log the layout result to the console
// but won't interfere with importing this function in other files
if (typeof window !== "undefined") {
  console.log("Browser environment detected, logging layout result");
  layout(circuit);
} else {
  console.log("Node environment detected, logging layout result");
  layout(circuit);
}
