/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Fix 54 pre-existing TS errors, then set to false
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: Configure ESLint (.eslintrc.json), then set to false
    ignoreDuringBuilds: true,
  },

  // Compress responses
  compress: true,

  // Optimize images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Experimental performance features
  experimental: {
    optimizePackageImports: [
      'leaflet',
      'react-leaflet',
      'socket.io-client',
      'qrcode.react',
    ],
  },

  // Required for Leaflet map to work on Vercel
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false }

    // Exclude heavy client-only packages from server bundle
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet', 'socket.io-client']
    }

    return config
  },

  // HTTP headers for caching static assets
  async headers() {
    return [
      {
        source: '/hulogo.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/icon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
}
module.exports = nextConfig
