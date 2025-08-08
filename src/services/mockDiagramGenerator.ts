import type { DiagramData } from '../types/diagram'

const componentTemplates = {
  'chat-app': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 150, details: 'Mobile/Web Clients' },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 200, y: 50, details: 'Static Assets' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 200, y: 150, details: 'NGINX/ALB' },
      { id: 'gateway', type: 'api-gateway', label: 'API Gateway', x: 350, y: 150, details: 'Rate Limiting' },
      { id: 'auth', type: 'auth-service', label: 'Auth Service', x: 500, y: 50, details: 'JWT Tokens' },
      { id: 'chat', type: 'service', label: 'Chat Service', x: 500, y: 150, details: 'WebSocket' },
      { id: 'notification', type: 'notification-service', label: 'Push Service', x: 500, y: 250, details: 'FCM/APNS' },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 650, y: 150, details: 'Session Store' },
      { id: 'queue', type: 'queue', label: 'Message Queue', x: 650, y: 250, details: 'Apache Kafka' },
      { id: 'db', type: 'database', label: 'PostgreSQL', x: 800, y: 200, details: 'Chat History' }
    ],
    connections: [
      { from: 'user', to: 'cdn', label: 'HTTPS' },
      { from: 'user', to: 'lb', label: 'WSS/HTTPS' },
      { from: 'lb', to: 'gateway', label: 'HTTP/2' },
      { from: 'gateway', to: 'auth', label: 'gRPC' },
      { from: 'gateway', to: 'chat', label: 'gRPC' },
      { from: 'chat', to: 'cache', label: 'Redis Protocol' },
      { from: 'chat', to: 'queue', label: 'Kafka Protocol' },
      { from: 'chat', to: 'notification', label: 'gRPC' },
      { from: 'queue', to: 'db', label: 'SQL' }
    ],
    analysis: {
      functionalRequirements: {
        core: [
          "Real-time messaging between users with <100ms latency",
          "Support for 1:1 and group chats with message history",
          "User authentication and presence status"
        ],
        outOfScope: [
          "File sharing: Complex to implement in 45 minutes",
          "Voice/video calls: Requires WebRTC expertise",
          "Message encryption: Focus on core messaging flows"
        ]
      },
      nonFunctionalRequirements: [
        "Scale to 100M DAU with 10B messages/day",
        "99.9% availability with multi-region deployment", 
        "Low latency <200ms for message delivery globally",
        "Eventual consistency acceptable for message ordering"
      ],
      capacityEstimation: {
        dau: "100M users",
        readQPS: "~115K RPS (100M users × 100 reads/day ÷ 86,400 seconds)",
        writeQPS: "~11.5K RPS (100M users × 10 writes/day ÷ 86,400 seconds)", 
        storage: "~36TB/year (100M users × 10 msg/day × 1KB/msg × 365 days)"
      },
      coreEntities: [
        "User: user_id, username, email, created_at, last_seen",
        "ChatRoom: room_id, name, type (direct/group), participants[], created_at",
        "Message: message_id, room_id, sender_id, content, timestamp, message_type"
      ],
      keyAPIs: [
        "POST /auth/login: User authentication returning JWT token",
        "GET /chats/{roomId}/messages?limit=50: Fetch paginated message history",
        "WebSocket /chat/connect: Real-time bidirectional messaging",
        "POST /chats/{roomId}/messages: Send new message to chat room"
      ],
      databaseChoice: {
        type: "PostgreSQL",
        rationale: "ACID properties ensure message ordering and consistency. Supports JSON for flexible message content. Better than NoSQL for complex queries on message history and user relationships.",
        schema: `Users: user_id (PK), username (UNIQUE), email, password_hash, created_at, last_seen
ChatRooms: room_id (PK), name, type, created_at, INDEX on (created_at)  
Messages: message_id (PK), room_id (FK), sender_id (FK), content, timestamp, INDEX on (room_id, timestamp)
Participants: room_id (FK), user_id (FK), joined_at, COMPOSITE PK (room_id, user_id)`
      },
      keyChallenges: [
        {
          challenge: "Ensuring real-time message delivery at scale with WebSocket connection management",
          solutions: {
            bad: "Single server handles all WebSocket connections - fails at 10K+ concurrent connections due to memory/CPU limits",
            good: "Load balance WebSocket connections across multiple servers with Redis pub/sub - better scalability but complex connection routing",
            great: "Microservice architecture with dedicated WebSocket gateways + Apache Kafka for message routing. Each gateway handles 50K connections, horizontally scalable, with connection state in Redis for failover recovery."
          },
          dataFlow: "Client ⇄ WebSocket Gateway ⇄ Chat Service ⇄ Kafka ⇄ Message Store (PostgreSQL)"
        },
        {
          challenge: "Message ordering and delivery guarantees across distributed services",
          solutions: {
            bad: "No ordering guarantees - messages arrive out of order causing confusion",
            good: "Single writer per chat room ensures ordering but creates bottlenecks for popular rooms",
            great: "Kafka partitioning by room_id ensures ordered delivery per room while allowing parallel processing. Use timestamp + sequence numbers for client-side ordering with idempotency keys for duplicate detection."
          },
          dataFlow: "Chat Service ⇄ Kafka (room_id partition) ⇄ Message Consumer ⇄ PostgreSQL ⇄ WebSocket Fanout"
        }
      ],
      tradeoffs: "Chose availability over strict consistency (AP in CAP theorem) allowing temporary message delays during network partitions. PostgreSQL over NoSQL trades some horizontal scaling complexity for stronger consistency guarantees. WebSocket over HTTP polling reduces server load but requires more complex connection management. This design prioritizes user experience (low latency) while maintaining data integrity for chat history."
    }
  },
  'url-shortener': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 150 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 200, y: 50 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 200, y: 150 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 350, y: 150 },
      { id: 'api', type: 'api-server', label: 'URL Service', x: 500, y: 150 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 350, y: 300 },
      { id: 'db', type: 'database', label: 'URL Database', x: 650, y: 200 }
    ],
    connections: [
      { from: 'user', to: 'cdn' },
      { from: 'user', to: 'lb' },
      { from: 'lb', to: 'web' },
      { from: 'web', to: 'api' },
      { from: 'api', to: 'cache' },
      { from: 'api', to: 'db' }
    ]
  },
  'social-media': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 200 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 200, y: 50 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 200, y: 150 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 350, y: 150 },
      { id: 'api', type: 'api-server', label: 'Feed API', x: 500, y: 100 },
      { id: 'post-service', type: 'service', label: 'Post Service', x: 500, y: 200 },
      { id: 'user-service', type: 'service', label: 'User Service', x: 500, y: 300 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 650, y: 100 },
      { id: 'queue', type: 'queue', label: 'Message Queue', x: 650, y: 200 },
      { id: 'user-db', type: 'database', label: 'User DB', x: 800, y: 250 },
      { id: 'post-db', type: 'database', label: 'Post DB', x: 800, y: 350 }
    ],
    connections: [
      { from: 'user', to: 'cdn' },
      { from: 'user', to: 'lb' },
      { from: 'lb', to: 'web' },
      { from: 'web', to: 'api' },
      { from: 'api', to: 'cache' },
      { from: 'api', to: 'post-service' },
      { from: 'api', to: 'user-service' },
      { from: 'post-service', to: 'queue' },
      { from: 'post-service', to: 'post-db' },
      { from: 'user-service', to: 'user-db' }
    ]
  },
  'e-commerce': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 200 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 200, y: 50 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 200, y: 150 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 350, y: 150 },
      { id: 'product-api', type: 'api-server', label: 'Product API', x: 500, y: 100 },
      { id: 'order-api', type: 'api-server', label: 'Order API', x: 500, y: 200 },
      { id: 'payment-api', type: 'api-server', label: 'Payment API', x: 500, y: 300 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 650, y: 150 },
      { id: 'search', type: 'service', label: 'Search Engine', x: 350, y: 300 },
      { id: 'product-db', type: 'database', label: 'Product DB', x: 750, y: 100 },
      { id: 'order-db', type: 'database', label: 'Order DB', x: 750, y: 250 },
      { id: 'user-db', type: 'database', label: 'User DB', x: 750, y: 350 }
    ],
    connections: [
      { from: 'user', to: 'cdn' },
      { from: 'user', to: 'lb' },
      { from: 'lb', to: 'web' },
      { from: 'web', to: 'product-api' },
      { from: 'web', to: 'order-api' },
      { from: 'web', to: 'payment-api' },
      { from: 'web', to: 'search' },
      { from: 'product-api', to: 'cache' },
      { from: 'product-api', to: 'product-db' },
      { from: 'order-api', to: 'order-db' },
      { from: 'payment-api', to: 'user-db' }
    ]
  },
  'video-streaming': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 200 },
      { id: 'cdn', type: 'cdn', label: 'Global CDN', x: 200, y: 50 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 200, y: 150 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 350, y: 150 },
      { id: 'video-api', type: 'api-server', label: 'Video API', x: 500, y: 100 },
      { id: 'upload-service', type: 'service', label: 'Upload Service', x: 500, y: 200 },
      { id: 'transcode', type: 'service', label: 'Transcoding', x: 500, y: 300 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 650, y: 150 },
      { id: 'queue', type: 'queue', label: 'Processing Queue', x: 650, y: 300 },
      { id: 'metadata-db', type: 'database', label: 'Metadata DB', x: 800, y: 150 },
      { id: 'blob-storage', type: 'database', label: 'Blob Storage', x: 800, y: 300 }
    ],
    connections: [
      { from: 'user', to: 'cdn' },
      { from: 'user', to: 'lb' },
      { from: 'lb', to: 'web' },
      { from: 'web', to: 'video-api' },
      { from: 'video-api', to: 'cache' },
      { from: 'video-api', to: 'upload-service' },
      { from: 'upload-service', to: 'queue' },
      { from: 'queue', to: 'transcode' },
      { from: 'transcode', to: 'blob-storage' },
      { from: 'video-api', to: 'metadata-db' }
    ]
  }
}

