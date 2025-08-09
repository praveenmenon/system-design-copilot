import type { Pattern } from './types'
import { scalingReadsScene } from '../diagrams/scalingReadsScene'

export const scalingReadsPattern: Pattern = {
  id: 'scaling_reads',
  name: 'Scaling Reads',
  scope:
    'Serve read-heavy traffic using CDN, cache, and read replicas with explicit staleness policy.',
  when_to_apply: ['read-heavy','feed','timeline','search','cache','cdn','replica'],
  major_functional_requirements: [
    'Serve hot reads via cache/CDN',
    'Route misses to read replicas/primary',
    'Define invalidation vs TTL strategy'
  ],
  out_of_scope: ['Full-text search cluster'],
  non_functional_requirements: [
    'Target cache hit-rate ≥ 90%',
    'Handle replica lag via TTL/ETag/conditional gets'
  ],
  core_entities: ['View(key, value, ts)'],
  db_schema_md: `\
\`\`\`sql
-- denormalized/materialized views as needed
\`\`\``,
  rationale_md: [
    '- CDN + cache reduce origin load',
    '- Replicas absorb read traffic; accept bounded staleness',
    '- Clear policy for invalidation vs TTL'
  ].join('\n'),
  diagram: scalingReadsScene,
  detect: (prompt) => new RegExp(scalingReadsPattern.when_to_apply.join('|'), 'i').test(prompt)
}
