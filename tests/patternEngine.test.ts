import { describe, it, expect } from 'vitest'
import { generateDesign } from '@/services/aiDiagramGenerator'

describe('pattern engine', () => {
  it('caps functional requirements to 3', async () => {
    const res = await generateDesign('design upload service with chat and jobs', [])
    expect(res.majorFunctionalRequirements.length).toBeLessThanOrEqual(3)
  })

  it('produces valid graph', async () => {
    const res = await generateDesign('simple image upload', [])
    expect(res.errors.length).toBe(0)
  })

  it('renders scene elements', async () => {
    const res = await generateDesign('simple image upload', [])
    expect(res.diagram.scene.elements.length).toBeGreaterThan(0)
  })
})
