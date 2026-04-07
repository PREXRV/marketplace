import { MetadataRoute } from 'next';

const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api';
const DOMAIN_URL = 'https://www.akioka.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(
    `${API_ROOT}/products/?status=published&page_size=10000`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON, got ${contentType}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const products = Array.isArray(data) ? data : (data.results || []);

  return products.map((p: any) => ({
    url: `${DOMAIN_URL}/product/${p.id}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}