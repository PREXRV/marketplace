// src/app/product/[id]/page.tsx
// ✅ СЕРВЕРНЫЙ компонент — НЕТ 'use client'
// Google и Яндекс получают title, description и JSON-LD прямо в HTML

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api/products/';
const DOMAIN_URL = process.env.NEXT_PUBLIC_API_URL;
// ✅ Получаем данные товара на сервере
async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_ROOT}products/${id}/`, {
      next: { revalidate: 60 }, // ISR: кеш 60 сек, страница обновляется каждую минуту
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ✅ generateMetadata — Google видит title и description до запуска JS
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return {
      title: 'Товар не найден',
      robots: { index: false, follow: false },
    };
  }

  const title = product.meta_title || product.name;
  const description =
    product.meta_description ||
    product.short_description ||
    (product.description ? product.description.slice(0, 160) : '') ||
    '';
  const image =
    product.primary_image ||
    product.images?.[0]?.image_url ||
    product.images?.[0]?.image ||
    '';
  const url = `https://${DOMAIN_URL}/product/${params.id}`;

  return {
    title,
    description,
    keywords: product.meta_keywords || '',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image
        ? [
            {
              url: image,
              alt: product.name,
              width: 800,
              height: 800,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ✅ Серверный рендер — встраивает JSON-LD в HTML и передаёт данные клиенту
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // Карта availability → schema.org
  const availabilityMap: Record<string, string> = {
    in_stock: 'https://schema.org/InStock',
    out_of_stock: 'https://schema.org/OutOfStock',
    made_to_order: 'https://schema.org/MadeToOrder',
    can_order: 'https://schema.org/PreOrder',
  };

  // Цена для schema — берём финальную (со скидкой)
  const schemaPrice = product.final_price || product.price;

  // Дата окончания действия цены — если есть акция, иначе +30 дней
  const priceValidUntil = product.sale_end_date
    ? new Date(product.sale_end_date).toISOString().split('T')[0]
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Все изображения для schema
  const schemaImages = [
    ...(product.primary_image ? [product.primary_image] : []),
    ...(product.images?.map((img: any) => img.image_url || img.image).filter(Boolean) || []),
  ];
  // Убираем дубли
  const uniqueImages = schemaImages.filter((img: string, idx: number) => schemaImages.indexOf(img) === idx);

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || '',
    sku: product.sku,
    image: uniqueImages.length > 0 ? uniqueImages : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://${DOMAIN_URL}/product/${params.id}`,
      price: parseFloat(schemaPrice).toFixed(2),
      priceCurrency: 'RUB',
      priceValidUntil,
      availability:
        availabilityMap[product.availability_status] || 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  // Бренд — из категории, если есть
  if (product.category_name) {
    jsonLd.brand = {
      '@type': 'Brand',
      name: product.category_name,
    };
  }

  // Рейтинг — только если есть отзывы
  if (product.reviews_count > 0 && product.average_rating > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.reviews_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      {/* ✅ JSON-LD встроен в HTML — боты Google/Яндекс видят structured data без JS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Весь интерактивный UI — клиентский компонент с данными */}
      <ProductPageClient productId={params.id} initialProduct={product} />
    </>
  );
}