import type { DiagramData } from '../types/diagram'

const SYSTEM_PROMPT = `You are a system architecture expert. When given a system design prompt, you must respond with ONLY a valid JSON object that describes the system architecture and comprehensive analysis.

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
        "endpoint": "API endpoint path",
        "description": "What this endpoint does"
      }
    ],
    "database": {
      "choice": "Database technology chosen",
      "rationale": "Why this database was selected",
      "schema": "Optional schema design"
    },
    "challenges": [
      {
        "title": "Major system challenge",
        "solutions": [
          {
            "type": "bad",
            "title": "Poor solution",
            "description": "Why this approach fails"
          },
          {
            "type": "good",
            "title": "Decent solution", 
            "description": "A workable but not optimal approach"
          },
          {
            "type": "great",
            "title": "Excellent solution",
            "description": "The recommended approach and why"
          }
        ],
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
- database: Databases
- cache: Caching systems (Redis, Memcached)
- queue: Message queues (RabbitMQ, Kafka)
- cdn: Content delivery networks
- service: Microservices or general services

Position components logically:
- Users typically on the left (x: 50-100)
- Load balancers and CDNs near the front (x: 200-300)
- Web servers in the middle (x: 350-500)
- Backend services and APIs (x: 500-650)
- Databases and storage on the right (x: 650+)
- Spread vertically (y: 50-400) to avoid overlap

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
      max_tokens: 3000
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
    return JSON.parse(content)
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
      max_tokens: 3000,
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
    return JSON.parse(content)
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