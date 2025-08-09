import type { PatternOutput } from "@/design/types";

export const scalingWrites: PatternOutput = {
  id: "scaling-writes",
  fr: [
    "Ingest high volume writes via buffered API",
    "Batch workers route events to shards",
    "Sharded storage maintains balanced load"
  ],
  outOfScope: ["cross-shard transactions", "real-time analytics"],
  nfr: [
    "Ingest at-least-once with idempotent keys",
    "Monitor shard skew and queue depth",
    "Backpressure via 429 when buffers full"
  ],
  entities: [
    { name: "Event", fields: ["id", "shard", "payload", "received_at"] }
  ],
  db: `-- Sharded events table
CREATE TABLE events_0 (...);
CREATE TABLE events_1 (...);`,
  rationale: [
    "Buffering absorbs bursty writes and smooths load",
    "Shard router enables horizontal scaling of storage",
    "Idempotent processors ensure at-least-once semantics"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "api", kind: "APIGateway", label: "Ingest API", layer: "gateway" },
      { id: "queue", kind: "Queue", label: "Buffer", layer: "async" },
      { id: "worker", kind: "Worker", label: "Shard Router", layer: "async" },
      { id: "db", kind: "Database", label: "Sharded Store", layer: "data" }
    ],
    edges: [
      { from: "client", to: "api", label: "POST /events", protocol: "HTTP" },
      { from: "api", to: "queue", label: "enqueue", protocol: "Event" },
      { from: "queue", to: "worker", label: "dequeue", protocol: "Event" },
      { from: "worker", to: "db", label: "batch write", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(write-heavy|ingest|metrics|logs|clickstream|events)/i.test(p)
  }
};
