import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

// Исправлено: убран лишний 'products' из корня, чтобы не дублировать
const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api/products/';
const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || 'https://akioka.ru';

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_ROOT}products/${id}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ✅ Правильный тип для асинхронного params
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
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
  const url = `${DOMAIN_URL}/product/${id}`;

  return {
    title,
    description,
    keywords: product.meta_keywords || '',
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: product.name, width: 800, height: 800 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // ✅ Только допустимые Google значения availability
  const availabilityMap: Record<string, string> = {
    in_stock:      'https://schema.org/InStock',
    out_of_stock:  'https://schema.org/OutOfStock',
    made_to_order: 'https://schema.org/PreOrder',
    can_order:     'https://schema.org/PreOrder',
  };

  const schemaPrice = parseFloat(product.final_price || product.price).toFixed(2);

  const priceValidUntil = product.sale_end_date
    ? new Date(product.sale_end_date).toISOString().split('T')[0]
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const schemaImages = [
    ...(product.primary_image ? [product.primary_image] : []),
    ...(product.images?.map((img: any) => img.image_url || img.image).filter(Boolean) || []),
  ];
  const uniqueImages = schemaImages.filter(
    (img: string, idx: number) => schemaImages.indexOf(img) === idx
  );

  const productUrl = `${DOMAIN_URL}/product/${id}`;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || '',
    sku: product.sku,
    image: uniqueImages.length > 0 ? uniqueImages : undefined,
    ...(product.reviews_count > 0 && product.average_rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.average_rating),
            reviewCount: String(product.reviews_count),
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: schemaPrice,
      priceCurrency: 'RUB',
      priceValidUntil,
      availability:
        availabilityMap[product.availability_status] || 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'RU',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'RUB',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'RU',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
  };

  if (product.category_name) {
    jsonLd.brand = {
      '@type': 'Brand',
      name: 'Aki-Oka',
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient productId={id} initialProduct={product} />
    </>
  );
}