/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/farcaster.json',
        destination: '/.well-known/farcaster.json',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/farcaster.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/api/webhook',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  }
}

module.exports = nextConfig
