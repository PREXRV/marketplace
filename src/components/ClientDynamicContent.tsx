'use client';

import dynamic from 'next/dynamic';

// ✅ Все компоненты, которые не нужны на первом экране, загружаем лениво
const YouTubeVideos = dynamic(() => import('@/components/YouTubeVideos'), { ssr: false });
const SocialFeed = dynamic(() => import('@/components/SocialFeed'), { ssr: false });
const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), { ssr: false });
const SaleProducts = dynamic(() => import('@/components/homepage/SaleProducts'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

interface ClientDynamicContentProps {
  youtubeVideos: any[];
  channelUrl: string;
  socialPosts: any[];
  productsOnSale: any[];
  saleInfo: any;
}

export default function ClientDynamicContent({
  youtubeVideos,
  channelUrl,
  socialPosts,
  productsOnSale,
  saleInfo,
}: ClientDynamicContentProps) {
  return (
    <>
      {youtubeVideos.length > 0 && (
        <YouTubeVideos videos={youtubeVideos} channelUrl={channelUrl} />
      )}
      {socialPosts.length > 0 && <SocialFeed posts={socialPosts} />}
      {productsOnSale.length > 0 && (
        <SaleProducts products={productsOnSale} saleInfo={saleInfo} />
      )}
      <RecentlyViewedProducts maxItems={10} />
      <Footer />
    </>
  );
}