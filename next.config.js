/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // ✅ Фоллбэк на Railway если переменная не задана
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fulfilling-success-production-3288.up.railway.app';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;