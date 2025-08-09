import type { PatternOutput } from "@/design/types";

export const multiStepProcesses: PatternOutput = {
  id: "multi-step-processes",
  fr: [
    "Orchestrate workflow steps with state tracking",
    "Retry failed steps with compensation",
    "Expose workflow status API"
  ],
  outOfScope: ["visual builders", "human approval UI"],
  nfr: [
    "Idempotent step execution",
    "Exponential backoff on retries",
    "Dead-letter queue for poison messages"
  ],
  entities: [
    { name: "Workflow", fields: ["id", "state"] },
    { name: "Step", fields: ["id", "workflow_id", "type", "status", "retries"] }
  ],
  db: `CREATE TABLE workflows (id TEXT PRIMARY KEY, state TEXT);
CREATE TABLE steps (id TEXT PRIMARY KEY, workflow_id TEXT, type TEXT, status TEXT, retries INT);`,
  rationale: [
    "Central orchestrator coordinates multi-service operations",
    "Queues decouple step execution for resilience",
    "DLQ captures failing steps for later inspection"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "api", kind: "APIGateway", label: "Workflow API", layer: "gateway" },
      { id: "orch", kind: "Service", label: "Orchestrator", layer: "service" },
      { id: "queue", kind: "Queue", label: "Step Queue", layer: "async" },
      { id: "worker", kind: "Worker", label: "Step Worker", layer: "async" },
      { id: "db", kind: "Database", label: "State Store", layer: "data" }
    ],
    edges: [
      { from: "client", to: "api", label: "POST /workflows", protocol: "HTTP" },
      { from: "api", to: "orch", label: "start", protocol: "RPC" },
      { from: "orch", to: "queue", label: "enqueue step", protocol: "Event" },
      { from: "queue", to: "worker", label: "dequeue", protocol: "Event" },
      { from: "worker", to: "db", label: "update", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(workflow|saga|multi-step|orchestrate|process)/i.test(p)
  }
};
