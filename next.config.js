/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'jellyfish-app-ho48c.ondigitalocean.app'],
  },
  trailingSlash: false,
  // Only use rewrites in development - production uses absolute URLs
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
        {
          source: '/api/v1/:path*/',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig 