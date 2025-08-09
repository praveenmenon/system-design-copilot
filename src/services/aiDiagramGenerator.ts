import { selectPatterns } from "@/patterns";
import { mergeGraphs, layoutLayers, toExcalidraw } from "@/design/compose";
import { validate } from "@/graph/grammar";

export async function generateDesign(userPrompt: string, forcedPatterns: string[] = []) {
  const patterns = selectPatterns(userPrompt, forcedPatterns);

  const frs = patterns.flatMap(p => p.fr);
  const major = frs.slice(0, 3);
  const outOfScope = patterns.flatMap(p => p.outOfScope).concat(frs.slice(3));
  const nfr = Array.from(new Set(patterns.flatMap(p => p.nfr)));
  const entities = (() => {
    const seen = new Set<string>();
    return patterns.flatMap(p => p.entities).filter(e => !seen.has(e.name) && seen.add(e.name));
  })();
  const dbSchemaMd = patterns.map(p => p.db).join("\n\n");
  const rationaleMd = patterns.flatMap(p => p.rationale).map(x => `- ${x}`).join("\n");

  const merged = mergeGraphs(patterns.map(p => p.graph));
  const errors = validate(merged);
  errors.forEach(e => console.warn("[diagram-grammar]", e));
  const scene = toExcalidraw(layoutLayers(merged));

  return {
    patterns: patterns.map(p => p.id),
    majorFunctionalRequirements: major,
    outOfScope,
    nonFunctionalRequirements: nfr,
    coreEntities: entities,
    dbSchemaMd,
    rationaleMd,
    diagram: { scene },
    graph: merged,
    errors
  };
}
