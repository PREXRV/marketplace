import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/profile/'],
    },
    sitemap: 'https://ВАШ_ДОМЕН.ru/sitemap.xml',
  };
}