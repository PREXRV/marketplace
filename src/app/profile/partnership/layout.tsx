'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PartnershipSidebar from '@/components/partnership/PartnershipSidebar';
import { Menu, X } from 'lucide-react';

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="gap-4 md:gap-8 items-start">
          {/* Десктопный сайдбар (виден всегда) */}
          <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 sticky top-24">
            <PartnershipSidebar />
          </aside>

          {/* Мобильная кнопка бургер */}
          <div className="inline-flex items-center md:hidden sticky top-20 z-30 bg-white/80 backdrop-blur-sm p-2 rounded-lg">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              <Menu className="w-5 h-5" />
              Меню партнёра
            </button>
          </div>

          {/* Мобильный выезжающий сайдбар */}
          {mobileSidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto transform transition-transform md:hidden">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Партнёрский раздел</h2>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <PartnershipSidebar />
                </div>
              </div>
            </>
          )}

          {/* Контент страницы */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}