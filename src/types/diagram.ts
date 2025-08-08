export interface SystemComponent {
  id: string
  type: string
  label: string
  x: number
  y: number
  details?: string
}

export interface Connection {
  from: string
  to: string
  label?: string
}

export interface SystemAnalysis {
  requirements: {
    functional: string[]
    nonFunctional: string[]
    outOfScope: string[]
  }
  capacity: {
    dau: string
    peakQps: string
    storage: string
    bandwidth: string
  }
  apis: {
    endpoint: string
    description: string
  }[]
  database: {
    choice: string
    rationale: string
    schema?: string
  }
  challenges: {
    title: string
    solutions: {
      type: 'bad' | 'good' | 'great'
      title: string
      description: string
    }[]
    dataFlow?: string
  }[]
  tradeoffs: {
    summary: string
  }
}

export interface DiagramData {
  components: SystemComponent[]
  connections: Connection[]
  analysis?: SystemAnalysis
}