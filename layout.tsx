import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

export const metadata: Metadata = {
  title: 'Aki-Oka: Главная страница',
  description: 'Интернет-магазин Aki-Oka, с различными товарами ручной работы от фигурок до аксессуаров',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
