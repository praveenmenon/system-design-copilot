import type { DiagramData } from '../types/diagram'
import type { Pattern } from '../patterns/types'

export function applyPatterns(base: DiagramData, patterns: Pattern[]): DiagramData {
  if (!patterns.length) return base

  const allFrs = patterns.flatMap(p =>
    p.major_functional_requirements.map(fr => ({ id: p.id, fr }))
  )
  const included = allFrs.slice(0, 3)

  patterns.forEach(p => {
    const pDiagram = p.diagram()
    base.components.push(...pDiagram.components)
    base.connections.push(...pDiagram.connections)

    base.analysis ||= {
      requirements: { functional: [], nonFunctional: [], outOfScope: [] },
      capacity: { dau: '', peakQps: '', storage: '', bandwidth: '' },
      apis: [],
      database: { choice: '', rationale: '' },
      challenges: [],
      tradeoffs: { summary: '' }
    }

    const frs = included.filter(f => f.id === p.id).map(f => f.fr)
    const outFrs = p.major_functional_requirements.filter(fr => !frs.includes(fr))

    base.analysis.patterns = [
      ...(base.analysis.patterns || []),
      {
        id: p.id,
        name: p.name,
        scope: p.scope,
        majorFunctionalRequirements: frs,
        outOfScope: [...p.out_of_scope, ...outFrs],
        nonFunctionalRequirements: p.non_functional_requirements,
        coreEntities: p.core_entities,
        dbSchemaMd: p.db_schema_md,
        rationaleMd: p.rationale_md
      }
    ]
  })

  return base
}
