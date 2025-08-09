import type { Pattern } from './types'
import { realtimeScene } from '../diagrams/realtimeScene'

export const realtimeUpdatesPattern: Pattern = {
  id: 'realtime_updates',
  name: 'Realtime Updates',
  scope:
    'Deliver live updates to connected clients with low push latency using WS/SSE and pub/sub fanout.',
  when_to_apply: [
    'realtime','live','chat','websocket','sse','notifications','presence','collaborative'
  ],
  major_functional_requirements: [
    'Maintain realtime connections and auth handshakes',
    'Fan-out events to subscribers via pub/sub',
    'Track presence/connection state'
  ],
  out_of_scope: [
    'Offline sync across devices',
    'End-to-end encryption for message contents'
  ],
  non_functional_requirements: [
    'p50 push < 150ms, p95 < 400ms',
    'At-least-once delivery with client-side dedupe',
    'Backpressure handling and connection limits'
  ],
  core_entities: [
    'Channel(id, name)', 'Subscription(id, channel_id, user_id)', 'Event(id, channel_id, ts, payload)'
  ],
  db_schema_md: `\
\`\`\`sql
create table channels(id uuid primary key, name text);
create table subscriptions(id uuid primary key, channel_id uuid, user_id uuid);
create table events(id uuid primary key, channel_id uuid, ts timestamptz, payload jsonb);
\`\`\``,
  rationale_md: [
    '- Gateway keeps WS/SSE; pub/sub scales fanout',
    '- Presence in cache; ordering per channel/partition',
    '- Dedupe on client to tolerate at-least-once'
  ].join('\n'),
  diagram: realtimeScene,
  detect: (prompt) => new RegExp(realtimeUpdatesPattern.when_to_apply.join('|'), 'i').test(prompt)
}
