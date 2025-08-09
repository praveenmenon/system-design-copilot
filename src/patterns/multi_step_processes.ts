import type { Pattern } from './types'
import { workflowScene } from '../diagrams/workflowScene'

export const multiStepProcessesPattern: Pattern = {
  id: 'multi_step_processes',
  name: 'Multi-Step Processes',
  scope:
    'Orchestrate multi-service workflows with retries, compensations, and DLQ.',
  when_to_apply: ['workflow','saga','orchestr','approval','multi-step'],
  major_functional_requirements: [
    'Start workflow and track state',
    'Retry steps with DLQ and compensations'
  ],
  out_of_scope: ['Global transaction manager'],
  non_functional_requirements: [
    'Idempotent steps',
    'Exponential backoff; heartbeat timeouts'
  ],
  core_entities: [
    'Workflow(id, type, status, started_at, updated_at)',
    'Step(id, workflow_id, type, status, retries, payload)'
  ],
  db_schema_md: `\
\`\`\`sql
create table workflows(id uuid primary key, type text, status text, started_at timestamptz, updated_at timestamptz);
create table steps(id uuid primary key, workflow_id uuid, type text, status text, retries int, payload jsonb);
\`\`\``,
  rationale_md: [
    '- Orchestrator coordinates durable progress',
    '- DLQ for poison messages',
    '- Compensations preserve invariants on failure'
  ].join('\n'),
  diagram: workflowScene,
  detect: (prompt) => new RegExp(multiStepProcessesPattern.when_to_apply.join('|'), 'i').test(prompt)
}
