/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['database', 'shared'],

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
