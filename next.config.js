/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Serve static HTML pages from public/ at clean URLs
        { source: '/', destination: '/home.html' },
        { source: '/terms-of-service', destination: '/terms-of-service.html' },
        { source: '/privacy-policy', destination: '/privacy-policy.html' },
        { source: '/sponsorship', destination: '/index.html' },
      ],
    }
  },
}

module.exports = nextConfig
