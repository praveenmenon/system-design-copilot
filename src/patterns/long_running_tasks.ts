import type { Pattern } from './types'
import { jobsScene } from '../diagrams/jobsScene'

export const longRunningTasksPattern: Pattern = {
  id: 'long_running_tasks',
  name: 'Long-Running Tasks',
  scope:
    'Submit background jobs with progress, retries, cancellation, and DLQ.',
  when_to_apply: ['encoding','report','minutes','background','etl','batch','long-running'],
  major_functional_requirements: [
    'Submit job and track status',
    'Retry/cancel with DLQ'
  ],
  out_of_scope: ['Exactly-once global semantics'],
  non_functional_requirements: [
    'Time-to-complete SLOs',
    'Checkpointing for large jobs'
  ],
  core_entities: [
    'Job(id, type, input_ref, status, progress, attempts, result_ref)'
  ],
  db_schema_md: `\
\`\`\`sql
create table jobs(
  id uuid primary key, type text, input_ref text,
  status text, progress int, attempts int, result_ref text
);
\`\`\``,
  rationale_md: [
    '- Queue + worker pools isolate latency',
    '- Progress polling or WS updates',
    '- DLQ + retry/backoff for resilience'
  ].join('\n'),
  diagram: jobsScene,
  detect: (prompt) => new RegExp(longRunningTasksPattern.when_to_apply.join('|'), 'i').test(prompt)
}
