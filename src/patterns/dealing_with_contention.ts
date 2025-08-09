import type { Pattern } from './types'
import { contentionScene } from '../diagrams/contentionScene'

export const dealingWithContentionPattern: Pattern = {
  id: 'dealing_with_contention',
  name: 'Dealing with Contention',
  scope:
    'Prevent double-booking/oversell with short holds, idempotency keys, and serialized writes.',
  when_to_apply: ['ticket','flash','auction','double-book','contention','reservation'],
  major_functional_requirements: [
    'Reserve/confirm with short holds',
    'Idempotent confirm with unique keys'
  ],
  out_of_scope: ['Global serializable tx across services'],
  non_functional_requirements: [
    'Conflict retry policy',
    'Hold TTL + background reaper'
  ],
  core_entities: [
    'Inventory(item_id, available)',
    'Reservation(id, item_id, user_id, expires_at, status)'
  ],
  db_schema_md: `\
\`\`\`sql
create table reservations(
  id uuid primary key, item_id text, user_id text,
  expires_at timestamptz, status text,
  unique(item_id, user_id)
);
\`\`\``,
  rationale_md: [
    '- Unique constraints or per-key queues avoid oversell',
    '- TTL holds prevent lock leaks',
    '- Idempotency keys make retries safe'
  ].join('\n'),
  diagram: contentionScene,
  detect: (prompt) => new RegExp(dealingWithContentionPattern.when_to_apply.join('|'), 'i').test(prompt)
}
