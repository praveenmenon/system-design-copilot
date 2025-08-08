import { useState } from 'react'
import type { SystemAnalysis } from '../types/diagram'
import './SystemAnalysisPanel.css'

interface SystemAnalysisPanelProps {
  analysis: SystemAnalysis | null
}

const SystemAnalysisPanel: React.FC<SystemAnalysisPanelProps> = ({ analysis }) => {
  const [activeSection, setActiveSection] = useState<string>('functional')

  if (!analysis) {
    return (
      <div className="analysis-panel empty">
        <div className="empty-state">
          <h3>No Analysis Available</h3>
          <p>Generate a system design to see detailed analysis</p>
        </div>
      </div>
    )
  }

  const sections = [
    { id: 'functional', label: 'Requirements', icon: '📋' },
    { id: 'capacity', label: 'Capacity', icon: '📊' },
    { id: 'entities', label: 'Entities & APIs', icon: '🔧' },
    { id: 'database', label: 'Database', icon: '💾' },
    { id: 'challenges', label: 'Challenges', icon: '⚡' },
    { id: 'tradeoffs', label: 'Trade-offs', icon: '⚖️' }
  ]

  const renderFunctionalRequirements = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>Core Requirements (2-3 key)</h4>
        <ul>
          {analysis.functionalRequirements.core.map((req, index) => (
            <li key={index} className="core-requirement">{req}</li>
          ))}
        </ul>
      </div>
      <div className="subsection">
        <h4>Out of Scope</h4>
        <ul>
          {analysis.functionalRequirements.outOfScope.map((req, index) => (
            <li key={index} className="out-of-scope">{req}</li>
          ))}
        </ul>
      </div>
      <div className="subsection">
        <h4>Non-Functional Requirements</h4>
        <ul>
          {analysis.nonFunctionalRequirements.map((nfr, index) => (
            <li key={index} className="nfr">{nfr}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderCapacity = () => (
    <div className="section-content">
      <div className="capacity-grid">
        <div className="capacity-item">
          <h4>Daily Active Users</h4>
          <span className="capacity-value">{analysis.capacityEstimation.dau}</span>
        </div>
        <div className="capacity-item">
          <h4>Read QPS</h4>
          <span className="capacity-value">{analysis.capacityEstimation.readQPS}</span>
        </div>
        <div className="capacity-item">
          <h4>Write QPS</h4>
          <span className="capacity-value">{analysis.capacityEstimation.writeQPS}</span>
        </div>
        <div className="capacity-item">
          <h4>Storage Growth</h4>
          <span className="capacity-value">{analysis.capacityEstimation.storage}</span>
        </div>
      </div>
    </div>
  )

  const renderEntitiesAndAPIs = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>Core Entities</h4>
        <ul>
          {analysis.coreEntities.map((entity, index) => (
            <li key={index} className="entity">{entity}</li>
          ))}
        </ul>
      </div>
      <div className="subsection">
        <h4>Key APIs</h4>
        <ul>
          {analysis.keyAPIs.map((api, index) => (
            <li key={index} className="api-endpoint">{api}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderDatabase = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>Database Choice: {analysis.databaseChoice.type}</h4>
        <div className="database-rationale">
          <p>{analysis.databaseChoice.rationale}</p>
        </div>
      </div>
      <div className="subsection">
        <h4>Schema Design</h4>
        <pre className="schema-code">{analysis.databaseChoice.schema}</pre>
      </div>
    </div>
  )

  const renderChallenges = () => (
    <div className="section-content">
      {analysis.keyChallenges.map((challenge, index) => (
        <div key={index} className="challenge-item">
          <h4 className="challenge-title">{challenge.challenge}</h4>
          
          <div className="solutions">
            <div className="solution bad">
              <h5>❌ Bad Solution</h5>
              <p>{challenge.solutions.bad}</p>
            </div>
            
            <div className="solution good">
              <h5>⚠️ Good Solution</h5>
              <p>{challenge.solutions.good}</p>
            </div>
            
            <div className="solution great">
              <h5>✅ Great Solution</h5>
              <p>{challenge.solutions.great}</p>
            </div>
          </div>
          
          <div className="data-flow">
            <h5>Data Flow</h5>
            <code>{challenge.dataFlow}</code>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTradeoffs = () => (
    <div className="section-content">
      <div className="tradeoffs-summary">
        <h4>System Trade-offs & Business Impact</h4>
        <p>{analysis.tradeoffs}</p>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'functional': return renderFunctionalRequirements()
      case 'capacity': return renderCapacity()
      case 'entities': return renderEntitiesAndAPIs()
      case 'database': return renderDatabase()
      case 'challenges': return renderChallenges()
      case 'tradeoffs': return renderTradeoffs()
      default: return renderFunctionalRequirements()
    }
  }

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h3>System Design Analysis</h3>
        <p>45-minute interview format with leadership insights</p>
      </div>
      
      <div className="panel-navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>
      
      <div className="panel-content">
        {renderSection()}
      </div>
    </div>
  )
}

export default SystemAnalysisPanel