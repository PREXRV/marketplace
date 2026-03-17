import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* О магазине */}
          <div>
            <h3 className="text-xl font-bold mb-4">Aki-Oka</h3>
            <p className="text-gray-400">
              Интернет-магазин с широким выбором товаров личного производства.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white">Главная</a></li>
              <li><a href="/catalog" className="hover:text-white">Каталог</a></li>
              <li><a href="/cart" className="hover:text-white">Корзина</a></li>
              <li><a href="/docs" className="hover:text-white transition">Документы</a></li>
            </ul>
          </div>

          {/* Документы */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Документы</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/docs/terms" className="hover:text-white transition">Пользовательское соглашение</Link></li>
              <li><Link href="/docs/payment" className="hover:text-white transition">Условия оплаты</Link></li>
              <li><Link href="/docs/delivery" className="hover:text-white transition">Условия доставки</Link></li>
              <li><Link href="/docs/returns" className="hover:text-white transition">Условия возврата</Link></li>
              <li><Link href="/docs/privacy-policy" className="hover:text-white transition">Политика конфиденциальности</Link></li>
              <li><Link href="/docs/partnership" className="hover:text-white transition">Партнёрская программа</Link></li>
              <li><Link href="/docs/gamification" className="hover:text-white transition">Геймификация</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">Telegram: @akioka_shop</p>
            <p className="text-gray-400">Tik-Tok: @_prexrv_</p>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Aki-Oka. Все права защищены.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm">
            <Link href="/docs/privacy-policy" className="hover:text-white transition">Политика конфиденциальности</Link>
            <Link href="/docs/terms" className="hover:text-white transition">Оферта</Link>
            <Link href="/docs/cookies" className="hover:text-white transition">Cookie</Link>
            <Link href="/docs/about" className="hover:text-white transition">Реквизиты</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
