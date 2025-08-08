import { useEffect, useRef } from 'react'
import { Stage, Layer, Rect, Text, Arrow, Group } from 'react-konva'
import type { DiagramData, SystemComponent } from '../types/diagram'
import './DiagramCanvas.css'

interface DiagramCanvasProps {
  diagramData: DiagramData | null
  onUpdateDiagram: (data: DiagramData) => void
}

const componentTypes = {
  'load-balancer': { color: '#4CAF50', width: 120, height: 60 },
  'web-server': { color: '#2196F3', width: 100, height: 60 },
  'api-server': { color: '#FF9800', width: 100, height: 60 },
  'database': { color: '#9C27B0', width: 100, height: 80 },
  'cache': { color: '#F44336', width: 80, height: 60 },
  'queue': { color: '#795548', width: 100, height: 60 },
  'cdn': { color: '#607D8B', width: 80, height: 60 },
  'user': { color: '#8BC34A', width: 80, height: 60 },
  'service': { color: '#00BCD4', width: 100, height: 60 },
  'default': { color: '#757575', width: 100, height: 60 }
}

const ComponentBox: React.FC<{
  component: SystemComponent
  onDragEnd: (id: string, x: number, y: number) => void
}> = ({ component, onDragEnd }) => {
  const config = componentTypes[component.type as keyof typeof componentTypes] || componentTypes.default

  return (
    <Group
      x={component.x}
      y={component.y}
      draggable
      onDragEnd={(e) => {
        onDragEnd(component.id, e.target.x(), e.target.y())
      }}
    >
      <Rect
        width={config.width}
        height={config.height}
        fill={config.color}
        stroke="#333"
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.3}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />
      <Text
        text={component.label}
        fontSize={12}
        fontFamily="Arial"
        fill="white"
        fontStyle="bold"
        width={config.width}
        height={config.height}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ diagramData, onUpdateDiagram }) => {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current && stageRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight
        stageRef.current.width(containerWidth)
        stageRef.current.height(containerHeight)
      }
    }

    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const handleComponentDragEnd = (id: string, x: number, y: number) => {
    if (!diagramData) return

    const updatedComponents = diagramData.components.map(comp => 
      comp.id === id ? { ...comp, x, y } : comp
    )

    onUpdateDiagram({
      ...diagramData,
      components: updatedComponents
    })
  }

  const renderConnections = () => {
    if (!diagramData) return []

    return diagramData.connections.map((connection, index) => {
      const fromComponent = diagramData.components.find(c => c.id === connection.from)
      const toComponent = diagramData.components.find(c => c.id === connection.to)

      if (!fromComponent || !toComponent) return null

      const fromConfig = componentTypes[fromComponent.type as keyof typeof componentTypes] || componentTypes.default
      const toConfig = componentTypes[toComponent.type as keyof typeof componentTypes] || componentTypes.default

      const points = [
        fromComponent.x + fromConfig.width / 2,
        fromComponent.y + fromConfig.height,
        toComponent.x + toConfig.width / 2,
        toComponent.y
      ]

      return (
        <Arrow
          key={`${connection.from}-${connection.to}-${index}`}
          points={points}
          pointerLength={10}
          pointerWidth={10}
          fill="#333"
          stroke="#333"
          strokeWidth={2}
        />
      )
    })
  }

  if (!diagramData || diagramData.components.length === 0) {
    return (
      <div className="diagram-canvas empty" ref={containerRef}>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Diagram Yet</h3>
          <p>Enter a system design prompt above to generate your first diagram</p>
        </div>
      </div>
    )
  }

  return (
    <div className="diagram-canvas" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={800}
        height={600}
      >
        <Layer>
          {renderConnections()}
          {diagramData.components.map(component => (
            <ComponentBox
              key={component.id}
              component={component}
              onDragEnd={handleComponentDragEnd}
            />
          ))}
        </Layer>
      </Stage>
      
      <div className="canvas-controls">
        <button 
          className="export-btn"
          onClick={() => {
            if (stageRef.current) {
              const dataURL = stageRef.current.toDataURL()
              const link = document.createElement('a')
              link.download = 'system-diagram.png'
              link.href = dataURL
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          }}
        >
          Export PNG
        </button>
      </div>
    </div>
  )
}

export default DiagramCanvas