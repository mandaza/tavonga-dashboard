/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'jellyfish-app-ho48c.ondigitalocean.app'],
  },
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://jellyfish-app-ho48c.ondigitalocean.app/api/v1/:path*',
      },
      {
        source: '/api/v1/:path*/',
        destination: 'https://jellyfish-app-ho48c.ondigitalocean.app/api/v1/:path*',
      },
    ]
  },
}

module.exports = nextConfig 