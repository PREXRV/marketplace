'use client';

import dynamic from 'next/dynamic';
import { Product } from '@/lib/api';

// Динамическая загрузка всех компонентов, которые не нужны на первом экране
const ProductGrid = dynamic(() => import('@/components/ProductGrid'), { ssr: false });
const YouTubeVideos = dynamic(() => import('@/components/YouTubeVideos'), { ssr: false });
const SocialFeed = dynamic(() => import('@/components/SocialFeed'), { ssr: false });
const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

interface ClientDynamicContentProps {
  featuredProducts: Product[];
  newProducts: Product[];
  youtubeVideos: any[];
  channelUrl: string;
  socialPosts: any[];
}

export default function ClientDynamicContent({
  featuredProducts,
  newProducts,
  youtubeVideos,
  channelUrl,
  socialPosts,
}: ClientDynamicContentProps) {
  return (
    <>
      {/* Рекомендуемые товары */}
      {featuredProducts.length > 0 && (
        <ProductGrid products={featuredProducts} title="Рекомендуемые товары" />
      )}

      {/* Новинки */}
      {newProducts.length > 0 && (
        <ProductGrid products={newProducts} title="Новинки" />
      )}

      {/* YouTube видео */}
      {youtubeVideos.length > 0 && (
        <YouTubeVideos videos={youtubeVideos} channelUrl={channelUrl} />
      )}

      {/* Посты из соцсетей */}
      {socialPosts.length > 0 && <SocialFeed posts={socialPosts} />}

      {/* Недавно просмотренные */}
      <RecentlyViewedProducts maxItems={10} />

      {/* Подвал */}
      <Footer />
    </>
  );
}