import type { DiagramData } from '../types/diagram'
import { selectPatterns, stripPatternFlags } from './patternSelector'
import { applyPatterns } from './patternApplier'

// Designer/Refiner output contract
const DESIGN_OUTPUT_PROMPT = `You are a system architecture expert. When given a system design prompt, you must respond with ONLY a valid JSON object that describes the system architecture and comprehensive analysis.

Include 5-7 key architectural challenges in the analysis. Mention microservices, CDNs, change data capture (CDC), and sharding strategies when relevant.

The JSON should have this exact structure:
{
  "components": [
    {
      "id": "unique-id",
      "type": "component-type",
      "label": "Display Name",
      "x": number,
      "y": number
    }
  ],
  "connections": [
    {
      "from": "component-id",
      "to": "component-id",
      "label": "optional-connection-label"
    }
  ],
  "analysis": {
    "requirements": {
      "functional": ["Core features the system must support"],
      "nonFunctional": ["Performance, scalability, reliability requirements"],
      "outOfScope": ["Features explicitly not included in this design"]
    },
    "capacity": {
      "dau": "Daily active users estimate",
      "peakQps": "Peak queries per second",
      "storage": "Total storage requirements",
      "bandwidth": "Network bandwidth needs"
    },
    "apis": [
      {
        "endpoint": "/api/v1/resource",
        "method": "POST",
        "description": "Brief description of what this endpoint does",
        "requestType": "JSON",
        "responseType": "JSON",
        "requestBody": {
          "example": {
            "field1": "string",
            "field2": "number",
            "nested": {
              "subField": "value"
            }
          },
          "schema": "Brief description of request structure"
        },
        "responseBody": {
          "success": {
            "example": {
              "id": "string",
              "status": "success",
              "data": {}
            },
            "schema": "Description of successful response"
          },
          "error": {
            "example": {
              "error": "string",
              "code": "ERROR_CODE",
              "message": "Error description"
            },
            "schema": "Description of error response"
          }
        },
        "statusCodes": {
          "200": "Success - Resource created/retrieved",
          "400": "Bad Request - Invalid input",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Insufficient permissions",
          "404": "Not Found - Resource doesn't exist",
          "500": "Internal Server Error - Server error"
        },
        "headers": {
          "required": ["Content-Type: application/json", "Authorization: Bearer token"],
          "optional": ["X-Request-ID: uuid"]
        },
        "queryParams": {
          "limit": "Number of items to return (default: 10, max: 100)",
          "offset": "Number of items to skip for pagination (default: 0)",
          "sort": "Sort field and direction (e.g., 'createdAt:desc', 'name:asc')",
          "filter": "Filter criteria using field:value syntax (optional)",
          "search": "Search term for text fields (optional)",
          "include": "Related resources to include (comma-separated)",
          "fields": "Specific fields to return (comma-separated, default: all)",
          "format": "Response format (json/xml/csv, default: json)"
        },
        "pathParams": {
          "id": "Primary resource identifier (UUID/string/number)",
          "parentId": "Parent resource identifier (UUID/string)",
          "version": "API version or resource version (v1/v2 or semantic version)"
        },
        "authentication": "Bearer token, API key, or OAuth2",
        "rateLimit": "100 requests per minute per user",
        "caching": "Response cached for 5 minutes",
        "notes": ["Additional implementation notes", "Edge cases to consider"]
      }
    ],
    "database": {
      "choice": "Database technology chosen (e.g., PostgreSQL, MySQL, DynamoDB, MongoDB)",
      "rationale": "Why this database was selected over alternatives",
      "schema": {
        "relational": {
          "tables": [
            {
              "name": "table_name",
              "columns": [
                {
                  "name": "column_name",
                  "type": "data_type",
                  "constraints": ["PRIMARY KEY", "FOREIGN KEY", "NOT NULL", "UNIQUE"],
                  "references": "other_table.column (for FK)"
                }
              ],
              "indexes": ["index descriptions and rationale"],
              "capacity": {
                "recordsPerYear": "estimated records per year",
                "bytesPerRecord": "estimated bytes per record",
                "totalStoragePerYear": "calculated storage per year",
                "growthProjection": "1-5 year growth estimate including indexes and redundancy"
              }
            }
          ]
        },
        "nosql": {
          "tables": [
            {
              "name": "table_name",
              "partitionKey": "primary partition key",
              "sortKey": "optional sort key",
              "attributes": [
                {
                  "name": "attribute_name",
                  "type": "data_type",
                  "description": "purpose of this attribute"
                }
              ],
              "gsi": [
                {
                  "name": "GSI name",
                  "partitionKey": "GSI partition key",
                  "sortKey": "optional GSI sort key",
                  "purpose": "what queries this GSI enables"
                }
              ],
              "lsi": [
                {
                  "name": "LSI name", 
                  "sortKey": "LSI sort key",
                  "purpose": "what queries this LSI enables"
                }
              ],
              "capacity": {
                "recordsPerYear": "estimated records per year (e.g., 100M)",
                "bytesPerRecord": "estimated bytes per record (e.g., 1KB)",
                "totalStoragePerYear": "calculated storage per year (e.g., 100GB/year)",
                "indexOverhead": "additional storage for GSI/LSI (e.g., 50% overhead)",
                "growthProjection": "1-5 year growth estimate with redundancy factor"
              }
            }
          ]
        }
      }
    },
    "enhancements": {
      "caching": {
        "dataCached": "What data is cached",
        "keyFormat": "Cache key naming convention",
        "ttl": "Time-to-live value",
        "invalidation": "Cache invalidation strategy"
      },
      "queues": {
        "purpose": "Why queues are used",
        "workflow": "Message processing workflow"
      },
      "search": {
        "engine": "Search engine technology",
        "indexedFields": ["Fields that are indexed"],
        "resultCaching": "How search results are cached"
      }
    },
    "challenges": [
        {
          "title": "Major system challenge",
          "issueDetail": "Why it matters at scale",
          "solutions": [
            {
              "title": "Solution approach",
              "pros": ["Benefit 1", "Benefit 2"],
              "cons": ["Drawback 1", "Drawback 2"],
              "nfrImpact": "How this option impacts non-functional requirements"
            }
          ],
          "chosenSolution": "Selected option and justification based on capacity calculations",
          "dataFlow": "Optional data flow description"
        }
      ],
    "tradeoffs": {
      "summary": "Key architectural tradeoffs and decisions made"
    }
  }
}

Available component types:
- user: End users/clients
- load-balancer: Load balancers
- web-server: Web/frontend servers
- api-server: API/backend servers
- database: Databases (will render as ellipse)
- cache: Caching systems like Redis, Memcached (will render as diamond)
- queue: Message queues (RabbitMQ, Kafka)
- cdn: Content delivery networks
- service: Microservices or general services

For connections:
- Use bidirectional labels like "Request/Response" or "Read/Write" for two-way data flow
- Include specific operation labels like "POST /api/users", "GET /api/posts", "Cache lookup", "DB query"
- For real-time connections use labels like "WebSocket", "Server-Sent Events", "Pub/Sub"

For API endpoints:
- ALWAYS include both pathParams and queryParams for realistic APIs
- PathParams: Use for resource identifiers (e.g., {userId}, {orderId}, {messageId})
- QueryParams: Use for filtering, pagination, sorting, formatting (e.g., limit, offset, sort, filter)
- Include comprehensive examples: pagination, search, filtering, includes, field selection
- Show realistic parameter combinations that developers would actually use

Position components with excellent spacing and layered architecture:

HORIZONTAL LAYERS (left to right):
- Layer 1 - Users/Clients: x: 50-120
- Layer 2 - Entry Points: x: 300-400 (Load Balancers, CDN, API Gateways)
- Layer 3 - Application Layer: x: 600-700 (Web Servers, Services)
- Layer 4 - Business Logic: x: 900-1000 (Microservices, APIs)
- Layer 5 - Data Layer: x: 1200+ (Databases, Caches, Queues)

VERTICAL DISTRIBUTION:
- Use full vertical space: y: 50-600
- Minimum 200px vertical gaps between components in same layer
- Stagger components vertically to create clean architectural layers
- Example Layer 3 positions: y: 100, 320, 540 (for 3 services)
- Example Layer 5 positions: y: 80, 280, 480 (for 3 databases)

SPACING RULES:
- Minimum 300px horizontal distance between layers
- Minimum 200px vertical distance between components  
- Spread components across multiple rows, not in single horizontal line
- Create clear visual separation between architectural tiers

LAYOUT EXAMPLES:
For a typical 3-tier architecture:
- Users: (80, 300)
- Load Balancer: (350, 300) 
- Web Server 1: (650, 200)
- Web Server 2: (650, 400)
- API Service 1: (950, 150)
- API Service 2: (950, 350)
- API Service 3: (950, 550)
- Database 1: (1250, 200)
- Database 2: (1250, 450)
- Cache: (1250, 350)

For database analysis:
- Always provide detailed capacity calculations
- For relational databases: include complete schema with PKs, FKs, indexes
- For NoSQL (prefer DynamoDB): show partition/sort keys, GSIs, LSIs
- Calculate realistic storage: records/year × bytes/record = total storage
- Factor in index overhead (typically 20-50% additional storage)
- Include 1-5 year growth projections with redundancy considerations
- Example calculation: 100M records × 1KB = 100GB/year base + 50GB indexes = 150GB/year × 5 years × 2 (redundancy) = 1.5TB total

Respond with ONLY the JSON object, no other text.`

