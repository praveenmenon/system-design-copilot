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
  functionalRequirements: {
    core: string[]
    outOfScope: string[]
  }
  nonFunctionalRequirements: string[]
  capacityEstimation: {
    dau: string
    readQPS: string
    writeQPS: string
    storage: string
  }
  coreEntities: string[]
  keyAPIs: string[]
  databaseChoice: {
    type: string
    rationale: string
    schema: string
  }
  keyChallenges: Array<{
    challenge: string
    solutions: {
      bad: string
      good: string
      great: string
    }
    dataFlow: string
  }>
  tradeoffs: string
}

export interface DiagramData {
  components: SystemComponent[]
  connections: Connection[]
  analysis?: SystemAnalysis
}