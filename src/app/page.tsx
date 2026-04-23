import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';
import ClientDynamicContent from '@/components/ClientDynamicContent';
import { unstable_cache } from 'next/cache';
import { api, Product, Banner, SocialPost, YouTubeVideo } from '@/lib/api';

interface SaleInfo {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_type: string;
  discount_value: string;
}

interface HomePageData {
  featuredProducts: Product[];
  newProducts: Product[];
  banners: Banner[];
  social_posts: SocialPost[];
  youtube_videos: YouTubeVideo[];
  products_on_sale: Product[];
  sale_info: SaleInfo | null;
}

// ✅ Кэшируем данные между запросами (ускоряет TTFB)
const getCachedHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const [products, homepage] = await Promise.all([
      api.getProducts(),
      api.publicHomepage(),
    ]);

    const featured = products.filter((p) => p.is_featured).slice(0, 8);
    const newProducts = products.filter((p) => p.is_new).slice(0, 8);

    return {
      featuredProducts: featured,
      newProducts,
      banners: homepage.banners ?? [],
      social_posts: homepage.social_posts ?? [],
      youtube_videos: homepage.youtube_videos ?? [],
      products_on_sale: homepage.products_on_sale ?? [],
      sale_info: homepage.sale_info ?? null,
    };
  },
  ['homepage-data'],
  { revalidate: 3600, tags: ['homepage'] }
);

export default async function Home() {
  const data = await getCachedHomePageData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="overflow-x-hidden">
        {data.banners.length > 0 && <HeroBanner banners={data.banners} />}

        {data.featuredProducts.length > 0 && (
          <ProductGrid
            products={data.featuredProducts}
            title="Рекомендуемые товары"
          />
        )}

        {data.newProducts.length > 0 && (
          <ProductGrid
            products={data.newProducts}
            title="Новинки"
          />
        )}

        {/* Весь контент ниже первого экрана загружается лениво */}
        <ClientDynamicContent
          youtubeVideos={data.youtube_videos}
          channelUrl="https://youtube.com/@aki-oka_shop"
          socialPosts={data.social_posts}
          productsOnSale={data.products_on_sale}
          saleInfo={data.sale_info}
        />
      </main>
    </div>
  );
}