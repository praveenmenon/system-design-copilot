import type { DesignGraph, NodeKind } from "@/design/types";

type Allowed = Partial<Record<NodeKind, NodeKind[]>>;
export const ALLOWED: Allowed = {
  Client:["CDN","APIGateway","Auth","ObjectStore"],
  CDN:["Client","ObjectStore"],
  APIGateway:["Service","Workflow","Auth","Cache","Queue","Stream"],
  Service:["Service","Database","Cache","Search","Queue","Stream","ObjectStore"],
  Workflow:["Service","Queue","Stream","Database"],
  Worker:["Database","Cache","Search","ObjectStore","Queue"],
  Queue:["Worker"],
  Stream:["Worker","Service"],
  Cache:["Service"],
  Database:["Service","Worker"],
  ObjectStore:["Worker","CDN","Service"],
  Auth:["APIGateway","Service"]
};

export function validate(graph: DesignGraph): string[] {
  const nodes = new Map(graph.nodes.map(n=>[n.id,n]));
  const errs: string[] = [];
  for (const e of graph.edges) {
    const a = nodes.get(e.from), b = nodes.get(e.to);
    if (!a || !b) { errs.push(`dangling edge ${e.from}→${e.to}`); continue; }
    const allowed = ALLOWED[a.kind] ?? [];
    if (!allowed.includes(b.kind)) errs.push(`illegal ${a.kind}→${b.kind} edge (${a.label}→${b.label})`);
  }
  return errs;
}
