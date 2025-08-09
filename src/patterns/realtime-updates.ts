import type { PatternOutput } from "@/design/types";

export const realtimeUpdates: PatternOutput = {
  id: "realtime-updates",
  fr: [
    "Clients subscribe to channels via realtime gateway",
    "Gateway fans out messages from pub/sub",
    "Presence service tracks online users"
  ],
  outOfScope: ["end-to-end encryption", "federation"],
  nfr: [
    "At-least-once event delivery with per-channel ordering",
    "Reconnect with cursor to avoid missed events",
    "p95 push latency < 2s"
  ],
  entities: [
    { name: "Channel", fields: ["id", "name"] },
    { name: "Subscription", fields: ["id", "channel_id", "user_id"] }
  ],
  db: `-- Channels and subscriptions
CREATE TABLE channels (id TEXT PRIMARY KEY, name TEXT);
CREATE TABLE subscriptions (id TEXT PRIMARY KEY, channel_id TEXT, user_id TEXT);`,
  rationale: [
    "WebSocket gateway maintains persistent connections for low-latency push",
    "Pub/Sub allows scalable fan-out to many subscribers",
    "Presence cache avoids hitting the database for online lists"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "rtgw", kind: "APIGateway", label: "Realtime GW", layer: "gateway" },
      { id: "pubsub", kind: "Stream", label: "Pub/Sub", layer: "async" },
      { id: "notifier", kind: "Service", label: "Notifier", layer: "service" },
      { id: "presence", kind: "Cache", label: "Presence Cache", layer: "data" }
    ],
    edges: [
      { from: "client", to: "rtgw", label: "WS connect", protocol: "WS" },
      { from: "rtgw", to: "pubsub", label: "publish", protocol: "Event" },
      { from: "pubsub", to: "notifier", label: "consume", protocol: "Event" },
      { from: "notifier", to: "presence", label: "update", protocol: "Event" }
    ]
  },
  meta: {
    detect: (p: string) => /(realtime|chat|live|ws|sse|notifications|presence)/i.test(p)
  }
};
