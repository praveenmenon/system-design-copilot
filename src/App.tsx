import { useState } from 'react'
import './App.css'
import PromptInput from './components/PromptInput'
import ExcalidrawCanvas from './components/ExcalidrawCanvas'
import SystemAnalysisPanel from './components/SystemAnalysisPanel'

function App() {
  const [diagramData, setDiagramData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'canvas' | 'analysis' | 'split'>('canvas')
  const [auditIssues, setAuditIssues] = useState<string[]>([])

  const handleGenerateDiagram = async (prompt: string, forced: string[]) => {
    setIsLoading(true)
    try {
      const { generateDesign } = await import('./services/aiDiagramGenerator')
      const diagram = await generateDesign(prompt, forced)
      setDiagramData(diagram)
      setCurrentView('split')
      const { auditOnce } = await import('./audit/auditor')
      const audit = await auditOnce({
        prompt,
        graph: diagram.graph,
        sections: {
          frs: diagram.majorFunctionalRequirements,
          nfr: diagram.nonFunctionalRequirements,
          outOfScope: diagram.outOfScope,
          entities: diagram.coreEntities,
          dbSchemaMd: diagram.dbSchemaMd,
          rationaleMd: diagram.rationaleMd
        }
      })
      setAuditIssues(audit.issues.map(i => i.message))
    } catch (error) {
      console.error('Error generating diagram:', error)
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
        
        {auditIssues.length > 0 && (
          <div className="audit-banner">
            {auditIssues.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        )}
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
