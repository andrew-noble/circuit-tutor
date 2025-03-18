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
  } as const,
  dimensions: {
    width: 1000,
    height: 400,
  },
  scales: {
    x: { min: 0, max: 8 },
    y: { min: -2, max: 2 },
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
    return d3
      .scaleLinear()
      .domain([config.scales.x.min, config.scales.x.max])
      .range([0, width]);
  }

  private createYScale(height: number) {
    return d3
      .scaleLinear()
      .domain([config.scales.y.min, config.scales.y.max])
      .range([height, 0]);
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
    yOffset: number = 100
  ): string {
    return `M ${start.x} ${start.y} 
            L ${start.x + 50} ${start.y} 
            L ${start.x + 50} ${start.y + yOffset} 
            L ${end.x - 50} ${start.y + yOffset}
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
    componentGroups
      .append("rect")
      .attr("width", config.componentSize)
      .attr("height", config.componentSize)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-dasharray", "2,2");

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
    const [componentId, pinId] = connection;
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

      return this.createFinishPathData(netPos, v1LeftPoint);
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

  public render(circuitData: CircuitData): void {
    this.renderComponents(circuitData);
    this.renderNets(circuitData);
  }
}
