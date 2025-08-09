import type { Pattern } from './types'
import { scalingWritesScene } from '../diagrams/scalingWritesScene'

export const scalingWritesPattern: Pattern = {
  id: 'scaling_writes',
  name: 'Scaling Writes',
  scope:
    'Absorb high-EPS ingestion with buffer/queue, shard routing, and batch writes.',
  when_to_apply: ['write-heavy','ingest','shard','partition','eps','throughput'],
  major_functional_requirements: [
    'Buffer bursts via queue',
    'Route writes by shard key',
    'Batch/compact writes where possible'
  ],
  out_of_scope: ['Global cross-shard transactions'],
  non_functional_requirements: [
    'Idempotent producers/writers',
    'Backpressure, rate limits, and quotas'
  ],
  core_entities: ['Event(id, shard, payload, ts)'],
  db_schema_md: `\
\`\`\`sql
-- sharded tables / partitions by key or time
\`\`\``,
  rationale_md: [
    '- Shard key strategy avoids hot partitions',
    '- Batching increases throughput and lowers IOPS',
    '- Backpressure prevents cascading failures'
  ].join('\n'),
  diagram: scalingWritesScene,
  detect: (prompt) => new RegExp(scalingWritesPattern.when_to_apply.join('|'), 'i').test(prompt)
}
