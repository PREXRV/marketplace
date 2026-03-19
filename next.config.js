/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'shared.cloudflare.steamstatic.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 🔥 NGROK PROXY — CORS killer!
  async rewrites() {
    return [
      {
        source: '/api/:path*',   // все запросы, начинающиеся с /api/
        destination: 'https://pearle-physiognomonical-dorsally.ngrok-free.dev/api/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;