// Example Fastify stubs for presigned URL endpoints
// POST /api/presign/upload -> { url, fields?, expiresAt }
// GET /api/presign/download -> { url, expiresAt }

// fastify.post('/api/presign/upload', async (req, reply) => {
//   return {
//     url: 'https://s3.example.com/upload',
//     fields: { key: 'uploads/uuid', policy: 'base64', signature: 'sig' },
//     expiresAt: Date.now() + 60_000
//   }
// })

// fastify.get('/api/presign/download', async (req, reply) => {
//   return {
//     url: 'https://cdn.example.com/uuid',
//     expiresAt: Date.now() + 60_000
//   }
// })
