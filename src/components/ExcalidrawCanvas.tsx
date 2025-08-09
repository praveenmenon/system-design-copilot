import { useState, useCallback, useMemo } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
// Using any types temporarily to avoid complex type imports
import type { DiagramData } from '../types/diagram'
import './ExcalidrawCanvas.css'

interface ExcalidrawCanvasProps {
  diagramData: DiagramData | null
  onDiagramChange?: (data: DiagramData | null) => void
}

// Component type to Excalidraw element mapping
const componentTypeStyles = {
  'load-balancer': { backgroundColor: '#4CAF50', strokeColor: '#2E7D32' },
  'web-server': { backgroundColor: '#2196F3', strokeColor: '#1565C0' },
  'api-server': { backgroundColor: '#FF9800', strokeColor: '#E65100' },
  'database': { backgroundColor: '#9C27B0', strokeColor: '#6A1B9A' },
  'cache': { backgroundColor: '#F44336', strokeColor: '#C62828' },
  'queue': { backgroundColor: '#795548', strokeColor: '#4E342E' },
  'cdn': { backgroundColor: '#607D8B', strokeColor: '#37474F' },
  'user': { backgroundColor: '#8BC34A', strokeColor: '#558B2F' },
  'service': { backgroundColor: '#00BCD4', strokeColor: '#00838F' },
  'default': { backgroundColor: '#757575', strokeColor: '#424242' }
}

