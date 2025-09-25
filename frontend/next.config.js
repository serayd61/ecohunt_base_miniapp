/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/farcaster.json',
        destination: '/api/farcaster',
      },
    ]
  },
  // Alternatif: headers ile CORS ayarı
  async headers() {
    return [
      {
        source: '/farcaster.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig
