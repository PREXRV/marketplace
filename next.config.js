/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Включаем кэширование компонентов (новый синтаксис)
  cacheComponents: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/media/**' },
      { protocol: 'https', hostname: 'storage.yandexcloud.net', pathname: '/akioka/**' },
      { protocol: 'https', hostname: 'fulfilling-success-production-3288.up.railway.app', pathname: '/media/**' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'shared.cloudflare.steamstatic.com' },
    ],
    dangerouslyAllowSVG: true,
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fulfilling-success-production-3288.up.railway.app';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },

  experimental: {
    inlineCss: true, // инлайн критического CSS
  },
};

module.exports = nextConfig;