// Planner contract
const PLANNER_PROMPT = `You are the Planner. Interpret a user's system design problem and produce a structured plan that a Designer can implement.

Return ONLY a compact JSON object with fields:
{
  "summary": "one-paragraph restatement of the problem",
  "assumptions": ["explicit constraints and assumptions"],
  "functionalRequirements": ["bullet points"],
  "nonFunctionalRequirements": ["performance, scalability, reliability, security, cost"],
  "keyComponents": ["list of major components/services to include"],
  "dataFlows": ["key flows to support"],
  "apis": ["critical external API surfaces to expose"],
  "capacity": { "dau": "estimate", "peakQps": "estimate", "storage": "estimate", "bandwidth": "estimate" }
}`

// Critic contract
const CRITIC_PROMPT = `You are the Critic. Review a candidate architecture against a plan and quality guidelines. Identify gaps, violations, and improvements.

Return ONLY a JSON object:
{
  "pass": boolean,
  "score": number, // 0-100
  "issues": [
    {
      "title": string,
      "severity": "low"|"medium"|"high",
      "section": "requirements"|"capacity"|"apis"|"database"|"enhancements"|"patterns"|"challenges"|"tradeoffs"|"layout"|"components",
      "detail": string,
      "fix": string
    }
  ],
  "mustFixSummary": string
}`

