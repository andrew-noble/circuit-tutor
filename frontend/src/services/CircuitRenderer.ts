import * as d3 from "d3";
import type { ValueFn } from "d3";
import { Position, ComponentData, NetData, CircuitData } from "../types";

export const config = {
  padding: { top: 40, right: 40, bottom: 40, left: 150 },
  componentSize: 100,
  symbolMap: {
    resistor: "#resistor",
    voltage_source: "#voltage-source",
    diode: "#diode",
    inductor: "#inductor",
    capacitor: "#capacitor",
  } as const,
  dimensions: {
    width: 1000,
    height: 600,
  },
};

export class CircuitRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number>;

  constructor(svgElement: SVGSVGElement) {
    const { width, height } = this.calculateDimensions();

    this.svg = this.initializeSVG(svgElement, width, height);
    this.xScale = this.createXScale(width);
    this.yScale = this.createYScale(height);
  }

  private calculateDimensions() {
    const width =
      config.dimensions.width - config.padding.left - config.padding.right;
    const height =
      config.dimensions.height - config.padding.top - config.padding.bottom;
    return { width, height };
  }

  private initializeSVG(
    svgElement: SVGSVGElement,
    width: number,
    height: number
  ) {
    //load the symbol sheet svg and append the defs to the main svg
    d3.xml("/svg/symbol-sheet.svg").then((svg) => {
      const defs = svg.documentElement.querySelector("defs");
      if (defs) {
        svgElement.appendChild(defs.cloneNode(true));
      }
    });

    return d3
      .select(svgElement)
      .attr("width", width + config.padding.left + config.padding.right)
      .attr("height", height + config.padding.top + config.padding.bottom)
      .append("g")
      .attr("id", "d3-g")
      .attr(
        "transform",
        `translate(${config.padding.left}, ${config.padding.top})`
      );
  }

  private createXScale(width: number) {
    return d3.scaleLinear().domain([0, 8]).range([0, width]); //sensible default range bc we don't have circuit data yet
  } //note domain is the circuit units, range is svg pixel units that circuit units are mapped to

  private createYScale(height: number) {
    return d3.scaleLinear().domain([-4, 4]).range([height, 0]);
  }

  private updateScalesToCircuit(circuitData: CircuitData) {
    const bounds = this.calculateCircuitBounds(circuitData);
    this.xScale.domain([bounds.x.min, bounds.x.max]);
    this.yScale.domain([bounds.y.min, bounds.y.max]);
  }

  private getComponentConnectionPoint(
    component: ComponentData,
    isSource: boolean
  ): Position {
    const componentX = this.xScale(component.position.x);
    const componentY = this.yScale(component.position.y);
    const offsetX = isSource
      ? config.componentSize / 2
      : -config.componentSize / 2;

    return {
      x: componentX + offsetX,
      y: componentY,
    };
  }

  private createManhattanPathData(
    start: Position,
    end: Position,
    midpoint?: number
  ): string {
    const xMid = midpoint ?? start.x + (end.x - start.x) / 2;
    return `M ${start.x} ${start.y} L ${xMid} ${start.y} L ${xMid} ${end.y} L ${end.x} ${end.y}`;
  }

  private createFinishPathData(
    start: Position,
    end: Position,
    circuitData: CircuitData
  ): string {
    // Find the lowest component in circuit coordinates
    const lowestComponentY = Math.min(
      ...circuitData.components.map((c) => c.position.y)
    );

    // Convert to pixel coordinates and add pixel offset
    const pixelOffset = 50; // pixels below the lowest component
    const lowestPixelY =
      this.yScale(lowestComponentY) + config.componentSize / 2 + pixelOffset;

    // Calculate the vertical distance the path needs to travel
    const pathYOffset = lowestPixelY - start.y;

    return `M ${start.x} ${start.y} 
            L ${start.x + 50} ${start.y} 
            L ${start.x + 50} ${start.y + pathYOffset} 
            L ${end.x - 50} ${start.y + pathYOffset}
            L ${end.x - 50} ${end.y}
            L ${end.x} ${end.y}`.replace(/\s+/g, " ");
  }

  private renderComponents(circuitData: CircuitData) {
    const componentGroups = this.svg
      .append("g") //overall group for all circuitcomponent svgs
      .classed("components", true)
      .selectAll<SVGGElement, ComponentData>("g")
      .data(circuitData.components)
      .join("g")
      .classed("component", true)
      .attr(
        "transform",
        (d) =>
          `translate(${this.xScale(d.position.x) - config.componentSize / 2}, 
                    ${this.yScale(d.position.y) - config.componentSize / 2})`
      );

    // Add the symbol references with proper scaling
    componentGroups
      .append("use")
      .attr(
        "xlink:href",
        (d: ComponentData) =>
          config.symbolMap[d.type as keyof typeof config.symbolMap] || ""
      )
      .attr("width", config.componentSize)
      .attr("height", config.componentSize);

    // Add debug rectangles
    // componentGroups
    //   .append("rect")
    //   .attr("width", config.componentSize)
    //   .attr("height", config.componentSize)
    //   .attr("fill", "none")
    //   .attr("stroke", "red")
    //   .attr("stroke-dasharray", "2,2");

    // // Add debug text to show component type and symbol being used
    // componentGroups
    //   .append("text")
    //   .attr("y", -config.componentSize / 2 - 5)
    //   .attr("text-anchor", "middle")
    //   .text((d: ComponentData) => {
    //     const symbolId =
    //       config.symbolMap[d.type as keyof typeof config.symbolMap] || "";
    //     return `${d.type} (${symbolId})`;
    //   });
  }

  private createConnectionPath(
    netData: NetData,
    isLastNet: boolean,
    circuitData: CircuitData,
    connection: [string, string]
  ): string {
    const [componentId, _pinId] = connection;
    const component = circuitData.components.find(
      (c: ComponentData) => c.id === componentId
    );

    if (!component) return "";

    const isSource = component.position.x < netData.position.x;
    const connectionPoint = this.getComponentConnectionPoint(
      component,
      isSource
    );
    const netPos = {
      x: this.xScale(netData.position.x),
      y: this.yScale(netData.position.y),
    };

    // Special case for the last connection back to V1
    if (isLastNet && componentId === "V1") {
      const v1X = this.xScale(component.position.x);
      const v1Y = this.yScale(component.position.y);
      const v1LeftPoint = {
        x: v1X - config.componentSize / 2,
        y: v1Y,
      };

      return this.createFinishPathData(netPos, v1LeftPoint, circuitData);
    }

    return isSource
      ? this.createManhattanPathData(connectionPoint, netPos)
      : this.createManhattanPathData(netPos, connectionPoint);
  }

  private renderNets(circuitData: CircuitData) {
    const netGroups = this.svg
      .append("g")
      .classed("nets", true)
      .selectAll<SVGGElement, NetData>("g")
      .data(circuitData.nets)
      .join("g")
      .classed("net", true);

    netGroups.each((netData: NetData, i: number) => {
      const isLastNet = i === circuitData.nets.length - 1;
      d3.select<SVGGElement, NetData>(netGroups.nodes()[i])
        .selectAll<SVGPathElement, [string, string]>("path")
        .data(netData.connections)
        .join("path")
        .attr("d", ((d: [string, string]) =>
          this.createConnectionPath(
            netData,
            isLastNet,
            circuitData,
            d
          )) as unknown as ValueFn<SVGPathElement, unknown, string>)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none");
    });

    return netGroups;
  }

  private calculateCircuitBounds(circuitData: CircuitData) {
    const allPositions = [
      ...circuitData.components.map((c) => c.position),
      ...circuitData.nets.map((n) => n.position),
    ];

    const buffer = 2; //add a buffer of 2 circuit units to
    const xExtent = d3.extent(allPositions, (p) => p.x);
    const yExtent = d3.extent(allPositions, (p) => p.y);

    return {
      x: {
        min: (xExtent[0] ?? 0) - buffer,
        max: (xExtent[1] ?? 0) + buffer,
      },
      y: {
        min: (yExtent[0] ?? 0) - buffer,
        max: (yExtent[1] ?? 0) + buffer,
      },
    };
  }

  public render(circuitData: CircuitData): void {
    this.clear();
    this.updateScalesToCircuit(circuitData);
    this.renderComponents(circuitData);
    this.renderNets(circuitData);
  }

  public clear(): void {
    this.svg.selectAll("*").remove();
  }
}
