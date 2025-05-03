/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['checkyourmeter.com'],
  },
  compress: true,
  poweredByHeader: false
}

export default nextConfig
