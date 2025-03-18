import * as d3 from "d3";
import { CircuitData, Position } from "../../types";

export interface Bounds {
  x: { min: number; max: number };
  y: { min: number; max: number };
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class ScaleManager {
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private dimensions: Dimensions;
  private padding: Padding;

  constructor(dimensions: Dimensions, padding: Padding) {
    this.dimensions = dimensions;
    this.padding = padding;

    const { width, height } = this.calculateDimensions();

    this.xScale = this.createXScale(width);
    this.yScale = this.createYScale(height);
  }

  public calculateDimensions(): Dimensions {
    const width =
      this.dimensions.width - this.padding.left - this.padding.right;
    const height =
      this.dimensions.height - this.padding.top - this.padding.bottom;
    return { width, height };
  }

  private createXScale(width: number): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, 8]).range([0, width]); // Default domain
  }

  private createYScale(height: number): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([-4, 4]).range([height, 0]); // Default domain
  }

  //theoretically this should change the d3 scales dynamically with circuit size
  public updateScalesToCircuit(circuitData: CircuitData): void {
    const bounds = this.calculateCircuitBounds(circuitData);
    this.xScale.domain([bounds.x.min, bounds.x.max]);
    this.yScale.domain([bounds.y.min, bounds.y.max]);
  }

  public calculateCircuitBounds(circuitData: CircuitData): Bounds {
    const allPositions = [
      ...circuitData.components.map((c) => c.position),
      ...circuitData.nets.map((n) => n.position),
    ];

    const buffer = 2; // Add a buffer of 2 circuit units
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

  // Convert circuit coordinates to SVG coordinates
  public scaleX(x: number): number {
    return this.xScale(x);
  }

  public scaleY(y: number): number {
    return this.yScale(y);
  }

  // Scale a position object
  public scalePosition(position: Position): Position {
    return {
      x: this.scaleX(position.x),
      y: this.scaleY(position.y),
    };
  }

  // Getters
  public getXScale(): d3.ScaleLinear<number, number> {
    return this.xScale;
  }

  public getYScale(): d3.ScaleLinear<number, number> {
    return this.yScale;
  }

  public getPadding(): Padding {
    return this.padding;
  }
}
