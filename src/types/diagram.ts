export interface SystemComponent {
  id: string
  type: string
  label: string
  x: number
  y: number
}

export interface Connection {
  from: string
  to: string
  label?: string
}

export interface DiagramData {
  components: SystemComponent[]
  connections: Connection[]
}