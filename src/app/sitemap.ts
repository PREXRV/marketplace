import { MetadataRoute } from 'next';

const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api/products/';
const DOMAIN_URL = process.env.NEXT_PUBLIC_API_URL;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${API_ROOT}products/?status=published&page_size=10000`);
  const data = await res.json();
  const products = data.results || data;

  return products.map((p: any) => ({
    url: `https://${DOMAIN_URL}/product/${p.id}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}