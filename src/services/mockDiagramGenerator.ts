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
      {
        endpoint: "/api/auth/login",
        method: "POST",
        description: "Authenticate user and return JWT token",
        requestType: "JSON",
        responseType: "JSON",
        requestBody: {
          example: {
            email: "user@example.com",
            password: "securePassword123"
          },
          schema: "User credentials for authentication"
        },
        responseBody: {
          success: {
            example: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                id: "uuid-123",
                email: "user@example.com",
                username: "john_doe"
              },
              expires_in: 3600
            },
            schema: "JWT token with user information"
          },
          error: {
            example: {
              error: "INVALID_CREDENTIALS",
              message: "Email or password is incorrect"
            },
            schema: "Authentication error details"
          }
        },
        statusCodes: {
          "200": "Success - User authenticated",
          "400": "Bad Request - Missing credentials",
          "401": "Unauthorized - Invalid credentials",
          "429": "Too Many Requests - Rate limit exceeded"
        },
        headers: {
          required: ["Content-Type: application/json"],
          optional: ["X-Request-ID: uuid"]
        },
        authentication: "None required for login endpoint",
        rateLimit: "5 requests per minute per IP",
        notes: ["Passwords must be hashed with bcrypt", "Tokens expire after 1 hour"]
      },
      {
        endpoint: "/api/rooms/{roomId}/messages",
        method: "POST",
        description: "Send a message to a chat room",
        requestType: "JSON",
        responseType: "JSON",
        requestBody: {
          example: {
            content: "Hello everyone!",
            type: "text",
            replyTo: "msg-uuid-456"
          },
          schema: "Message content with optional reply reference"
        },
        responseBody: {
          success: {
            example: {
              id: "msg-uuid-789",
              content: "Hello everyone!",
              type: "text",
              userId: "user-uuid-123",
              roomId: "room-uuid-456",
              timestamp: "2024-01-15T10:30:00Z",
              replyTo: "msg-uuid-456"
            },
            schema: "Complete message object with metadata"
          },
          error: {
            example: {
              error: "MESSAGE_TOO_LONG",
              code: "E001",
              message: "Message exceeds 2000 character limit"
            },
            schema: "Message validation error"
          }
        },
        statusCodes: {
          "201": "Created - Message sent successfully",
          "400": "Bad Request - Invalid message format",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Not a room member",
          "404": "Not Found - Room doesn't exist",
          "413": "Payload Too Large - Message too long"
        },
        headers: {
          required: ["Content-Type: application/json", "Authorization: Bearer {token}"],
          optional: ["X-Request-ID: uuid"]
        },
        pathParams: {
          roomId: "Chat room identifier (UUID)"
        },
        authentication: "Bearer JWT token",
        rateLimit: "100 messages per minute per user",
        notes: ["Messages are broadcast via WebSocket", "HTML content is sanitized"]
      },
      {
        endpoint: "/api/rooms/{roomId}/messages",
        method: "GET",
        description: "Retrieve message history for a chat room",
        requestType: "Query Parameters",
        responseType: "JSON",
        responseBody: {
          success: {
            example: {
              messages: [
                {
                  id: "msg-uuid-789",
                  content: "Hello everyone!",
                  userId: "user-uuid-123",
                  username: "john_doe",
                  timestamp: "2024-01-15T10:30:00Z",
                  type: "text"
                }
              ],
              pagination: {
                limit: 50,
                offset: 0,
                total: 1247,
                hasMore: true
              }
            },
            schema: "Paginated list of messages with user info"
          }
        },
        statusCodes: {
          "200": "Success - Messages retrieved",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Not a room member",
          "404": "Not Found - Room doesn't exist"
        },
        headers: {
          required: ["Authorization: Bearer {token}"]
        },
        pathParams: {
          roomId: "Chat room identifier (UUID)"
        },
        queryParams: {
          limit: "Number of messages to return (default: 50, max: 100)",
          offset: "Number of messages to skip (default: 0)",
          since: "ISO timestamp - only return messages after this time"
        },
        authentication: "Bearer JWT token",
        rateLimit: "1000 requests per hour per user",
        caching: "Response cached for 30 seconds"
      },
      {
        endpoint: "/api/users/{userId}/rooms/{roomId}/messages/{messageId}",
        method: "PUT",
        description: "Update or edit a specific message in a room",
        requestType: "JSON",
        responseType: "JSON",
        requestBody: {
          example: {
            content: "Updated message content",
            editReason: "typo correction"
          },
          schema: "Message update with optional edit reason"
        },
        responseBody: {
          success: {
            example: {
              id: "msg-uuid-789",
              content: "Updated message content",
              userId: "user-uuid-123",
              roomId: "room-uuid-456",
              originalContent: "Hello everyone!",
              editedAt: "2024-01-15T10:35:00Z",
              editReason: "typo correction",
              version: 2
            },
            schema: "Updated message with edit history"
          },
          error: {
            example: {
              error: "EDIT_WINDOW_EXPIRED",
              code: "E003",
              message: "Messages can only be edited within 15 minutes"
            },
            schema: "Edit validation error"
          }
        },
        statusCodes: {
          "200": "Success - Message updated",
          "400": "Bad Request - Invalid content",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Not message author or admin",
          "404": "Not Found - Message/room doesn't exist",
          "409": "Conflict - Edit window expired"
        },
        headers: {
          required: ["Content-Type: application/json", "Authorization: Bearer {token}"],
          optional: ["X-Request-ID: uuid", "If-Match: {version}"]
        },
        pathParams: {
          userId: "User identifier (UUID) - must match authenticated user",
          roomId: "Chat room identifier (UUID)",
          messageId: "Message identifier (UUID) to update"
        },
        queryParams: {
          notify: "Send notification to room members (true/false, default: true)",
          version: "Expected message version for optimistic locking (optional)",
          reason: "Edit reason category (typo|correction|clarification, optional)"
        },
        authentication: "Bearer JWT token with message.edit permission",
        rateLimit: "20 edits per hour per user",
        notes: [
          "Messages can only be edited within 15 minutes of creation",
          "Edit history is preserved for audit purposes",
          "Large content changes may require admin approval"
        ]
      },
      {
        endpoint: "/api/users/{userId}/presence",
        method: "PATCH",
        description: "Update user presence status and activity",
        requestType: "JSON",
        responseType: "JSON",
        requestBody: {
          example: {
            status: "online",
            customMessage: "Working on project X",
            activity: {
              type: "typing",
              roomId: "room-uuid-456"
            }
          },
          schema: "Presence status with optional custom message and activity"
        },
        responseBody: {
          success: {
            example: {
              userId: "user-uuid-123",
              status: "online",
              customMessage: "Working on project X",
              lastSeen: "2024-01-15T10:40:00Z",
              activity: {
                type: "typing",
                roomId: "room-uuid-456",
                updatedAt: "2024-01-15T10:40:15Z"
              }
            },
            schema: "Updated presence information with timestamps"
          }
        },
        statusCodes: {
          "200": "Success - Presence updated",
          "400": "Bad Request - Invalid status value",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Cannot update other user's presence"
        },
        headers: {
          required: ["Content-Type: application/json", "Authorization: Bearer {token}"]
        },
        pathParams: {
          userId: "User identifier (UUID) - must match authenticated user"
        },
        queryParams: {
          broadcast: "Broadcast presence change to user's rooms (true/false, default: true)",
          ttl: "Presence timeout in seconds (default: 300, max: 3600)",
          includeActivity: "Include detailed activity info in response (true/false, default: false)"
        },
        authentication: "Bearer JWT token with presence.update permission",
        rateLimit: "60 updates per minute per user",
        caching: "Presence cached for 30 seconds",
        notes: [
          "Presence automatically expires after TTL period",
          "Activity updates are rate-limited separately"
        ]
      }
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
      {
        endpoint: "/api/v1/urls",
        method: "POST",
        description: "Create a shortened URL with optional customization",
        requestType: "JSON",
        responseType: "JSON",
        requestBody: {
          example: {
            originalUrl: "https://www.example.com/very/long/path/to/resource?param1=value1&param2=value2",
            customCode: "my-link",
            expiresAt: "2024-12-31T23:59:59Z",
            description: "Link to project documentation"
          },
          schema: "URL shortening request with optional custom code and expiration"
        },
        responseBody: {
          success: {
            example: {
              id: "url-uuid-123",
              shortCode: "abc123",
              shortUrl: "https://short.ly/abc123",
              originalUrl: "https://www.example.com/very/long/path/to/resource?param1=value1&param2=value2",
              createdAt: "2024-01-15T10:00:00Z",
              expiresAt: "2024-12-31T23:59:59Z",
              clickCount: 0
            },
            schema: "Created short URL with metadata"
          },
          error: {
            example: {
              error: "CUSTOM_CODE_TAKEN",
              code: "E001",
              message: "The custom code 'my-link' is already in use"
            },
            schema: "URL creation error details"
          }
        },
        statusCodes: {
          "201": "Created - Short URL generated successfully",
          "400": "Bad Request - Invalid URL or parameters",
          "401": "Unauthorized - API key required",
          "409": "Conflict - Custom code already exists",
          "429": "Too Many Requests - Rate limit exceeded"
        },
        headers: {
          required: ["Content-Type: application/json"],
          optional: ["Authorization: Bearer {token}", "X-Request-ID: uuid"]
        },
        queryParams: {
          domain: "Custom domain for short URL (default: short.ly)",
          trackClicks: "Enable click tracking (true/false, default: true)",
          generateQR: "Generate QR code (true/false, default: false)"
        },
        authentication: "API key or Bearer token (optional for anonymous URLs)",
        rateLimit: "100 URLs per hour per IP (1000 with authentication)",
        notes: ["URLs without authentication expire after 30 days", "Custom codes must be 3-50 characters"]
      },
      {
        endpoint: "/{shortCode}",
        method: "GET",
        description: "Redirect to original URL and track click analytics",
        requestType: "None",
        responseType: "HTTP Redirect",
        responseBody: {
          success: {
            example: "HTTP 302 Redirect to original URL",
            schema: "Browser redirect with tracking"
          },
          error: {
            example: {
              error: "URL_NOT_FOUND",
              message: "The short URL does not exist or has expired"
            },
            schema: "URL not found error page"
          }
        },
        statusCodes: {
          "302": "Found - Redirecting to original URL",
          "404": "Not Found - Short URL doesn't exist",
          "410": "Gone - URL has expired",
          "429": "Too Many Requests - Rate limit exceeded"
        },
        pathParams: {
          shortCode: "Short URL identifier (3-50 characters, alphanumeric)"
        },
        queryParams: {
          preview: "Show preview page instead of redirecting (true/false, default: false)",
          format: "Response format for preview (html/json, default: html)",
          utm_source: "UTM tracking parameter to append to destination URL",
          utm_medium: "UTM medium parameter to append",
          utm_campaign: "UTM campaign parameter to append"
        },
        rateLimit: "1000 redirects per minute per IP",
        caching: "Short URL mappings cached for 5 minutes",
        notes: ["Click analytics recorded asynchronously", "Malicious URLs are blocked"]
      },
      {
        endpoint: "/api/v1/analytics/{shortCode}/stats",
        method: "GET",
        description: "Get detailed analytics for a shortened URL",
        requestType: "Query Parameters",
        responseType: "JSON",
        responseBody: {
          success: {
            example: {
              shortCode: "abc123",
              originalUrl: "https://www.example.com/page",
              totalClicks: 1247,
              uniqueClicks: 892,
              clicksByDate: [
                { date: "2024-01-15", clicks: 45 },
                { date: "2024-01-16", clicks: 67 }
              ],
              topCountries: [
                { country: "US", clicks: 523 },
                { country: "UK", clicks: 234 }
              ],
              topReferrers: [
                { referrer: "google.com", clicks: 456 },
                { referrer: "twitter.com", clicks: 234 }
              ],
              browserStats: [
                { browser: "Chrome", clicks: 789 },
                { browser: "Safari", clicks: 234 }
              ]
            },
            schema: "Comprehensive click analytics with breakdowns"
          }
        },
        statusCodes: {
          "200": "Success - Analytics retrieved",
          "401": "Unauthorized - Authentication required",
          "403": "Forbidden - Not URL owner",
          "404": "Not Found - Short URL doesn't exist"
        },
        headers: {
          required: ["Authorization: Bearer {token}"]
        },
        pathParams: {
          shortCode: "Short URL identifier to get analytics for"
        },
        queryParams: {
          period: "Time period for analytics (day/week/month/year/all, default: month)",
          startDate: "Start date for custom period (ISO 8601 format)",
          endDate: "End date for custom period (ISO 8601 format)",
          groupBy: "Group results by (date/country/referrer/browser, default: date)",
          limit: "Maximum number of results per category (default: 10, max: 100)",
          timezone: "Timezone for date grouping (default: UTC)"
        },
        authentication: "Bearer token with analytics.read permission",
        rateLimit: "300 requests per hour per user",
        caching: "Analytics cached for 1 hour",
        notes: ["Real-time data may have 5-minute delay", "Historical data retained for 2 years"]
      }
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
      { id: 'user', type: 'user', label: 'Users', x: 50, y: 200, details: 'Mobile/Web Clients' },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 250, y: 50, details: 'Static Assets' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 250, y: 200, details: 'NGINX/ALB' },
      { id: 'gateway', type: 'api-gateway', label: 'API Gateway', x: 450, y: 200, details: 'Rate Limiting' },
      { id: 'auth', type: 'auth-service', label: 'Auth Service', x: 650, y: 50, details: 'JWT Tokens' },
      { id: 'chat', type: 'service', label: 'Chat Service', x: 650, y: 200, details: 'WebSocket' },
      { id: 'notification', type: 'notification-service', label: 'Push Service', x: 650, y: 350, details: 'FCM/APNS' },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 850, y: 150, details: 'Session Store' },
      { id: 'queue', type: 'queue', label: 'Message Queue', x: 850, y: 300, details: 'Apache Kafka' },
      { id: 'db', type: 'database', label: 'PostgreSQL', x: 1050, y: 225, details: 'Chat History' }
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
      { id: 'user', type: 'user', label: 'Users', x: 80, y: 300 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 350, y: 150 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 350, y: 300 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 620, y: 250 },
      { id: 'api', type: 'api-server', label: 'URL Service', x: 620, y: 400 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 920, y: 200 },
      { id: 'db', type: 'database', label: 'URL Database', x: 920, y: 400 }
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
      { id: 'user', type: 'user', label: 'Users', x: 80, y: 350 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 350, y: 150 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 350, y: 350 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 620, y: 350 },
      { id: 'api', type: 'api-server', label: 'Feed API', x: 920, y: 150 },
      { id: 'post-service', type: 'service', label: 'Post Service', x: 920, y: 350 },
      { id: 'user-service', type: 'service', label: 'User Service', x: 920, y: 550 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 1220, y: 200 },
      { id: 'queue', type: 'queue', label: 'Message Queue', x: 1220, y: 400 },
      { id: 'user-db', type: 'database', label: 'User DB', x: 1520, y: 300 },
      { id: 'post-db', type: 'database', label: 'Post DB', x: 1520, y: 500 }
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
      { id: 'user', type: 'user', label: 'Users', x: 80, y: 400 },
      { id: 'cdn', type: 'cdn', label: 'CDN', x: 350, y: 200 },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', x: 350, y: 400 },
      { id: 'web', type: 'web-server', label: 'Web Servers', x: 620, y: 400 },
      { id: 'product-api', type: 'api-server', label: 'Product API', x: 920, y: 200 },
      { id: 'order-api', type: 'api-server', label: 'Order API', x: 920, y: 400 },
      { id: 'payment-api', type: 'api-server', label: 'Payment API', x: 920, y: 600 },
      { id: 'cache', type: 'cache', label: 'Redis Cache', x: 1220, y: 250 },
      { id: 'search', type: 'service', label: 'Search Engine', x: 620, y: 600 },
      { id: 'product-db', type: 'database', label: 'Product DB', x: 1520, y: 200 },
      { id: 'order-db', type: 'database', label: 'Order DB', x: 1520, y: 400 },
      { id: 'user-db', type: 'database', label: 'User DB', x: 1520, y: 600 }
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