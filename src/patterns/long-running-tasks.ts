import type { PatternOutput } from "@/design/types";

export const longRunningTasks: PatternOutput = {
  id: "long-running-tasks",
  fr: [
    "Submit jobs and receive jobId",
    "Workers process jobs asynchronously",
    "Clients poll or subscribe for job status"
  ],
  outOfScope: ["result streaming", "auto-scaling workers"],
  nfr: [
    "Jobs are idempotent and retryable",
    "Expose cancellation endpoint",
    "Track p95 time-to-complete"
  ],
  entities: [
    { name: "Job", fields: ["id", "type", "input_ref", "status", "progress", "result_ref"] }
  ],
  db: `CREATE TABLE jobs (id TEXT PRIMARY KEY, type TEXT, input_ref TEXT, status TEXT, progress INT, result_ref TEXT);`,
  rationale: [
    "Queue decouples clients from slow work",
    "Polling or websockets provide job progress",
    "Persistent job store enables retries and recovery"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "api", kind: "APIGateway", label: "Jobs API", layer: "gateway" },
      { id: "queue", kind: "Queue", label: "Job Queue", layer: "async" },
      { id: "worker", kind: "Worker", label: "Worker Pool", layer: "async" },
      { id: "db", kind: "Database", label: "Jobs DB", layer: "data" }
    ],
    edges: [
      { from: "client", to: "api", label: "POST /jobs", protocol: "HTTP" },
      { from: "api", to: "queue", label: "enqueue", protocol: "Event" },
      { from: "queue", to: "worker", label: "dequeue", protocol: "Event" },
      { from: "worker", to: "db", label: "update", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(report|batch|async|long-running|job)/i.test(p)
  }
};
