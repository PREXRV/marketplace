import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { GamificationProvider } from '@/context/GamificationContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const DOMAIN_URL = process.env.NEXT_PUBLIC_API_URL;

export const metadata: Metadata = {
  title: {
    default: 'Aki-Oka',
    template: '%s | Aki-Oka',   // ✅ страницы товаров будут: "Название товара | Aki-Oka"
  },
  description: 'Интернет-магазин ручной работы от фигурок по играм, аниме, фильмам до аксессуаров',
  metadataBase: new URL(DOMAIN_URL),   // ✅ ОБЯЗАТЕЛЬНО — без этого og:image не работает
  openGraph: {
    siteName: 'Aki-Oka',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <GamificationProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: { background: '#363636', color: '#fff' },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                  }}
                />
              </GamificationProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}