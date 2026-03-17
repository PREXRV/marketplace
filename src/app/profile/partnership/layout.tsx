'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PartnershipSidebar from '@/components/partnership/PartnershipSidebar';

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0 sticky top-24">
            <PartnershipSidebar />
          </aside>

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
