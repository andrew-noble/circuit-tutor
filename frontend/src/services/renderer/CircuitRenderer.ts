import * as d3 from "d3";
import { CircuitData } from "../../types";
import { ScaleManager } from "./ScaleManager";
import { ComponentRenderer } from "./ComponentRenderer";
import { NetRenderer } from "./NetRenderer";
import { rendererConfig } from "./config";

export class CircuitRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private scaleManager: ScaleManager;
  private componentRenderer: ComponentRenderer;
  private netRenderer: NetRenderer;

  constructor(svgElement: SVGSVGElement) {
    // Initialize scale manager
    this.scaleManager = new ScaleManager(
      rendererConfig.dimensions,
      rendererConfig.padding
    );

    // Calculate dimensions
    const { width, height } = this.scaleManager.calculateDimensions();

    // Initialize SVG
    this.svg = this.initializeSVG(svgElement, width, height);

    // Initialize renderers
    this.componentRenderer = new ComponentRenderer(
      this.svg,
      this.scaleManager,
      rendererConfig.component
    );

    this.netRenderer = new NetRenderer(
      this.svg,
      this.scaleManager,
      this.componentRenderer,
      rendererConfig.component.componentSize
    );
  }

  private initializeSVG(
    svgElement: SVGSVGElement,
    width: number,
    height: number
  ): d3.Selection<SVGGElement, unknown, null, undefined> {
    // Load the symbol sheet svg and append the defs to the main svg
    d3.xml("/svg/symbol-sheet.svg").then((svg) => {
      const defs = svg.documentElement.querySelector("defs");
      if (defs) {
        svgElement.appendChild(defs.cloneNode(true));
      }
    });

    return d3
      .select(svgElement)
      .attr(
        "width",
        width + rendererConfig.padding.left + rendererConfig.padding.right
      )
      .attr(
        "height",
        height + rendererConfig.padding.top + rendererConfig.padding.bottom
      )
      .append("g")
      .attr("id", "d3-g")
      .attr(
        "transform",
        `translate(${rendererConfig.padding.left}, ${rendererConfig.padding.top})`
      );
  }

  public render(circuitData: CircuitData): void {
    this.clear();
    this.scaleManager.updateScalesToCircuit(circuitData);
    this.componentRenderer.render(circuitData.components);
    this.netRenderer.render(circuitData);
  }

  public clear(): void {
    this.svg.selectAll("*").remove();
  }
}
