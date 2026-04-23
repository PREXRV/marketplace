import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ClientDynamicContent from '@/components/ClientDynamicContent';
import SaleProducts from '@/components/homepage/SaleProducts';
import { unstable_cache } from 'next/cache';
import { api, Product, Banner, SocialPost, YouTubeVideo } from '@/lib/api';

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

const getCachedHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const [products, homepage] = await Promise.all([
      api.getProducts(),
      api.publicHomepage(),
    ]);

    let featured = products.filter((p) => p.is_featured).slice(0, 8);
    let newProducts = products.filter((p) => p.is_new).slice(0, 8);
    let productsOnSale = homepage.products_on_sale ?? [];

    featured = shuffleArray(featured);
    newProducts = shuffleArray(newProducts);
    productsOnSale = shuffleArray(productsOnSale);

    return {
      featuredProducts: featured,
      newProducts,
      banners: homepage.banners ?? [],
      social_posts: homepage.social_posts ?? [],
      youtube_videos: homepage.youtube_videos ?? [],
      products_on_sale: productsOnSale,
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

        {data.products_on_sale.length > 0 && (
          <SaleProducts products={data.products_on_sale} saleInfo={data.sale_info} />
        )}

        <ClientDynamicContent
          featuredProducts={data.featuredProducts}
          newProducts={data.newProducts}
          youtubeVideos={data.youtube_videos}
          channelUrl="https://youtube.com/@aki-oka_shop"
          socialPosts={data.social_posts}
        />
      </main>
    </div>
  );
}