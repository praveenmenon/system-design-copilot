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
  enhancements?: {
    caching?: {
      dataCached?: string
      keyFormat?: string
      ttl?: string
      invalidation?: string
    }
    queues?: {
      purpose?: string
      workflow?: string
    }
    search?: {
      engine?: string
      indexedFields?: string[]
      resultCaching?: string
    }
  }
  patterns?: {
    id: string
    name: string
    scope: string
    majorFunctionalRequirements: string[]
    outOfScope: string[]
    nonFunctionalRequirements: string[]
    coreEntities: string[]
    dbSchemaMd: string
    rationaleMd: string
  }[]
  challenges: {
    title: string
    issueDetail: string
    solutions: {
      title: string
      pros: string[]
      cons: string[]
      nfrImpact: string
    }[]
    chosenSolution: string
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