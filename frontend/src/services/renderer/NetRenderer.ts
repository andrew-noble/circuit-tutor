import * as d3 from "d3";
import type { ValueFn } from "d3";
import { NetData, CircuitData, Position } from "../../types";
import { ScaleManager } from "./ScaleManager";
import { ComponentRenderer } from "./ComponentRenderer";

export class NetRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private scaleManager: ScaleManager;
  private componentRenderer: ComponentRenderer;
  private componentSize: number;

  constructor(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    scaleManager: ScaleManager,
    componentRenderer: ComponentRenderer,
    componentSize: number
  ) {
    this.svg = svg;
    this.scaleManager = scaleManager;
    this.componentRenderer = componentRenderer;
    this.componentSize = componentSize;
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
      this.scaleManager.scaleY(lowestComponentY) +
      this.componentSize / 2 +
      pixelOffset;

    // Calculate the vertical distance the path needs to travel
    const pathYOffset = lowestPixelY - start.y;

    return `M ${start.x} ${start.y} 
            L ${start.x + 50} ${start.y} 
            L ${start.x + 50} ${start.y + pathYOffset} 
            L ${end.x - 50} ${start.y + pathYOffset}
            L ${end.x - 50} ${end.y}
            L ${end.x} ${end.y}`.replace(/\s+/g, " ");
  }

  private createConnectionPath(
    netData: NetData,
    isLastNet: boolean,
    circuitData: CircuitData,
    connection: [string, string]
  ): string {
    const [componentId, _pinId] = connection;
    const component = circuitData.components.find((c) => c.id === componentId);

    if (!component) return "";

    const isSource = component.position.x < netData.position.x;
    const connectionPoint = this.componentRenderer.getComponentConnectionPoint(
      component,
      isSource
    );
    const netPos = {
      x: this.scaleManager.scaleX(netData.position.x),
      y: this.scaleManager.scaleY(netData.position.y),
    };

    // Special case for the last connection back to V1
    if (isLastNet && componentId === "V1") {
      const v1X = this.scaleManager.scaleX(component.position.x);
      const v1Y = this.scaleManager.scaleY(component.position.y);
      const v1LeftPoint = {
        x: v1X - this.componentSize / 2,
        y: v1Y,
      };

      return this.createFinishPathData(netPos, v1LeftPoint, circuitData);
    }

    return isSource
      ? this.createManhattanPathData(connectionPoint, netPos)
      : this.createManhattanPathData(netPos, connectionPoint);
  }

  public render(circuitData: CircuitData): void {
    const netGroups = this.svg
      .append("g")
      .classed("nets", true)
      .selectAll<SVGGElement, NetData>("g")
      .data(circuitData.nets)
      .join("g")
      .classed("net", true);

    netGroups.each((netData: NetData, i: number) => {
      const isLastNet = i === circuitData.nets.length - 1;
      const netGroup = d3.select<SVGGElement, NetData>(netGroups.nodes()[i]);

      // Add connection paths
      netGroup
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

      // Add black dot at net position
      const netPos = {
        x: this.scaleManager.scaleX(netData.position.x),
        y: this.scaleManager.scaleY(netData.position.y),
      };

      netGroup
        .append("circle")
        .attr("cx", netPos.x)
        .attr("cy", netPos.y)
        .attr("r", 4)
        .attr("fill", "black");

      // Add net name annotation
      netGroup
        .append("text")
        .attr("x", netPos.x)
        .attr("y", netPos.y - 8)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "bottom")
        .text(netData.id);
    });
  }
}