// Refiner instruction
const REFINER_PROMPT = `You are the Refiner. Using the user's prompt, the Planner plan, and Critic feedback, produce an improved final design.
Follow the Designer output contract strictly and return ONLY the JSON object.`

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function extractJson(text: string): string {
  if (!text) return text
  // Remove code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*[\s\S]*?```/)
  if (fenceMatch) {
    const inner = fenceMatch[0].replace(/```(?:json)?/g, '').replace(/```/g, '')
    return inner.trim()
  }
  // Try to find first and last curly braces for JSON object
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1).trim()
  }
  return text.trim()
}

async function chatOpenAI(messages: ChatMessage[], maxTokens = 3000, temperature = 0.7): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI API key not configured')
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4'
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens })
  })
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
  const data = await response.json()
  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('No response from OpenAI')
  return content
}

async function chatAnthropic(messages: ChatMessage[], maxTokens = 3000): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Anthropic API key not configured')
  const model = import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
  // Combine messages into a single user message for compatibility
  const combined = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: combined }] })
  })
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('No response from Anthropic')
  return content
}

async function chat(messages: ChatMessage[], maxTokens?: number): Promise<string> {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'openai'
  if (provider === 'anthropic') {
    return chatAnthropic(messages, maxTokens)
  }
  return chatOpenAI(messages, maxTokens)
}

interface PlannerPlan {
  summary: string
  assumptions: string[]
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
  keyComponents: string[]
  dataFlows: string[]
  apis: string[]
  capacity: { dau?: string; peakQps?: string; storage?: string; bandwidth?: string }
}

