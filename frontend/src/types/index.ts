export interface Position {
  x: number;
  y: number;
}

export interface ComponentData {
  id: string;
  type: string;
  position: Position;
  [key: string]: any;
}

export interface NetData {
  id: string;
  name: string;
  connections: [string, string][];
  position: Position;
}

export interface CircuitData {
  components: ComponentData[];
  nets: NetData[];
  [key: string]: any;
}

// D3 specific types
export type D3Selection<T extends d3.BaseType, U = unknown> = d3.Selection<
  T,
  U,
  null,
  undefined
>;
export type D3GSelection = D3Selection<SVGGElement>;
export type D3PathSelection = D3Selection<SVGPathElement>;
