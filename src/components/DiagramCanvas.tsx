import { useEffect, useRef } from 'react'
import { Stage, Layer, Rect, Text, Arrow, Group } from 'react-konva'
import type { DiagramData, SystemComponent } from '../types/diagram'
import './DiagramCanvas.css'

interface DiagramCanvasProps {
  diagramData: DiagramData | null
  onUpdateDiagram: (data: DiagramData) => void
}

const componentTypes = {
  'user': { color: '#8BC34A', width: 80, height: 60 },
  'cdn': { color: '#607D8B', width: 100, height: 60 },
  'load-balancer': { color: '#4CAF50', width: 120, height: 60 },
  'api-gateway': { color: '#FF5722', width: 110, height: 60 },
  'web-server': { color: '#2196F3', width: 100, height: 60 },
  'auth-service': { color: '#E91E63', width: 110, height: 60 },
  'user-service': { color: '#9C27B0', width: 110, height: 60 },
  'content-service': { color: '#3F51B5', width: 120, height: 60 },
  'notification-service': { color: '#FF9800', width: 130, height: 60 },
  'search-service': { color: '#795548', width: 120, height: 60 },
  'payment-service': { color: '#F44336', width: 120, height: 60 },
  'api-server': { color: '#FF9800', width: 100, height: 60 },
  'service': { color: '#00BCD4', width: 100, height: 60 },
  'cache': { color: '#F44336', width: 80, height: 60 },
  'database': { color: '#9C27B0', width: 100, height: 80 },
  'queue': { color: '#795548', width: 100, height: 60 },
  'blob-storage': { color: '#607D8B', width: 110, height: 60 },
  'monitoring': { color: '#4CAF50', width: 100, height: 60 },
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
        height={component.details ? config.height - 20 : config.height}
        align="center"
        verticalAlign="middle"
        y={component.details ? -5 : 0}
      />
      {component.details && (
        <Text
          text={component.details}
          fontSize={9}
          fontFamily="Arial"
          fill="rgba(255,255,255,0.8)"
          width={config.width}
          height={20}
          align="center"
          verticalAlign="middle"
          y={config.height - 15}
        />
      )}
    </Group>
  )
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ diagramData, onUpdateDiagram }) => {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current && stageRef.current) {
        const containerWidth = containerRef.current.offsetWidth || 800
        const containerHeight = containerRef.current.offsetHeight || 600
        
        // Ensure minimum dimensions to avoid zero-width/height canvas
        const width = Math.max(containerWidth, 400)
        const height = Math.max(containerHeight, 400)
        
        stageRef.current.width(width)
        stageRef.current.height(height)
      }
    }

    // Use timeout to ensure DOM is ready
    setTimeout(checkSize, 100)
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  // Re-check size when diagramData changes
  useEffect(() => {
    if (diagramData && containerRef.current && stageRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 800
      const containerHeight = containerRef.current.offsetHeight || 600
      
      const width = Math.max(containerWidth, 400)
      const height = Math.max(containerHeight, 400)
      
      stageRef.current.width(width)
      stageRef.current.height(height)
    }
  }, [diagramData])

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

      const startX = fromComponent.x + fromConfig.width / 2
      const startY = fromComponent.y + fromConfig.height
      const endX = toComponent.x + toConfig.width / 2
      const endY = toComponent.y
      
      const points = [startX, startY, endX, endY]
      
      // Calculate label position (middle of the arrow)
      const labelX = (startX + endX) / 2
      const labelY = (startY + endY) / 2

      return (
        <Group key={`${connection.from}-${connection.to}-${index}`}>
          <Arrow
            points={points}
            pointerLength={10}
            pointerWidth={10}
            fill="#333"
            stroke="#333"
            strokeWidth={2}
          />
          {connection.label && (
            <Text
              x={labelX}
              y={labelY - 8}
              text={connection.label}
              fontSize={10}
              fontFamily="Arial"
              fill="#666"
              align="center"
              offsetX={connection.label.length * 2.5}
            />
          )}
        </Group>
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
        width={containerRef.current?.offsetWidth || 800}
        height={containerRef.current?.offsetHeight || 600}
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