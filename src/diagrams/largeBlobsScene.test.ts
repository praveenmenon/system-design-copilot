// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { largeBlobsDiagramData } from './largeBlobsScene'

describe('large blobs diagram', () => {
  it('includes key nodes', () => {
    const data = largeBlobsDiagramData()
    expect(data.components.length).toMatchInlineSnapshot('9')
    const labels = data.components.map(c => c.label)
    expect(labels).toContain('Presign API')
    expect(labels).toContain('Object Storage')
    expect(labels).toContain('CDN')
    expect(labels).toContain('Metadata/Scan Worker')
  })
})
