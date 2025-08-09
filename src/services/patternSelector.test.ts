// @ts-nocheck
import { selectPatterns } from './patternSelector'
import { describe, it, expect } from 'vitest'

describe('pattern selection', () => {
  it('detects large blob keywords', () => {
    const patterns = selectPatterns('Design WhatsApp media uploads')
    expect(patterns.some(p => p.id === 'large-blobs')).toBe(true)
  })

  it('detects large file uploads', () => {
    const patterns = selectPatterns('Design Dropbox uploads 5GB')
    expect(patterns.some(p => p.id === 'large-blobs')).toBe(true)
  })
})
