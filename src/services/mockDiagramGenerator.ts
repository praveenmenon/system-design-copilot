import type { DiagramData } from '../types/diagram'

const analysisTemplates = {
  'chat-app': {
    requirements: {
      functional: [
        "Send and receive real-time messages",
        "Create and join chat rooms",
        "User authentication and profiles",
        "Message history and search",
        "File and media sharing",
        "Online/offline status indicators"
      ],
      nonFunctional: [
        "Handle 10M+ daily active users",
        "Message delivery latency < 100ms",
        "99.9% uptime availability",
        "Support 50K concurrent connections per server",
        "End-to-end encryption for security"
      ],
      outOfScope: [
        "Video/voice calling features",
        "Advanced moderation tools",
        "Third-party integrations",
        "Mobile push notifications"
      ]
    },
    capacity: {
      dau: "10M users",
      peakQps: "500K requests/sec",
      storage: "50TB messages + 200TB media",
      bandwidth: "10Gbps peak"
    },
    apis: [
      { endpoint: "POST /api/auth/login", description: "User authentication" },
      { endpoint: "GET /api/rooms", description: "List user's chat rooms" },
      { endpoint: "POST /api/rooms/{id}/messages", description: "Send message" },
      { endpoint: "GET /api/rooms/{id}/messages", description: "Get message history" },
      { endpoint: "WebSocket /ws/rooms/{id}", description: "Real-time message stream" }
    ],
    database: {
      choice: "PostgreSQL + Redis + MongoDB",
      rationale: "PostgreSQL for user data and room metadata, Redis for real-time presence and caching, MongoDB for message storage due to flexible schema and horizontal scaling",
      schema: `Users: {id, username, email, password_hash, created_at}\nRooms: {id, name, type, created_by, created_at}\nMessages: {id, room_id, user_id, content, timestamp, message_type}`
    },
    challenges: [
      {
        title: "Real-time Message Delivery at Scale",
        solutions: [
          {
            type: "bad" as const,
            title: "Direct database polling",
            description: "Constantly polling database for new messages creates massive load and poor user experience with high latency"
          },
          {
            type: "good" as const, 
            title: "WebSocket with single server",
            description: "WebSocket provides real-time communication but single server limits scalability and creates single point of failure"
          },
          {
            type: "great" as const,
            title: "WebSocket + Message Queue + Load Balancing",
            description: "Multiple WebSocket servers with message queue (Redis/RabbitMQ) for inter-server communication, load balancer for distribution"
          }
        ],
        dataFlow: "User A sends message → API Server → Message Queue → WebSocket Servers → User B receives message"
      },
      {
        title: "Message Storage and Retrieval",
        solutions: [
          {
            type: "bad" as const,
            title: "Single PostgreSQL instance",
            description: "Relational database becomes bottleneck with high write volume and complex queries for message history"
          },
          {
            type: "good" as const,
            title: "Sharded PostgreSQL",
            description: "Horizontal sharding distributes load but adds complexity for cross-shard queries and maintenance"
          },
          {
            type: "great" as const,
            title: "MongoDB with Time-based Partitioning",
            description: "Document database optimized for write-heavy workloads, automatic sharding, and efficient range queries for message history"
          }
        ]
      }
    ],
    tradeoffs: {
      summary: "Chose availability and partition tolerance over strict consistency (AP in CAP theorem). Messages may arrive out of order occasionally but system remains highly available. Used polyglot persistence trading complexity for optimal performance per data type."
    }
  },
  'url-shortener': {
    requirements: {
      functional: [
        "Shorten long URLs to compact format",
        "Redirect short URLs to original URLs", 
        "Custom alias support",
        "Analytics and click tracking",
        "URL expiration and management"
      ],
      nonFunctional: [
        "Handle 100M URLs shortened daily",
        "Redirect latency < 20ms",
        "99.95% uptime",
        "100:1 read-to-write ratio optimization"
      ],
      outOfScope: [
        "User accounts and dashboard",
        "Advanced analytics reporting",
        "URL preview generation",
        "Bulk URL operations"
      ]
    },
    capacity: {
      dau: "50M users",
      peakQps: "10K writes, 1M reads per second",
      storage: "1TB URL mappings + 10TB analytics",
      bandwidth: "5Gbps peak"
    },
    apis: [
      { endpoint: "POST /api/shorten", description: "Create short URL" },
      { endpoint: "GET /{shortCode}", description: "Redirect to original URL" },
      { endpoint: "GET /api/analytics/{shortCode}", description: "Get URL statistics" }
    ],
    database: {
      choice: "NoSQL (DynamoDB/Cassandra) + Redis",
      rationale: "NoSQL for horizontal scaling and fast key-value lookups, Redis for caching frequently accessed URLs and reducing database load",
      schema: `URLs: {short_code, original_url, created_at, expires_at, click_count}\nAnalytics: {short_code, timestamp, ip_address, user_agent, referrer}`
    },
    challenges: [
      {
        title: "Generating Unique Short Codes",
        solutions: [
          {
            type: "bad" as const,
            title: "Random generation with collision check",
            description: "High probability of collisions at scale, requires multiple database roundtrips"
          },
          {
            type: "good" as const,
            title: "Auto-incrementing counter",
            description: "Guarantees uniqueness but creates single point of failure and predictable URLs"
          },
          {
            type: "great" as const,
            title: "Base62 encoding with distributed counters",
            description: "Multiple counter ranges assigned to different servers, Base62 encoding for compact URLs"
          }
        ]
      }
    ],
    tradeoffs: {
      summary: "Optimized for read-heavy workload with aggressive caching. Chose eventual consistency for better availability. Short codes are not cryptographically secure but prioritized simplicity and performance."
    }
  }
}

const componentTemplates = {
  'chat-app': {
    components: [
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 50 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 250, y: 50 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 450, y: 50 },
      { id: 'api', type: 'api-server', label: 'Chat API', x: 450, y: 150 },
      { id: 'websocket', type: 'service', label: 'WebSocket Service', x: 450, y: 250 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 250, y: 300 },
      { id: 'queue', type: 'queue', label: 'Message Queue', x: 650, y: 200 },
      { id: 'db', type: 'database', label: 'Chat Database', x: 650, y: 350 }
    ],
    connections: [
      { from: 'user', to: 'lb' },
      { from: 'lb', to: 'web' },
      { from: 'web', to: 'api' },
      { from: 'api', to: 'websocket' },
      { from: 'websocket', to: 'cache' },
      { from: 'websocket', to: 'queue' },
      { from: 'queue', to: 'db' }
    ]
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
  const analysis = analysisTemplates[selectedTemplate as keyof typeof analysisTemplates] || analysisTemplates['chat-app']
  
  return {
    components: template.components.map(comp => ({ ...comp })),
    connections: template.connections.map(conn => ({ ...conn })),
    analysis: analysis
  }
}