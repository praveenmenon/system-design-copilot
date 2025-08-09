import { fitToContent } from './fitToContent'
import type { DiagramData } from '../types/diagram'

export function largeBlobsDiagramData(): DiagramData {
  return {
    components: [
      { id: 'client', type: 'client', label: 'Client', x: 0, y: 0 },
      { id: 'auth', type: 'service', label: 'Auth/STS', x: 200, y: 0 },
      { id: 'presign', type: 'service', label: 'Presign API', x: 400, y: 0 },
      { id: 'object-storage', type: 'storage', label: 'Object Storage', x: 600, y: -100 },
      { id: 'queue', type: 'queue', label: 'Event/Queue', x: 600, y: 100 },
      { id: 'worker', type: 'service', label: 'Metadata/Scan Worker', x: 800, y: 100 },
      { id: 'db', type: 'database', label: 'DB', x: 1000, y: 100 },
      { id: 'cdn', type: 'service', label: 'CDN', x: 800, y: -100 },
      { id: 'download-presign', type: 'service', label: 'Download Presign API', x: 400, y: -200 }
    ],
    connections: [
      { from: 'client', to: 'auth' },
      { from: 'auth', to: 'presign' },
      { from: 'presign', to: 'object-storage' },
      { from: 'client', to: 'object-storage' },
      { from: 'object-storage', to: 'queue' },
      { from: 'queue', to: 'worker' },
      { from: 'worker', to: 'db' },
      { from: 'client', to: 'download-presign' },
      { from: 'download-presign', to: 'cdn' },
      { from: 'cdn', to: 'object-storage' },
      { from: 'client', to: 'cdn' }
    ]
  }
}

export function largeBlobsScene() {
  const data = largeBlobsDiagramData()
  const elements: any[] = []

  data.components.forEach((c, idx) => {
    elements.push({
      id: c.id,
      type: 'rectangle',
      x: c.x,
      y: c.y,
      width: 120,
      height: 60,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      roundness: 0,
      seed: idx + 1,
      version: 1,
      isDeleted: false,
      text: c.label
    })
  })

  data.connections.forEach((conn, idx) => {
    const from = data.components.find(c => c.id === conn.from)!
    const to = data.components.find(c => c.id === conn.to)!
    elements.push({
      id: `arrow-${idx}`,
      type: 'arrow',
      x: from.x + 120,
      y: from.y + 30,
      width: to.x - from.x - 120,
      height: to.y - from.y,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      seed: 100 + idx,
      version: 1,
      isDeleted: false,
      points: [
        { x: 0, y: 0 },
        { x: to.x - from.x - 120, y: to.y - from.y }
      ],
      startBinding: null,
      endBinding: null
    })
  })

  const scene = { type: 'excalidraw', elements, appState: {} }
  return fitToContent(scene)
}
