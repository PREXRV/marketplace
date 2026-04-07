'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PartnershipSidebar from '@/components/partnership/PartnershipSidebar';
import { Menu, X } from 'lucide-react';

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике на ссылку внутри сайдбара
  useEffect(() => {
    const handleClickInside = (e: MouseEvent) => {
      if (sidebarRef.current?.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickInside);
      return () => document.removeEventListener('click', handleClickInside);
    }
  }, [mobileMenuOpen]);

  // Закрываем при смене роута
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex gap-6 md:gap-8 items-start">
          {/* Кнопка для мобильных */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Sidebar для десктопа */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <PartnershipSidebar />
          </aside>

          {/* Мобильный сайдбар (выезжающая панель) */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div
                ref={sidebarRef}
                className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto shadow-2xl lg:hidden"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-purple-800">Меню партнёра</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
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