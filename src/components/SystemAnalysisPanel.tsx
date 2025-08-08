import { useState } from 'react'
import './SystemAnalysisPanel.css'
import type { SystemAnalysis } from '../types/diagram'

interface SystemAnalysisPanelProps {
  analysis: SystemAnalysis | null
}

type SectionKey = 'requirements' | 'capacity' | 'apis' | 'database' | 'challenges' | 'tradeoffs'

const sections = [
  { key: 'requirements' as SectionKey, label: 'Requirements', icon: '📋' },
  { key: 'capacity' as SectionKey, label: 'Capacity', icon: '📊' },
  { key: 'apis' as SectionKey, label: 'APIs', icon: '🔌' },
  { key: 'database' as SectionKey, label: 'Database', icon: '🗄️' },
  { key: 'challenges' as SectionKey, label: 'Challenges', icon: '⚡' },
  { key: 'tradeoffs' as SectionKey, label: 'Trade-offs', icon: '⚖️' }
]

export default function SystemAnalysisPanel({ analysis }: SystemAnalysisPanelProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('requirements')

  if (!analysis) {
    return (
      <div className="analysis-panel empty">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Analysis Available</h3>
          <p>Generate a system diagram to see the analysis</p>
        </div>
      </div>
    )
  }

  const renderRequirements = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>Functional Requirements</h4>
        <ul>
          {analysis.requirements.functional.map((req, index) => (
            <li key={index} className="core-requirement">{req}</li>
          ))}
        </ul>
      </div>
      <div className="subsection">
        <h4>Non-Functional Requirements</h4>
        <ul>
          {analysis.requirements.nonFunctional.map((req, index) => (
            <li key={index} className="nfr">{req}</li>
          ))}
        </ul>
      </div>
      <div className="subsection">
        <h4>Out of Scope</h4>
        <ul>
          {analysis.requirements.outOfScope.map((req, index) => (
            <li key={index} className="out-of-scope">{req}</li>
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
          <div className="capacity-value">{analysis.capacity.dau}</div>
        </div>
        <div className="capacity-item">
          <h4>Peak QPS</h4>
          <div className="capacity-value">{analysis.capacity.peakQps}</div>
        </div>
        <div className="capacity-item">
          <h4>Storage</h4>
          <div className="capacity-value">{analysis.capacity.storage}</div>
        </div>
        <div className="capacity-item">
          <h4>Bandwidth</h4>
          <div className="capacity-value">{analysis.capacity.bandwidth}</div>
        </div>
      </div>
    </div>
  )

  const renderApis = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>API Endpoints</h4>
        {analysis.apis.map((api, index) => (
          <div key={index} className="api-endpoint">
            <strong>{api.endpoint}</strong>
            <p>{api.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDatabase = () => (
    <div className="section-content">
      <div className="subsection">
        <h4>Database Choice: {analysis.database.choice}</h4>
        <div className="database-rationale">
          <p>{analysis.database.rationale}</p>
        </div>
        {analysis.database.schema && (
          <>
            <h4>Schema Design</h4>
            <div className="schema-code">
              {analysis.database.schema}
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderChallenges = () => (
    <div className="section-content">
      {analysis.challenges.map((challenge, index) => (
        <div key={index} className="challenge-item">
          <h3 className="challenge-title">{challenge.title}</h3>
          <div className="solutions">
            {challenge.solutions.map((solution, sIndex) => (
              <div key={sIndex} className={`solution ${solution.type}`}>
                <h5>{solution.title}</h5>
                <p>{solution.description}</p>
              </div>
            ))}
          </div>
          {challenge.dataFlow && (
            <div className="data-flow">
              <h5>Data Flow</h5>
              <code>{challenge.dataFlow}</code>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderTradeoffs = () => (
    <div className="section-content">
      <div className="tradeoffs-summary">
        <h4>Key Trade-offs</h4>
        <p>{analysis.tradeoffs.summary}</p>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'requirements':
        return renderRequirements()
      case 'capacity':
        return renderCapacity()
      case 'apis':
        return renderApis()
      case 'database':
        return renderDatabase()
      case 'challenges':
        return renderChallenges()
      case 'tradeoffs':
        return renderTradeoffs()
      default:
        return null
    }
  }

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h3>System Analysis</h3>
        <p>Comprehensive system design breakdown</p>
      </div>
      
      <div className="panel-navigation">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`nav-button ${activeSection === section.key ? 'active' : ''}`}
            onClick={() => setActiveSection(section.key)}
          >
            <div className="nav-icon">{section.icon}</div>
            <div className="nav-label">{section.label}</div>
          </button>
        ))}
      </div>
      
      <div className="panel-content">
        {renderSection()}
      </div>
    </div>
  )
}