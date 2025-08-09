import { useState } from 'react'
import './SystemAnalysisPanel.css'
import type { SystemAnalysis } from '../types/diagram'

interface SystemAnalysisPanelProps {
  diagramData: any | null
}

type SectionKey =
  | 'requirements'
  | 'capacity'
  | 'apis'
  | 'database'
  | 'enhancements'
  | 'challenges'
  | 'tradeoffs'

const sections = [
  { key: 'requirements' as SectionKey, label: 'Requirements', icon: '📋' },
  { key: 'capacity' as SectionKey, label: 'Capacity', icon: '📊' },
  { key: 'apis' as SectionKey, label: 'APIs', icon: '🔌' },
  { key: 'database' as SectionKey, label: 'Database', icon: '🗄️' },
  { key: 'enhancements' as SectionKey, label: 'Enhancements', icon: '✨' },
  { key: 'challenges' as SectionKey, label: 'Challenges', icon: '⚡' },
  { key: 'tradeoffs' as SectionKey, label: 'Trade-offs', icon: '⚖️' }
]

export default function SystemAnalysisPanel({ diagramData }: SystemAnalysisPanelProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('requirements')

  const analysis = diagramData?.analysis

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

  const renderApis = () => {
    const renderStatusCodes = (statusCodes: any) => {
      if (!statusCodes) return null
      
      return (
        <div className="status-codes">
          <h6>📊 Status Codes:</h6>
          <div className="status-grid">
            {Object.entries(statusCodes).map(([code, description]) => (
              <div key={code} className={`status-item status-${code.charAt(0)}xx`}>
                <span className="status-code">{code}</span>
                <span className="status-description">{description as string}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    const renderJsonExample = (data: any, title: string) => {
      if (!data) return null
      
      return (
        <div className="json-example">
          <h7>{title}</h7>
          <pre className="json-code">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )
    }
    
    const renderQueryParams = (params: any) => {
      if (!params) return null
      
      return (
        <div className="params-section">
          <h6>🔍 Query Parameters:</h6>
          <div className="params-list">
            {Object.entries(params).map(([param, description]) => (
              <div key={param} className="param-item">
                <code>{param}</code>
                <span>{description as string}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    const renderPathParams = (params: any) => {
      if (!params) return null
      
      return (
        <div className="params-section">
          <h6>🛣️ Path Parameters:</h6>
          <div className="params-list">
            {Object.entries(params).map(([param, description]) => (
              <div key={param} className="param-item">
                <code>{`{${param}}`}</code>
                <span>{description as string}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    const renderHeaders = (headers: any) => {
      if (!headers) return null
      
      return (
        <div className="headers-section">
          <h6>📋 Headers:</h6>
          {headers.required && (
            <div className="header-group">
              <strong>Required:</strong>
              <ul>
                {headers.required.map((header: string, idx: number) => (
                  <li key={idx}><code>{header}</code></li>
                ))}
              </ul>
            </div>
          )}
          {headers.optional && (
            <div className="header-group">
              <strong>Optional:</strong>
              <ul>
                {headers.optional.map((header: string, idx: number) => (
                  <li key={idx}><code>{header}</code></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="section-content">
        <div className="subsection">
          <h4>🔌 API Endpoints</h4>
          {analysis.apis.map((api: any, index: number) => {
            // Handle backward compatibility with old simple format
            if (typeof api === 'object' && api.endpoint && !api.method) {
              // Old format: { endpoint: "POST /api/path", description: "..." }
              const [method, ...pathParts] = api.endpoint.split(' ')
              const path = pathParts.join(' ')
              
              return (
                <div key={index} className="api-endpoint-simple">
                  <div className="api-header">
                    <div className="api-method-url">
                      <span className={`http-method method-${method?.toLowerCase() || 'get'}`}>
                        {method || 'GET'}
                      </span>
                      <code className="api-url">{path || api.endpoint}</code>
                    </div>
                  </div>
                  <div className="api-description">
                    <p>{api.description}</p>
                  </div>
                </div>
              )
            }
            
            // New detailed format
            return (
            <div key={index} className="api-endpoint-detailed">
              <div className="api-header">
                <div className="api-method-url">
                  <span className={`http-method method-${api.method?.toLowerCase() || 'get'}`}>
                    {api.method || 'GET'}
                  </span>
                  <code className="api-url">{api.endpoint}</code>
                </div>
                <div className="api-types">
                  <span className="request-type">{api.requestType || 'JSON'}</span>
                  <span className="arrow">→</span>
                  <span className="response-type">{api.responseType || 'JSON'}</span>
                </div>
              </div>
              
              <div className="api-description">
                <p>{api.description}</p>
              </div>
              
              <div className="api-details">
                {renderPathParams(api.pathParams)}
                {renderQueryParams(api.queryParams)}
                {renderHeaders(api.headers)}
                
                {/* Request/Response Bodies */}
                <div className="request-response-section">
                  {api.requestBody && (
                    <div className="request-section">
                      <h6>📤 Request Body:</h6>
                      {api.requestBody.schema && (
                        <p className="schema-description">{api.requestBody.schema}</p>
                      )}
                      {renderJsonExample(api.requestBody.example, "Example Request:")}
                    </div>
                  )}
                  
                  {api.responseBody && (
                    <div className="response-section">
                      <h6>📥 Response Body:</h6>
                      {api.responseBody.success && (
                        <div className="response-case success-response">
                          <h7>✅ Success Response:</h7>
                          {api.responseBody.success.schema && (
                            <p className="schema-description">{api.responseBody.success.schema}</p>
                          )}
                          {renderJsonExample(api.responseBody.success.example, "Example:")}
                        </div>
                      )}
                      
                      {api.responseBody.error && (
                        <div className="response-case error-response">
                          <h7>❌ Error Response:</h7>
                          {api.responseBody.error.schema && (
                            <p className="schema-description">{api.responseBody.error.schema}</p>
                          )}
                          {renderJsonExample(api.responseBody.error.example, "Example:")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {renderStatusCodes(api.statusCodes)}
                
                {/* Additional Info */}
                <div className="api-metadata">
                  {api.authentication && (
                    <div className="metadata-item">
                      <strong>🔐 Authentication:</strong> {api.authentication}
                    </div>
                  )}
                  {api.rateLimit && (
                    <div className="metadata-item">
                      <strong>⏱️ Rate Limit:</strong> {api.rateLimit}
                    </div>
                  )}
                  {api.caching && (
                    <div className="metadata-item">
                      <strong>💾 Caching:</strong> {api.caching}
                    </div>
                  )}
                </div>
                
                {api.notes && api.notes.length > 0 && (
                  <div className="api-notes">
                    <h6>📝 Implementation Notes:</h6>
                    <ul>
                      {api.notes.map((note: string, noteIdx: number) => (
                        <li key={noteIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDatabase = () => {
    const renderSchemaTable = (table: any, type: 'relational' | 'nosql') => {
      if (type === 'relational') {
        return (
          <div key={table.name} className="table-schema">
            <h5>📋 {table.name}</h5>
            <div className="columns-section">
              <h6>Columns:</h6>
              <div className="columns-grid">
                {table.columns?.map((col: any, idx: number) => (
                  <div key={idx} className="column-item">
                    <strong>{col.name}</strong> ({col.type})
                    {col.constraints?.length > 0 && (
                      <div className="constraints">
                        {col.constraints.map((constraint: string, cIdx: number) => (
                          <span key={cIdx} className={`constraint ${constraint.toLowerCase().replace(' ', '-')}`}>
                            {constraint}
                          </span>
                        ))}
                      </div>
                    )}
                    {col.references && <div className="reference">→ {col.references}</div>}
                  </div>
                ))}
              </div>
            </div>
            {table.indexes?.length > 0 && (
              <div className="indexes-section">
                <h6>🔍 Indexes:</h6>
                <ul>
                  {table.indexes.map((index: string, idx: number) => (
                    <li key={idx}>{index}</li>
                  ))}
                </ul>
              </div>
            )}
            {table.capacity && (
              <div className="capacity-section">
                <h6>📊 Capacity Planning:</h6>
                <div className="capacity-details">
                  <div>📈 Records/Year: {table.capacity.recordsPerYear}</div>
                  <div>💾 Bytes/Record: {table.capacity.bytesPerRecord}</div>
                  <div>🗄️ Total Storage: {table.capacity.totalStoragePerYear}</div>
                  <div>📅 Growth Projection: {table.capacity.growthProjection}</div>
                </div>
              </div>
            )}
          </div>
        )
      } else {
        // NoSQL rendering
        return (
          <div key={table.name} className="table-schema nosql">
            <h5>🔷 {table.name}</h5>
            <div className="keys-section">
              <div className="key-item">
                <strong>Partition Key:</strong> {table.partitionKey}
              </div>
              {table.sortKey && (
                <div className="key-item">
                  <strong>Sort Key:</strong> {table.sortKey}
                </div>
              )}
            </div>
            <div className="attributes-section">
              <h6>Attributes:</h6>
              <div className="attributes-grid">
                {table.attributes?.map((attr: any, idx: number) => (
                  <div key={idx} className="attribute-item">
                    <strong>{attr.name}</strong> ({attr.type})
                    <div className="description">{attr.description}</div>
                  </div>
                ))}
              </div>
            </div>
            {table.gsi?.length > 0 && (
              <div className="gsi-section">
                <h6>🔍 Global Secondary Indexes:</h6>
                {table.gsi.map((gsi: any, idx: number) => (
                  <div key={idx} className="index-item">
                    <strong>{gsi.name}</strong>
                    <div>PK: {gsi.partitionKey} {gsi.sortKey && `| SK: ${gsi.sortKey}`}</div>
                    <div className="purpose">{gsi.purpose}</div>
                  </div>
                ))}
              </div>
            )}
            {table.lsi?.length > 0 && (
              <div className="lsi-section">
                <h6>🔍 Local Secondary Indexes:</h6>
                {table.lsi.map((lsi: any, idx: number) => (
                  <div key={idx} className="index-item">
                    <strong>{lsi.name}</strong>
                    <div>SK: {lsi.sortKey}</div>
                    <div className="purpose">{lsi.purpose}</div>
                  </div>
                ))}
              </div>
            )}
            {table.capacity && (
              <div className="capacity-section">
                <h6>📊 Capacity Planning:</h6>
                <div className="capacity-details">
                  <div>📈 Records/Year: {table.capacity.recordsPerYear}</div>
                  <div>💾 Bytes/Record: {table.capacity.bytesPerRecord}</div>
                  <div>🗄️ Total Storage: {table.capacity.totalStoragePerYear}</div>
                  <div>📋 Index Overhead: {table.capacity.indexOverhead}</div>
                  <div>📅 Growth Projection: {table.capacity.growthProjection}</div>
                </div>
              </div>
            )}
          </div>
        )
      }
    }

    return (
      <div className="section-content">
        <div className="subsection">
          <h4>🗄️ Database Choice: {analysis.database.choice}</h4>
          <div className="database-rationale">
            <p>{analysis.database.rationale}</p>
          </div>
          
          {analysis.database.schema && (
            <div className="schema-section">
              <h4>📋 Schema Design</h4>
              
              {/* Handle both old string format and new object format */}
              {typeof analysis.database.schema === 'string' ? (
                <div className="schema-code">
                  <pre>{analysis.database.schema}</pre>
                </div>
              ) : (
                <div className="schema-tables">
                  {/* Relational Database Schema */}
                  {analysis.database.schema.relational?.tables && (
                    <div className="relational-section">
                      <h5>🏛️ Relational Schema</h5>
                      {analysis.database.schema.relational.tables.map((table: any) => 
                        renderSchemaTable(table, 'relational')
                      )}
                    </div>
                  )}
                  
                  {/* NoSQL Database Schema */}
                  {analysis.database.schema.nosql?.tables && (
                    <div className="nosql-section">
                      <h5>🔷 NoSQL Schema</h5>
                      {analysis.database.schema.nosql.tables.map((table: any) => 
                        renderSchemaTable(table, 'nosql')
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderEnhancements = () => {
    if (!analysis.enhancements) {
      return <div className="section-content">No enhancement data</div>
    }
    const { caching, queues, search } = analysis.enhancements
    return (
      <div className="section-content">
        <div className="subsection">
          <h4>Caching</h4>
          <p>
            <strong>Data Cached:</strong> {caching?.dataCached || 'N/A'}
          </p>
          <p>
            <strong>Key Format:</strong> {caching?.keyFormat || 'N/A'}
          </p>
          <p>
            <strong>TTL:</strong> {caching?.ttl || 'N/A'}
          </p>
          <p>
            <strong>Invalidation:</strong> {caching?.invalidation || 'N/A'}
          </p>
        </div>
        <div className="subsection">
          <h4>Queues</h4>
          <p>
            <strong>Purpose:</strong> {queues?.purpose || 'N/A'}
          </p>
          <p>
            <strong>Workflow:</strong> {queues?.workflow || 'N/A'}
          </p>
        </div>
        <div className="subsection">
          <h4>Search</h4>
          <p>
            <strong>Engine:</strong> {search?.engine || 'N/A'}
          </p>
          <p>
            <strong>Indexed Fields:</strong>{' '}
            {search?.indexedFields?.join(', ') || 'N/A'}
          </p>
          <p>
            <strong>Result Caching:</strong> {search?.resultCaching || 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  const renderChallenges = () => (
    <div className="section-content">
      {analysis.challenges.map((challenge, index) => (
        <div key={index} className="challenge-item">
          <h3 className="challenge-title">{challenge.title}</h3>
          <p className="challenge-detail">{challenge.issueDetail}</p>
          <div className="solutions">
            {challenge.solutions.map((solution, sIndex) => (
              <div key={sIndex} className="solution">
                <h5>{solution.title}</h5>
                <div className="solution-details">
                  <div className="pros">
                    <strong>Pros:</strong>
                    <ul>
                      {solution.pros.map((pro, pIndex) => (
                        <li key={pIndex}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons">
                    <strong>Cons:</strong>
                    <ul>
                      {solution.cons.map((con, cIndex) => (
                        <li key={cIndex}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="nfr-impact"><strong>NFR Impact:</strong> {solution.nfrImpact}</p>
              </div>
            ))}
          </div>
          <div className="chosen-solution">
            <h5>Chosen Solution</h5>
            <p>{challenge.chosenSolution}</p>
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
      case 'enhancements':
        return renderEnhancements()
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