interface CriticReportIssue {
  title: string
  severity: 'low' | 'medium' | 'high'
  section: string
  detail: string
  fix: string
}

interface CriticReport {
  pass: boolean
  score: number
  issues: CriticReportIssue[]
  mustFixSummary?: string
}

export type GenerationStep =
  | 'planner'
  | 'designer'
  | 'critic'
  | 'refiner'
  | 'patterns'
  | 'complete'
  | 'fallback'

export interface ProgressUpdate {
  step: GenerationStep
  message: string
  percent: number
}

export const generateAIDiagramWithProgress = async (
  prompt: string,
  onProgress?: (u: ProgressUpdate) => void
): Promise<DiagramData> => {
  const patterns = selectPatterns(prompt)
  const cleanedPrompt = stripPatternFlags(prompt)

  try {
    // 1) Planner
    onProgress?.({ step: 'planner', message: 'Planning requirements and scope…', percent: 10 })
    const plannerMessages: ChatMessage[] = [
      { role: 'system', content: PLANNER_PROMPT },
      { role: 'user', content: `User prompt: ${cleanedPrompt}` }
    ]
    const plannerRaw = await chat(plannerMessages, 1500)
    const plannerJson = JSON.parse(extractJson(plannerRaw)) as PlannerPlan

    // 2) Designer
    onProgress?.({ step: 'designer', message: 'Designing architecture and analysis…', percent: 40 })
    const designerMessages: ChatMessage[] = [
      { role: 'system', content: DESIGN_OUTPUT_PROMPT },
      { role: 'user', content: `User prompt: ${cleanedPrompt}\n\nPLAN (JSON):\n${JSON.stringify(plannerJson)}` }
    ]
    const designerRaw = await chat(designerMessages, 3000)
    let designCandidate = JSON.parse(extractJson(designerRaw)) as DiagramData

    // 3) Critic
    onProgress?.({ step: 'critic', message: 'Reviewing design for gaps and issues…', percent: 60 })
    const criticMessages: ChatMessage[] = [
      { role: 'system', content: CRITIC_PROMPT },
      { role: 'user', content: `User prompt: ${cleanedPrompt}\n\nPLAN (JSON):\n${JSON.stringify(plannerJson)}\n\nCANDIDATE DESIGN (JSON):\n${JSON.stringify(designCandidate)}` }
    ]
    const criticRaw = await chat(criticMessages, 1500)
    const criticJson = JSON.parse(extractJson(criticRaw)) as CriticReport

    // 4) Refiner (only if needed)
    if (!criticJson.pass || (criticJson.issues && criticJson.issues.length > 0)) {
      onProgress?.({ step: 'refiner', message: 'Applying critic feedback and refining…', percent: 80 })
      const refinerMessages: ChatMessage[] = [
        { role: 'system', content: REFINER_PROMPT },
        { role: 'user', content: `User prompt: ${cleanedPrompt}\n\nPLAN (JSON):\n${JSON.stringify(plannerJson)}\n\nCRITIC REPORT (JSON):\n${JSON.stringify(criticJson)}\n\nCURRENT DESIGN (JSON):\n${JSON.stringify(designCandidate)}` }
      ]
      const refinerRaw = await chat(refinerMessages, 3000)
      designCandidate = JSON.parse(extractJson(refinerRaw)) as DiagramData
    }

    // Apply patterns at the end
    onProgress?.({ step: 'patterns', message: 'Applying detected patterns…', percent: 90 })
    const result = applyPatterns(designCandidate, patterns)
    onProgress?.({ step: 'complete', message: 'Done', percent: 100 })
    return result
  } catch (error) {
    console.warn('AI service failed, falling back to mock data:', error)
    onProgress?.({ step: 'fallback', message: 'AI unavailable. Using mock template…', percent: 95 })
    const { generateMockDiagram } = await import('./mockDiagramGenerator')
    const mock = await generateMockDiagram(cleanedPrompt)
    onProgress?.({ step: 'complete', message: 'Done', percent: 100 })
    return mock
  }
}

// Backwards-compatible API
export const generateAIDiagram = async (prompt: string): Promise<DiagramData> =>
  generateAIDiagramWithProgress(prompt)