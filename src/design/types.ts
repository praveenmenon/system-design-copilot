export type Layer = "client"|"edge"|"gateway"|"service"|"async"|"data";
export type NodeKind =
  | "Client" | "CDN" | "APIGateway" | "Service" | "Workflow"
  | "Queue" | "Stream" | "Worker" | "Cache" | "Database" | "Search" | "ObjectStore" | "Auth";

export interface Node { id: string; kind: NodeKind; label: string; layer: Layer; meta?: Record<string,any>; }
export interface Edge { from: string; to: string; label?: string; protocol?: "HTTP"|"WS"|"SSE"|"RPC"|"Event"|"SQL"; }
export interface DesignGraph { nodes: Node[]; edges: Edge[]; }

export interface PatternOutput {
  id: string;
  fr: string[]; outOfScope: string[]; nfr: string[];
  entities: { name:string; fields:string[] }[];
  db: string; rationale: string[];
  graph: DesignGraph;
  meta?: any;
}
