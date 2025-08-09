import type { Pattern } from './types'
import { largeBlobsDiagramData } from '../diagrams/largeBlobsScene'

const dbSchema = `\
CREATE TABLE blobs (
  id UUID PRIMARY KEY,
  storage_key TEXT NOT NULL,
  bytes BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  checksum TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner_id UUID
);

CREATE TABLE upload_sessions (
  id UUID PRIMARY KEY,
  blob_id UUID REFERENCES blobs(id),
  presigned_put_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  parts_uploaded INT DEFAULT 0,
  status TEXT NOT NULL
);`

export const largeBlobsPattern: Pattern = {
  id: 'large-blobs',
  name: 'Handling Large Blobs',
  scope: 'Direct-to-object storage uploads with metadata stored separately from binary blobs.',
  when_to_apply: [
    'upload',
    'video',
    'image',
    'file > 10MB',
    'media',
    'documents',
    'attachments',
    'binary',
    // Dropbox/drive style terms
    'dropbox',
    'google drive',
    'gdrive',
    'onedrive',
    'one drive',
    'box.com',
    'box enterprise',
    'cloud storage',
    'file storage',
    'file hosting',
    'presigned url',
    'presigned upload',
    'presign'
  ],
  major_functional_requirements: [
    'Generate presigned upload URL',
    'Direct client upload/download to blob storage',
    'Metadata service persists file records & lifecycle'
  ],
  out_of_scope: ['real-time AV processing', 'DLP', 'per-user analytics'],
  non_functional_requirements: [
    'Use CDN/edge for downloads; P95 download init < 150ms',
    'Multipart/resumable uploads; idempotent finalize',
    'Virus/malware scan async; quarantine on fail',
    'Durability 11 9s (object store); RPO=0, immutability optional'
  ],
  core_entities: [
    'Blob(id, storage_key, bytes, content_type, checksum, status, created_at, owner_id?)',
    'UploadSession(id, blob_id, presigned_put_url, expires_at, parts_uploaded, status)'
  ],
  db_schema_md: dbSchema,
  rationale_md: [
    '- Use presigned URLs to bypass application servers',
    '- Serve downloads via CDN',
    '- Async malware scanning to protect users',
    '- Metadata stored separately from blobs'
  ].join('\n'),
  diagram: largeBlobsDiagramData,
  detect: (prompt: string) => {
    const heuristics = new RegExp(largeBlobsPattern.when_to_apply.join('|'), 'i')
    return heuristics.test(prompt)
  }
}
