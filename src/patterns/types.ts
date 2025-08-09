import type { DiagramData } from '../types/diagram'

export interface Pattern {
  id: string
  name: string
  scope: string
  when_to_apply: string[]
  major_functional_requirements: string[]
  out_of_scope: string[]
  non_functional_requirements: string[]
  core_entities: string[]
  db_schema_md: string
  rationale_md: string
  // Some legacy patterns return raw Excalidraw scenes instead of DiagramData.
  // Allow any return type; the merger will guard at runtime.
  diagram: () => DiagramData | any
  detect: (prompt: string) => boolean
}
