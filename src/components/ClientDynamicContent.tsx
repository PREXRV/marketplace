'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Product } from '@/lib/api';

const ProductGrid = dynamic(() => import('@/components/ProductGrid'), { ssr: false });
const YouTubeVideos = dynamic(() => import('@/components/YouTubeVideos'), { ssr: false });
const SocialFeed = dynamic(() => import('@/components/SocialFeed'), { ssr: false });
const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ClientDynamicContentProps {
  featuredProducts: Product[];
  newProducts: Product[];
  youtubeVideos: any[];
  channelUrl: string;
  socialPosts: any[];
}

export default function ClientDynamicContent({
  featuredProducts: initialFeatured,
  newProducts: initialNew,
  youtubeVideos,
  channelUrl,
  socialPosts,
}: ClientDynamicContentProps) {
  const [featuredProducts, setFeaturedProducts] = useState(initialFeatured);
  const [newProducts, setNewProducts] = useState(initialNew);

  useEffect(() => {
    // Перемешиваем при монтировании компонента на клиенте
    setFeaturedProducts(shuffleArray(initialFeatured));
    setNewProducts(shuffleArray(initialNew));
  }, [initialFeatured, initialNew]);

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductGrid products={featuredProducts} title="Рекомендуемые товары" />
      )}
      {newProducts.length > 0 && (
        <ProductGrid products={newProducts} title="Новинки" />
      )}
      {youtubeVideos.length > 0 && (
        <YouTubeVideos videos={youtubeVideos} channelUrl={channelUrl} />
      )}
      {socialPosts.length > 0 && <SocialFeed posts={socialPosts} />}
      <RecentlyViewedProducts maxItems={10} />
      <Footer />
    </>
  );
}