export default function ExcalidrawCanvas({ diagramData, onDiagramChange }: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  void onDiagramChange
  
  // Debug logging (removed for production)

  // Convert our diagram data to Excalidraw elements
  const convertToExcalidrawElements = useCallback((data: DiagramData): any[] => {
    if (!data) return []

    const elements: any[] = []
    
    // First, build a map of which arrows connect to which components
    const componentBindings: { [key: string]: Array<{id: string, type: string}> } = {}
    data.connections.forEach((connection) => {
      if (!componentBindings[connection.from]) {
        componentBindings[connection.from] = []
      }
      if (!componentBindings[connection.to]) {
        componentBindings[connection.to] = []
      }
      
      const arrowId = `arrow-${connection.from}-${connection.to}`
      componentBindings[connection.from].push({ id: arrowId, type: 'arrow' })
      componentBindings[connection.to].push({ id: arrowId, type: 'arrow' })
    })

    // Convert components to shapes with text
    data.components.forEach((component) => {
      // Ensure components start within viewport (offset from 0,0)
      const baseX = component.x + 100
      const baseY = component.y + 100
      const style = componentTypeStyles[component.type as keyof typeof componentTypeStyles] || componentTypeStyles.default
      
      // Determine shape type based on component type
      let shapeType = 'rectangle'
      let roundness: any = { type: 3, value: 8 }
      
      if (component.type === 'database') {
        shapeType = 'ellipse'
        roundness = null
      } else if (component.type === 'cache') {
        shapeType = 'diamond'
        roundness = null
      }
      
      // Calculate text dimensions and element size
      const maxLineLength = 12 // Max characters per line
      const minWidth = 120
      const fontSize = 12
      const charWidth = fontSize * 0.6 // Approximate character width
      const lineHeight = fontSize * 1.25
      
      // Break long labels into multiple lines
      const words = component.label.split(' ')
      const lines: string[] = []
      let currentLine = ''
      
      words.forEach(word => {
        if ((currentLine + word).length <= maxLineLength) {
          currentLine += (currentLine ? ' ' : '') + word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      })
      if (currentLine) lines.push(currentLine)
      
      // Calculate element dimensions based on text
      const maxLineWidth = Math.max(...lines.map(line => line.length))
      const calculatedWidth = Math.max(minWidth, maxLineWidth * charWidth + 20)
      const calculatedHeight = Math.max(60, lines.length * lineHeight + 20)
      
      const elementWidth = calculatedWidth
      const elementHeight = calculatedHeight
      
      // Create shape element
      const shapeElement: any = {
        id: `shape-${component.id}`,
        type: shapeType,
        x: baseX,
        y: baseY,
        width: elementWidth,
        height: elementHeight,
        angle: 0,
        strokeColor: style.strokeColor,
        backgroundColor: style.backgroundColor,
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [component.id],
        frameId: null,
        roundness: roundness,
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: componentBindings[component.id] || null,
        updated: Date.now(),
        link: null,
        locked: false
      }

      // Create text element with proper wrapping
      const wrappedText = lines.join('\n')
      const textWidth = elementWidth - 20
      const textHeight = lines.length * lineHeight
      
      const textElement: any = {
        id: `text-${component.id}`,
        type: 'text',
        x: baseX + 10,
        y: baseY + (elementHeight - textHeight) / 2,
        width: textWidth,
        height: textHeight,
        angle: 0,
        strokeColor: '#ffffff',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 0,
        opacity: 100,
        groupIds: [component.id],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        text: wrappedText,
        fontSize: fontSize,
        fontFamily: 1,
        textAlign: 'center' as const,
        verticalAlign: 'middle' as const,
        containerId: null,
        originalText: wrappedText,
        lineHeight: 1.25
      }

      elements.push(shapeElement, textElement)
    })

    // Convert connections to arrows
    data.connections.forEach((connection) => {
      const fromComponent = data.components.find(c => c.id === connection.from)
      const toComponent = data.components.find(c => c.id === connection.to)

      if (fromComponent && toComponent) {
        // Calculate dynamic element sizes for connection points
        const getElementSize = (comp: any) => {
          const maxLineLength = 12
          const minWidth = 120
          const fontSize = 12
          const charWidth = fontSize * 0.6
          const lineHeight = fontSize * 1.25
          
          const words = comp.label.split(' ')
          const lines: string[] = []
          let currentLine = ''
          
          words.forEach((word: string) => {
            if ((currentLine + word).length <= maxLineLength) {
              currentLine += (currentLine ? ' ' : '') + word
            } else {
              if (currentLine) lines.push(currentLine)
              currentLine = word
            }
          })
          if (currentLine) lines.push(currentLine)
          
          const maxLineWidth = Math.max(...lines.map(line => line.length))
          const width = Math.max(minWidth, maxLineWidth * charWidth + 20)
          const height = Math.max(60, lines.length * lineHeight + 20)
          
          return { width, height }
        }
        
        const fromSize = getElementSize(fromComponent)
        const toSize = getElementSize(toComponent)
        
        // Calculate connection points - center to center, Excalidraw will handle edge connections
        const fromCenterX = (fromComponent.x + 100) + fromSize.width / 2   // center of from component
        const fromCenterY = (fromComponent.y + 100) + fromSize.height / 2  // center of from component
        const toCenterX = (toComponent.x + 100) + toSize.width / 2         // center of to component
        const toCenterY = (toComponent.y + 100) + toSize.height / 2        // center of to component
        
        // Determine if this is a bidirectional connection
        const isBidirectional = connection.label?.includes('←→') || connection.label?.includes('<->') || 
                               data.connections.some(c => c.from === connection.to && c.to === connection.from)
        
        // Check if there's a reverse connection to create curved arrows
        const hasReverseConnection = data.connections.some(c => c.from === connection.to && c.to === connection.from)
        const isReverseArrow = hasReverseConnection && connection.from > connection.to // Use string comparison for consistency
        
        // Calculate curve offset for bidirectional arrows
        const curveOffset = hasReverseConnection ? (isReverseArrow ? 30 : -30) : 0
        const deltaX = toCenterX - fromCenterX
        const deltaY = toCenterY - fromCenterY
        
        // Calculate arrow start and end relative to arrow's bounding box
        const arrowStartX = fromCenterX - Math.min(fromCenterX, toCenterX)
        const arrowStartY = fromCenterY - Math.min(fromCenterY, toCenterY)
        const arrowEndX = toCenterX - Math.min(fromCenterX, toCenterX)
        const arrowEndY = toCenterY - Math.min(fromCenterY, toCenterY)
        
        // Create curved path for bidirectional connections
        let points: number[][];
        if (hasReverseConnection && Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal curve
          const midX = arrowStartX + (arrowEndX - arrowStartX) / 2
          const midY = arrowStartY + (arrowEndY - arrowStartY) / 2 + curveOffset
          points = [
            [arrowStartX, arrowStartY],
            [midX, midY],
            [arrowEndX, arrowEndY]
          ]
        } else if (hasReverseConnection && Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical curve
          const midX = arrowStartX + (arrowEndX - arrowStartX) / 2 + curveOffset
          const midY = arrowStartY + (arrowEndY - arrowStartY) / 2
          points = [
            [arrowStartX, arrowStartY],
            [midX, midY],
            [arrowEndX, arrowEndY]
          ]
        } else {
          // Straight arrow for single connections
          points = [
            [arrowStartX, arrowStartY],
            [arrowEndX, arrowEndY]
          ]
        }
        
        const arrowElement: any = {
          id: `arrow-${connection.from}-${connection.to}`,
          type: 'arrow',
          x: Math.min(fromCenterX, toCenterX),
          y: Math.min(fromCenterY, toCenterY),
          width: Math.abs(deltaX),
          height: Math.abs(deltaY),
          angle: 0,
          strokeColor: '#333333',
          backgroundColor: 'transparent',
          fillStyle: 'solid',
          strokeWidth: 2,
          strokeStyle: 'solid',
          roughness: 1,
          opacity: 100,
          groupIds: [],
          frameId: null,
          roundness: hasReverseConnection ? { type: 2 } : null,
          seed: Math.floor(Math.random() * 1000000),
          versionNonce: Math.floor(Math.random() * 1000000),
          isDeleted: false,
          boundElements: connection.label ? [{
            id: `arrow-text-${connection.from}-${connection.to}`,
            type: 'text'
          }] : null,
          updated: Date.now(),
          link: null,
          locked: false,
          points: points,
          lastCommittedPoint: null,
          startBinding: {
            elementId: `shape-${connection.from}`,
            focus: 0,
            gap: 3
          },
          endBinding: {
            elementId: `shape-${connection.to}`,
            focus: 0,
            gap: 3
          },
          startArrowhead: isBidirectional ? 'arrow' : null,
          endArrowhead: 'arrow'
        }

        elements.push(arrowElement)
        
        // Add arrow label as bound text element if present
        if (connection.label) {
          // Position label on the curve if it exists, otherwise at midpoint
          let labelX, labelY;
          if (hasReverseConnection) {
            // Position label on the curve
            const midX = fromCenterX + deltaX / 2
            const midY = fromCenterY + deltaY / 2 + curveOffset / 2
            labelX = midX
            labelY = midY
          } else {
            // Standard midpoint positioning
            labelX = fromCenterX + deltaX / 2
            labelY = fromCenterY + deltaY / 2
          }
          
          const textElement: any = {
            id: `arrow-text-${connection.from}-${connection.to}`,
            type: 'text',
            x: labelX - connection.label.length * 3, // approximate centering
            y: labelY - 8,
            width: connection.label.length * 6,
            height: 16,
            angle: 0,
            strokeColor: '#333333',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 0,
            opacity: 100,
            groupIds: [],
            frameId: null,
            roundness: null,
            seed: Math.floor(Math.random() * 1000000),
            versionNonce: Math.floor(Math.random() * 1000000),
            isDeleted: false,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false,
            text: connection.label,
            fontSize: 11,
            fontFamily: 1,
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const,
            containerId: `arrow-${connection.from}-${connection.to}`,
            originalText: connection.label,
            lineHeight: 1.25
          }
          
          elements.push(textElement)
        }
      }
    })

    return elements
  }, [])


  const handleChange = useCallback(() => {
    // For now, we'll disable automatic sync to prevent infinite loops
    // Users can manually save their changes if needed
  }, [])

  // Store initial data instead of using API updates
  const initialData: any = useMemo(() => {
    if (!diagramData) {
      return {
        elements: [],
        appState: {
          viewBackgroundColor: '#f8f9fa',
          currentItemStrokeColor: '#333333',
          currentItemBackgroundColor: '#ffffff',
          currentItemFillStyle: 'solid',
          currentItemStrokeWidth: 2,
          currentItemRoughness: 1,
          currentItemOpacity: 100,
          currentItemFontFamily: 1,
          currentItemFontSize: 16,
          currentItemTextAlign: 'center',
          currentItemStrokeStyle: 'solid'
        }
      }
    }
    
    const elements = convertToExcalidrawElements(diagramData)
    return {
      elements: elements,
      appState: {
        viewBackgroundColor: '#f8f9fa',
        currentItemStrokeColor: '#333333',
        currentItemBackgroundColor: '#ffffff',
        currentItemFillStyle: 'solid',
        currentItemStrokeWidth: 2,
        currentItemRoughness: 1,
        currentItemOpacity: 100,
        currentItemFontFamily: 1,
        currentItemFontSize: 16,
        currentItemTextAlign: 'center',
        currentItemStrokeStyle: 'solid'
      }
    }
  }, [diagramData, convertToExcalidrawElements])

  const handleExportChanges = useCallback(() => {
    if (!excalidrawAPI) return
    
    try {
      const elements = excalidrawAPI.getSceneElements()
      if (!elements || elements.length === 0) return

      // Simple conversion - just export as PNG for now
      const canvas = excalidrawAPI.getCanvas()
      if (canvas) {
        const link = document.createElement('a')
        link.download = 'system-diagram-modified.png'
        link.href = canvas.toDataURL()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.warn('Error exporting Excalidraw changes:', error)
    }
  }, [excalidrawAPI])

  // We'll update elements via useEffect to avoid infinite loops


  return (
    <div className="excalidraw-canvas">
      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          onChange={handleChange}
          initialData={initialData}
        />
      </div>
      
      {excalidrawAPI && diagramData && (
        <button 
          className="export-fab"
          onClick={handleExportChanges}
          title="Export modified diagram as PNG"
        >
          💾
        </button>
      )}
    </div>
  )
}