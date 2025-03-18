import * as d3 from "d3";
import { ComponentData, Position } from "../../types";
import { ScaleManager } from "./ScaleManager";

export interface ComponentConfig {
  componentSize: number;
  symbolMap: Record<string, string>;
}

export class ComponentRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private scaleManager: ScaleManager;
  private config: ComponentConfig;

  constructor(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    scaleManager: ScaleManager,
    config: ComponentConfig
  ) {
    this.svg = svg;
    this.scaleManager = scaleManager;
    this.config = config;
  }

  public getComponentConnectionPoint(
    component: ComponentData,
    isSource: boolean
  ): Position {
    const componentX = this.scaleManager.scaleX(component.position.x);
    const componentY = this.scaleManager.scaleY(component.position.y);
    const offsetX = isSource
      ? this.config.componentSize / 2
      : -this.config.componentSize / 2;

    return {
      x: componentX + offsetX,
      y: componentY,
    };
  }

  public render(components: ComponentData[]): void {
    const componentGroups = this.svg
      .append("g") // Overall group for all circuit component SVGs
      .classed("components", true)
      .selectAll<SVGGElement, ComponentData>("g")
      .data(components)
      .join("g")
      .classed("component", true)
      .attr(
        "transform",
        (d) =>
          `translate(${
            this.scaleManager.scaleX(d.position.x) -
            this.config.componentSize / 2
          }, ${
            this.scaleManager.scaleY(d.position.y) -
            this.config.componentSize / 2
          })`
      );

    // Add the symbol references with proper scaling
    componentGroups
      .append("use")
      .attr(
        "xlink:href",
        (d: ComponentData) =>
          this.config.symbolMap[d.type as keyof typeof this.config.symbolMap] ||
          ""
      )
      .attr("width", this.config.componentSize)
      .attr("height", this.config.componentSize);

    // Add ID annotation
    componentGroups
      .append("text")
      .attr("x", this.config.componentSize / 2) // Centered within the component
      .attr("y", -5) // Directly above the component
      .attr("text-anchor", "middle")
      .text((d: ComponentData) => d.id);

    // Add value annotation
    componentGroups
      .append("text")
      .attr("x", this.config.componentSize / 2) // Centered within the component
      .attr("y", this.config.componentSize + 5) // Directly below the component
      .attr("text-anchor", "middle")
      .text((d: ComponentData) => d.value);
  }
}
