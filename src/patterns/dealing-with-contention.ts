import type { PatternOutput } from "@/design/types";

export const dealingWithContention: PatternOutput = {
  id: "dealing-with-contention",
  fr: [
    "Reserve item with short-lived hold",
    "Confirm or release reservation",
    "Reaper clears expired holds"
  ],
  outOfScope: ["waitlists", "dynamic pricing"],
  nfr: [
    "No oversell via per-item serialization",
    "Reservation TTL < 5m",
    "Audit trail of reservations"
  ],
  entities: [
    { name: "Inventory", fields: ["item_id", "available"] },
    { name: "Reservation", fields: ["lock_id", "item_id", "user_id", "expires_at", "status"] }
  ],
  db: `CREATE TABLE inventory (item_id TEXT PRIMARY KEY, available INT);
CREATE TABLE reservations (lock_id TEXT PRIMARY KEY, item_id TEXT, user_id TEXT, expires_at TIMESTAMP, status TEXT);`,
  rationale: [
    "Short-lived holds prevent overselling under contention",
    "Background reaper frees leaked reservations",
    "Unique constraints ensure optimistic locking"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "api", kind: "APIGateway", label: "Reservation API", layer: "gateway" },
      { id: "queue", kind: "Queue", label: "Hold Queue", layer: "async" },
      { id: "svc", kind: "Service", label: "Reservation Svc", layer: "service" },
      { id: "reaper", kind: "Worker", label: "Reaper", layer: "async" },
      { id: "db", kind: "Database", label: "Inventory DB", layer: "data" }
    ],
    edges: [
      { from: "client", to: "api", label: "POST /reserve", protocol: "HTTP" },
      { from: "api", to: "queue", label: "enqueue", protocol: "Event" },
      { from: "queue", to: "svc", label: "dequeue", protocol: "Event" },
      { from: "svc", to: "db", label: "tx", protocol: "SQL" },
      { from: "reaper", to: "db", label: "cleanup", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(reservation|ticket|inventory|auction|contention)/i.test(p)
  }
};
