import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroBanner from '@/components/HeroBanner'
import ProductGrid from '@/components/ProductGrid'
import YouTubeVideos from '@/components/YouTubeVideos'
import SocialFeed from '@/components/SocialFeed'
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts'
import SaleProducts from '@/components/homepage/SaleProducts'

import { api, Product, Banner, SocialPost, YouTubeVideo } from '@/lib/api'
export const revalidate = 0; // или
export const dynamic = 'force-dynamic';

interface SaleInfo {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  discount_type: string
  discount_value: string
}

interface HomePageData {
  featuredProducts: Product[]
  newProducts: Product[]
  banners: Banner[]
  social_posts: SocialPost[]
  youtube_videos: YouTubeVideo[]
  products_on_sale: Product[]
  sale_info: SaleInfo | null
}

async function getHomePageData(): Promise<HomePageData> {

  const [products, homepage] = await Promise.all([
    api.getProducts(),
    api.publicHomepage()
  ])

  const featured = products.filter(p => p.is_featured).slice(0, 8)
  const newProducts = products.filter(p => p.is_new).slice(0, 8)

  return {
    featuredProducts: featured,
    newProducts: newProducts,
    banners: homepage.banners,
    social_posts: homepage.social_posts,
    youtube_videos: homepage.youtube_videos,
    products_on_sale: homepage.products_on_sale,
    sale_info: homepage.sale_info
  }
}

export default async function Home() {

  const data = await getHomePageData()

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      {data.banners.length > 0 && (
        <HeroBanner banners={data.banners} />
      )}

      {data.products_on_sale.length > 0 && (
        <SaleProducts
          products={data.products_on_sale}
          saleInfo={data.sale_info}
        />
      )}

      {data.featuredProducts.length > 0 && (
        <ProductGrid
          products={data.featuredProducts}
          title="Рекомендуемые товары"
        />
      )}

      <YouTubeVideos
        videos={data.youtube_videos}
        channelUrl="https://youtube.com/@aki-oka_shop"
      />

      {data.newProducts.length > 0 && (
        <ProductGrid
          products={data.newProducts}
          title="Новинки"
        />
      )}

      {data.social_posts.length > 0 && (
        <SocialFeed posts={data.social_posts} />
      )}

      <RecentlyViewedProducts maxItems={10} />

      <Footer />

    </div>
  )
}