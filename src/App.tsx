import { useState } from 'react'
import './App.css'
import PromptInput from './components/PromptInput'
import ExcalidrawCanvas from './components/ExcalidrawCanvas'
import SystemAnalysisPanel from './components/SystemAnalysisPanel'
import type { DiagramData } from './types/diagram'

function App() {
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'canvas' | 'analysis' | 'split'>('canvas')
  const [progress, setProgress] = useState<{ percent: number; message: string } | null>(null)

  const handleGenerateDiagram = async (prompt: string) => {
    setIsLoading(true)
    setProgress({ percent: 5, message: 'Starting…' })
    try {
      const { generateAIDiagramWithProgress } = await import('./services/aiDiagramGenerator')
      const diagram = await generateAIDiagramWithProgress(prompt, (u) => setProgress({ percent: u.percent, message: u.message }))
      setDiagramData(diagram)
      setCurrentView('split') // Switch to split view when diagram is generated
    } catch (error) {
      console.error('Error generating diagram:', error)
      // Fallback to mock data if AI service completely fails
      try {
        const { generateMockDiagram } = await import('./services/mockDiagramGenerator')
        const mockDiagram = await generateMockDiagram(prompt)
        setDiagramData(mockDiagram)
        setCurrentView('split') // Switch to split view when diagram is generated
      } catch (mockError) {
        console.error('Mock generation also failed:', mockError)
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setProgress(null), 1000)
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
            progress={progress}
          />
        </div>
        
        <div className="view-controls">
          <button 
            onClick={() => setCurrentView('canvas')}
            className={currentView === 'canvas' ? 'active' : ''}
          >
            Canvas
          </button>
          <button 
            onClick={() => setCurrentView('analysis')}
            className={currentView === 'analysis' ? 'active' : ''}
          >
            Analysis
          </button>
          <button 
            onClick={() => setCurrentView('split')}
            className={currentView === 'split' ? 'active' : ''}
          >
            Split View
          </button>
          <button 
            onClick={() => handleGenerateDiagram('Design a simple e-commerce microservices architecture')}
            style={{ backgroundColor: '#28a745', color: '#000000' }}
          >
            Test Diagram
          </button>
        </div>
        
        <div className={`content-panels ${currentView === 'split' ? 'split' : 'single'}`}>
          {currentView === 'canvas' && (
            <div className="canvas-section">
              <ExcalidrawCanvas 
                diagramData={diagramData}
                onDiagramChange={setDiagramData}
              />
            </div>
          )}
          
          {currentView === 'analysis' && diagramData && (
            <div className="analysis-section">
              <SystemAnalysisPanel diagramData={diagramData} />
            </div>
          )}
          
          {currentView === 'split' && (
            <>
              <div className="canvas-section">
                <ExcalidrawCanvas 
                  diagramData={diagramData}
                  onDiagramChange={setDiagramData}
                />
              </div>
              {diagramData && (
                <div className="analysis-section">
                  <SystemAnalysisPanel diagramData={diagramData} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
