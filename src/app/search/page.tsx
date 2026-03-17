'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { api, Product } from '@/lib/api';
import { partnershipAPI } from '@/services/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.getProducts({ search: query.trim() });
        setProducts(data);

        // ✅ Трекинг только если нашли ровно 1 товар (партнёрский артикул)
        if (data.length === 1) {
          const trackedKey = `sku_searched_${query.trim()}`;

          if (!sessionStorage.getItem(trackedKey)) {
            try {
              const result = await partnershipAPI.trackSkuSearch(query.trim());
              if (result?.data?.ref_token) {
                sessionStorage.setItem('ref_token', result.data.ref_token);
                sessionStorage.setItem(trackedKey, '1');
              }
            } catch (e) {
              console.error('Ошибка trackSkuSearch:', e);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <div className="text-2xl text-gray-600">Поиск...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Результаты поиска</h1>
      <p className="text-gray-600 mb-8">
        По запросу "<span className="font-semibold">{query}</span>" найдено: {products.length} товаров
      </p>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Ничего не найдено</h3>
          <p className="text-gray-500">Попробуйте изменить запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div>Загрузка...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
