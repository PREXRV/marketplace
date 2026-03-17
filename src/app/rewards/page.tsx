import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RewardsShop from '@/components/RewardsShop';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">🏪 Магазин наград</h1>
        <p className="text-gray-600 mb-8">
          Обменивайте бонусные баллы на промокоды, значки и бесплатные товары!
        </p>
        <RewardsShop />
      </div>
      <Footer />
    </div>
  );
}