export const generateMockDiagram = async (prompt: string): Promise<DiagramData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  const normalizedPrompt = prompt.toLowerCase()
  
  let selectedTemplate = 'chat-app' // default

  if (normalizedPrompt.includes('url') || normalizedPrompt.includes('shortener') || normalizedPrompt.includes('link')) {
    selectedTemplate = 'url-shortener'
  } else if (normalizedPrompt.includes('social') || normalizedPrompt.includes('feed') || normalizedPrompt.includes('timeline')) {
    selectedTemplate = 'social-media'
  } else if (normalizedPrompt.includes('e-commerce') || normalizedPrompt.includes('shop') || normalizedPrompt.includes('store')) {
    selectedTemplate = 'e-commerce'
  } else if (normalizedPrompt.includes('video') || normalizedPrompt.includes('streaming') || normalizedPrompt.includes('netflix')) {
    selectedTemplate = 'video-streaming'
  } else if (normalizedPrompt.includes('chat') || normalizedPrompt.includes('messaging') || normalizedPrompt.includes('whatsapp')) {
    selectedTemplate = 'chat-app'
  }

  const template = componentTemplates[selectedTemplate as keyof typeof componentTemplates]
  
  return {
    components: template.components.map(comp => ({ ...comp })),
    connections: template.connections.map(conn => ({ ...conn }))
  }
}