import type { DesignGraph } from "@/design/types";
import { validate } from "@/graph/grammar";

export async function auditOnce(input: {
  prompt: string,
  graph: DesignGraph,
  sections: { frs: string[], nfr: string[], outOfScope: string[], entities: any[], dbSchemaMd: string, rationaleMd: string }
}) {
  const issues: { id:string, severity:"warn"|"err", message:string }[] = [];
  for (const e of validate(input.graph)) issues.push({ id:"grammar", severity:"err", message:e });

  // Example heuristic: Large Blobs prompt but missing multipart/CDN/finalize in NFRs
  const p = input.prompt.toLowerCase();
  const nfrs = input.sections.nfr.join(" ").toLowerCase();
  if (/(upload|blob|multipart|cdn|presign)/.test(p) && !/(multipart|cdn|finalize)/.test(nfrs)) {
    issues.push({ id:"nfr-large-blobs", severity:"warn", message:"Large Blobs detected but NFRs missing multipart/CDN/finalize" });
  }
  return { issues, suggestedEdits: [] };
}
