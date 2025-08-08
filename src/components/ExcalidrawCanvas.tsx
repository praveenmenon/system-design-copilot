import { useState, useCallback, useEffect, useMemo } from 'react'
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
  
  // Debug logging (removed for production)

  // Convert our diagram data to Excalidraw elements
  const convertToExcalidrawElements = useCallback((data: DiagramData): any[] => {
    if (!data) return []

    const elements: any[] = []

    // Convert components to rectangles with text
    data.components.forEach((component, index) => {
      // Ensure components start within viewport (offset from 0,0)
      const baseX = component.x + 100
      const baseY = component.y + 100
      const style = componentTypeStyles[component.type as keyof typeof componentTypeStyles] || componentTypeStyles.default
      
      // Create rectangle element
      const rectElement: any = {
        id: `rect-${component.id}`,
        type: 'rectangle',
        x: baseX,
        y: baseY,
        width: 120,
        height: 60,
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
        roundness: { type: 3, value: 8 },
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false
      }

      // Create text element
      const textElement: any = {
        id: `text-${component.id}`,
        type: 'text',
        x: baseX + 10,
        y: baseY + 20,
        width: 100,
        height: 20,
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
        text: component.label,
        fontSize: 12,
        fontFamily: 1,
        textAlign: 'center' as const,
        verticalAlign: 'middle' as const,
        containerId: null,
        originalText: component.label,
        lineHeight: 1.25
      }

      elements.push(rectElement, textElement)
    })

    // Convert connections to arrows
    data.connections.forEach((connection) => {
      const fromComponent = data.components.find(c => c.id === connection.from)
      const toComponent = data.components.find(c => c.id === connection.to)

      if (fromComponent && toComponent) {
        const arrowElement: any = {
          id: `arrow-${connection.from}-${connection.to}`,
          type: 'arrow',
          x: (fromComponent.x + 100) + 60,
          y: (fromComponent.y + 100) + 60,
          width: (toComponent.x + 100) + 60 - ((fromComponent.x + 100) + 60),
          height: (toComponent.y + 100) - ((fromComponent.y + 100) + 60),
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
          roundness: null,
          seed: Math.floor(Math.random() * 1000000),
          versionNonce: Math.floor(Math.random() * 1000000),
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          points: [
            [0, 0],
            [(toComponent.x + 100) + 60 - ((fromComponent.x + 100) + 60), (toComponent.y + 100) - ((fromComponent.y + 100) + 60)]
          ],
          lastCommittedPoint: null,
          startBinding: {
            elementId: `rect-${connection.from}`,
            focus: 0,
            gap: 1
          },
          endBinding: {
            elementId: `rect-${connection.to}`,
            focus: 0,
            gap: 1
          },
          startArrowhead: null,
          endArrowhead: 'arrow'
        }

        elements.push(arrowElement)
      }
    })

    return elements
  }, [])


  const handleChange = useCallback(() => {
    // For now, we'll disable automatic sync to prevent infinite loops
    // Users can manually save their changes if needed
  }, [])

  // Store initial data instead of using API updates
  const initialData = useMemo(() => {
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