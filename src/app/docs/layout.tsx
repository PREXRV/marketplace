// src/app/docs/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const docs = [
  { href: '/docs', label: 'Все документы', icon: '📋' },
  { href: '/docs/privacy-policy', label: 'Политика конфиденциальности', icon: '🔐' },
  { href: '/docs/terms', label: 'Пользовательское соглашение', icon: '📄' },
  { href: '/docs/personal-data', label: 'Согласие на обработку данных', icon: '✅' },
  { href: '/docs/delivery', label: 'Условия доставки', icon: '🚚' },
  { href: '/docs/returns', label: 'Условия возврата', icon: '↩️' },
  { href: '/docs/payment', label: 'Условия оплаты', icon: '💳' },
  { href: '/docs/about', label: 'О компании и реквизиты', icon: '🏢' },
  { href: '/docs/cookies', label: 'Политика Cookie', icon: '🍪' },
  { href: '/docs/gamification', label: 'Система геймификации', icon: '🎮' },
  { href: '/docs/partnership', label: 'Партнёрская программа', icon: '🤝' },
  { href: '/docs/gift-conditions', label: 'Дарственная с условиями', icon: '🎁' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Боковое меню */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md p-4 sticky top-24">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-3 mb-3">
                Документы
              </h3>
              <nav className="space-y-1">
                {docs.map(doc => {
                  const isActive = pathname === doc.href;
                  return (
                    <Link
                      key={doc.href}
                      href={doc.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{doc.icon}</span>
                      {doc.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Контент */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
