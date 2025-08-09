import type { PatternOutput } from "@/design/types";

export const largeBlobs: PatternOutput = {
  id: "large-blobs",
  fr: [
    "Generate presigned upload URL",
    "Direct client upload/download to blob storage",
    "Metadata service persists file records & lifecycle"
  ],
  outOfScope: ["real-time AV processing", "DLP", "per-user analytics"],
  nfr: [
    "Use CDN/edge for downloads; P95 download init < 150ms",
    "Multipart/resumable uploads; idempotent finalize",
    "Virus/malware scan async; quarantine on fail",
    "Durability 11 9s (object store); RPO=0, immutability optional"
  ],
  entities: [
    { name: "Blob", fields: ["id", "storage_key", "bytes", "content_type", "checksum", "status", "created_at", "owner_id"] },
    { name: "UploadSession", fields: ["id", "blob_id", "presigned_put_url", "expires_at", "parts_uploaded", "status"] }
  ],
  db: `CREATE TABLE blobs (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL,
  bytes BIGINT,
  content_type TEXT,
  checksum TEXT,
  status TEXT,
  created_at TIMESTAMP,
  owner_id TEXT
);

CREATE TABLE upload_sessions (
  id TEXT PRIMARY KEY,
  blob_id TEXT REFERENCES blobs(id),
  presigned_put_url TEXT,
  expires_at TIMESTAMP,
  parts_uploaded INT,
  status TEXT
);`,
  rationale: [
    "Presigned URLs bypass application servers reducing load",
    "Separating metadata from blobs simplifies lifecycle operations",
    "CDN speeds up global downloads and reduces storage egress",
    "Async scanning keeps uploads fast while protecting users"
  ],
  graph: {
    nodes: [
      { id: "client", kind: "Client", label: "Client", layer: "client" },
      { id: "presign", kind: "APIGateway", label: "Presign API", layer: "gateway" },
      { id: "cdn", kind: "CDN", label: "CDN", layer: "edge" },
      { id: "obj", kind: "ObjectStore", label: "Object Storage", layer: "data" },
      { id: "worker", kind: "Worker", label: "Metadata Worker", layer: "async" },
      { id: "db", kind: "Database", label: "Metadata DB", layer: "data" }
    ],
    edges: [
      { from: "client", to: "presign", label: "POST /presign", protocol: "HTTP" },
      { from: "client", to: "obj", label: "PUT multipart", protocol: "HTTP" },
      { from: "client", to: "cdn", label: "GET", protocol: "HTTP" },
      { from: "cdn", to: "obj", label: "origin", protocol: "HTTP" },
      { from: "obj", to: "worker", label: "event", protocol: "Event" },
      { from: "worker", to: "db", label: "write", protocol: "SQL" }
    ]
  },
  meta: {
    detect: (p: string) => /(upload|video|image|file|media|documents|attachments|binary)/i.test(p)
  }
};
