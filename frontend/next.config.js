/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow images from any domain (for profile images etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Required for Leaflet map to work on Vercel
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  },
}
module.exports = nextConfig
