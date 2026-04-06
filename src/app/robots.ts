import { MetadataRoute } from 'next';
const DOMAIN_URL = process.env.NEXT_PUBLIC_API_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/profile/'],
    },
    sitemap: `${DOMAIN_URL}/sitemap.xml`,
  };
}