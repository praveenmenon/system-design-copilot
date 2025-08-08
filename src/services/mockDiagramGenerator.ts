import type { DiagramData } from '../types/diagram'

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
  
  return {
    components: template.components.map(comp => ({ ...comp })),
    connections: template.connections.map(conn => ({ ...conn }))
  }
}