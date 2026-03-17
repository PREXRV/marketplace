'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/on-sale/')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🔥 Все товары на акции
        </h1>

        {loading ? (
          <div className="text-center py-20">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4"
              >
                <div className="relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    −{product.discount_percentage}%
                  </div>
                  <img
                    src={getImageUrl(product.primary_image)}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-lg mb-3"
                  />
                </div>
                
                <h3 className="font-bold mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    {parseFloat(product.sale_price).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {parseFloat(product.price).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
