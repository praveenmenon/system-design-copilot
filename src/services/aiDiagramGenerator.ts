import type { DiagramData } from '../types/diagram'

const SYSTEM_PROMPT = `You are a senior staff engineer conducting a system design interview. Given a system design prompt, respond with a JSON object containing both the visual diagram AND a comprehensive structured analysis.

The JSON should have this exact structure:
{
  "components": [
    {
      "id": "unique-id",
      "type": "component-type", 
      "label": "Display Name",
      "x": number,
      "y": number,
      "details": "brief technical detail"
    }
  ],
  "connections": [
    {
      "from": "component-id",
      "to": "component-id",
      "label": "protocol/method (e.g., HTTPS, gRPC)"
    }
  ],
  "analysis": {
    "functionalRequirements": {
      "core": ["2-3 key requirements"],
      "outOfScope": ["requirement: reason for exclusion"]
    },
    "nonFunctionalRequirements": [
      "Scale to X DAU with justification",
      "Low latency <Xms for specific flows",
      "High availability vs consistency trade-offs"
    ],
    "capacityEstimation": {
      "dau": "100M users",
      "readQPS": "calculation with assumptions",
      "writeQPS": "calculation with assumptions",
      "storage": "growth projection over 5 years"
    },
    "coreEntities": [
      "Entity: attributes and relationships"
    ],
    "keyAPIs": [
      "GET /endpoint: purpose and response",
      "POST /endpoint: purpose and request/response"
    ],
    "databaseChoice": {
      "type": "SQL/NoSQL",
      "rationale": "why chosen vs alternatives",
      "schema": "table structures with PKs, FKs, indexes"
    },
    "keyChallenges": [
      {
        "challenge": "specific technical challenge",
        "solutions": {
          "bad": "why this approach fails",
          "good": "better approach with trade-offs", 
          "great": "optimal solution with implementation details"
        },
        "dataFlow": "step-by-step flow using ⇄ arrows"
      }
    ],
    "tradeoffs": "overall system trade-offs and business impact"
  }
}

Available component types (be specific):
- user: End users/clients
- cdn: Content Delivery Network
- load-balancer: Load Balancer (specify type)
- api-gateway: API Gateway
- web-server: Web/Frontend servers
- auth-service: Authentication service
- user-service: User management service  
- content-service: Content/business logic service
- notification-service: Notification system
- search-service: Search/indexing service
- payment-service: Payment processing
- cache: Redis/Memcached (specify use case)
- database: Database (specify SQL/NoSQL)
- queue: Message Queue (Kafka/RabbitMQ)
- blob-storage: File/media storage
- monitoring: Monitoring/logging service

Position components in logical layers:
- Users/CDN: x: 50-150
- Load balancers/Gateways: x: 200-300  
- Services layer: x: 400-600
- Data layer: x: 700-900
- Spread vertically to avoid overlap

Focus on leadership, low-level protocols, proactive challenges, and trade-offs. Include reverse engineering comparisons when applicable.

Respond with ONLY the JSON object, no other text.`

async function callOpenAI(prompt: string): Promise<DiagramData> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    // Try to extract JSON if response contains other text
    let jsonContent = content.trim()
    
    // Look for JSON object boundaries
    const jsonStart = jsonContent.indexOf('{')
    const jsonEnd = jsonContent.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1)
    }
    
    // If JSON appears incomplete, try to fix common issues
    if (!jsonContent.endsWith('}')) {
      console.warn('JSON appears incomplete, attempting to fix...')
      // Count braces to see how many are missing
      const openBraces = (jsonContent.match(/{/g) || []).length
      const closeBraces = (jsonContent.match(/}/g) || []).length
      const missingBraces = openBraces - closeBraces
      
      // Add missing closing braces
      for (let i = 0; i < missingBraces; i++) {
        jsonContent += '}'
      }
    }
    
    return JSON.parse(jsonContent)
  } catch (e) {
    console.error('Failed to parse AI response:', content)
    throw new Error('Invalid JSON response from AI')
  }
}

async function callAnthropic(prompt: string): Promise<DiagramData> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\nUser prompt: ${prompt}`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text

  if (!content) {
    throw new Error('No response from Anthropic')
  }

  try {
    // Try to extract JSON if response contains other text
    let jsonContent = content.trim()
    
    // Look for JSON object boundaries
    const jsonStart = jsonContent.indexOf('{')
    const jsonEnd = jsonContent.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1)
    }
    
    // If JSON appears incomplete, try to fix common issues
    if (!jsonContent.endsWith('}')) {
      console.warn('JSON appears incomplete, attempting to fix...')
      // Count braces to see how many are missing
      const openBraces = (jsonContent.match(/{/g) || []).length
      const closeBraces = (jsonContent.match(/}/g) || []).length
      const missingBraces = openBraces - closeBraces
      
      // Add missing closing braces
      for (let i = 0; i < missingBraces; i++) {
        jsonContent += '}'
      }
    }
    
    return JSON.parse(jsonContent)
  } catch (e) {
    console.error('Failed to parse AI response:', content)
    throw new Error('Invalid JSON response from AI')
  }
}

export const generateAIDiagram = async (prompt: string): Promise<DiagramData> => {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'openai'

  try {
    if (provider === 'anthropic') {
      return await callAnthropic(prompt)
    } else {
      return await callOpenAI(prompt)
    }
  } catch (error) {
    console.warn('AI service failed, falling back to mock data:', error)
    // Fallback to mock data if AI service fails
    const { generateMockDiagram } = await import('./mockDiagramGenerator')
    return generateMockDiagram(prompt)
  }
}