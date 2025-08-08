import { useState } from 'react'
import './App.css'
import PromptInput from './components/PromptInput'
import DiagramCanvas from './components/DiagramCanvas'
import type { DiagramData } from './types/diagram'

function App() {
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateDiagram = async (prompt: string) => {
    setIsLoading(true)
    try {
      const { generateAIDiagram } = await import('./services/aiDiagramGenerator')
      const diagram = await generateAIDiagram(prompt)
      setDiagramData(diagram)
    } catch (error) {
      console.error('Error generating diagram:', error)
      // Fallback to mock data if AI service completely fails
      try {
        const { generateMockDiagram } = await import('./services/mockDiagramGenerator')
        const mockDiagram = await generateMockDiagram(prompt)
        setDiagramData(mockDiagram)
      } catch (mockError) {
        console.error('Mock generation also failed:', mockError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>System Design Copilot</h1>
        <p>Generate system architecture diagrams from natural language prompts</p>
      </header>
      
      <div className="app-content">
        <div className="input-section">
          <PromptInput 
            onGenerate={handleGenerateDiagram}
            isLoading={isLoading}
          />
        </div>
        
        <div className="canvas-section">
          <DiagramCanvas 
            diagramData={diagramData}
            onUpdateDiagram={setDiagramData}
          />
        </div>
      </div>
    </div>
  )
}

export default App
