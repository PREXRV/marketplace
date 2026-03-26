/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ unoptimized: true — оставляем, иначе Next.js будет пытаться
    // оптимизировать внешние изображения через свой сервер
    unoptimized: true,

    remotePatterns: [
      // ✅ Локальная разработка (Django dev server)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      // ✅ НОВЫЙ: Yandex Object Storage — продакшн медиафайлы
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/akioka/**',
      },
      // ✅ Railway backend (если картинки проксируются через него)
      {
        protocol: 'https',
        hostname: 'fulfilling-success-production-3288.up.railway.app',
        pathname: '/media/**',
      },
      // Плейсхолдеры
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Steam
      {
        protocol: 'https',
        hostname: 'shared.cloudflare.steamstatic.com',
      },
    ],

    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ API proxy — подставляет нужный backend в зависимости от окружения
  async rewrites() {
    // В продакшне NEXT_PUBLIC_API_URL берётся из переменных окружения Vercel
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://fulfilling-success-production-3288.up.railway.app';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
