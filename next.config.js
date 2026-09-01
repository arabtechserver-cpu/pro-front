/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    // Priority order for backend URL resolution:
    // 1. INTERNAL_API_URL - for Docker internal networking (e.g. http://backend:5000)
    // 2. NEXT_PUBLIC_API_URL - public-facing API URL
    // 3. Fallback to production URL (always reachable)
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://arabtechproserver.tech';
    console.log(`[Next.js rewrites] Proxying /api/* → ${backendUrl}/api/*`);
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

