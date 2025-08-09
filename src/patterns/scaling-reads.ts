import type { PatternOutput } from "@/design/types";

export const scalingReads: PatternOutput = {
  id: "scaling-reads",
  fr: [
    "Serve reads through CDN and edge cache",
    "API layer hydrates data from cache or replica",
    "Invalidate cache on writes"
  ],
  outOfScope: ["full-text search", "write sharding"],
  nfr: [
    "Cache hit rate > 90% for hot keys",
    "Replica lag < 2s",
    "Stale data tolerated up to TTL"
  ],
  entities: [
    { name: "CacheEntry", fields: ["key", "value", "ttl"] }
  ],
  db: `-- Example table for cached objects
CREATE TABLE cache_entries (key TEXT PRIMARY KEY, value TEXT, ttl INT);`,
  rationale: [
    "CDN offloads static and semi-static content from origin",
    "Caching reduces read latency and database load",
    "Replica provides isolation from write workload"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "cdn", kind: "CDN", label: "CDN", layer: "edge" },
      { id: "api", kind: "APIGateway", label: "API Gateway", layer: "gateway" },
      { id: "cache", kind: "Cache", label: "Cache", layer: "data" },
      { id: "db", kind: "Database", label: "Read Replica", layer: "data" }
    ],
    edges: [
      { from: "client", to: "cdn", label: "GET", protocol: "HTTP" },
      { from: "cdn", to: "api", label: "miss", protocol: "HTTP" },
      { from: "api", to: "cache", label: "fetch", protocol: "RPC" },
      { from: "api", to: "db", label: "query", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(read-heavy|cdn|cache|dashboard|timeline|feed)/i.test(p)
  }
};
