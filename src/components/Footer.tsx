import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-14 sm:mt-16 md:mt-20 bg-gray-900 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <h3 className="text-xl font-bold">Aki-Oka</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400 sm:text-base">
              Интернет-магазин с широким выбором товаров личного производства.
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold sm:text-lg">Навигация</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-400 sm:text-base">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="transition hover:text-white">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-white">
                  Корзина
                </Link>
              </li>
              <li>
                <Link href="/docs" className="transition hover:text-white">
                  Документы
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold sm:text-lg">Документы</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-400 sm:text-base">
              <li><Link href="/docs/terms" className="transition hover:text-white">Пользовательское соглашение</Link></li>
              <li><Link href="/docs/payment" className="transition hover:text-white">Условия оплаты</Link></li>
              <li><Link href="/docs/delivery" className="transition hover:text-white">Условия доставки</Link></li>
              <li><Link href="/docs/returns" className="transition hover:text-white">Условия возврата</Link></li>
              <li><Link href="/docs/privacy-policy" className="transition hover:text-white">Политика конфиденциальности</Link></li>
              <li><Link href="/docs/partnership" className="transition hover:text-white">Партнёрская программа</Link></li>
              <li><Link href="/docs/gamification" className="transition hover:text-white">Геймификация</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold sm:text-lg">Контакты</h4>
            <div className="mt-4 space-y-3 text-sm text-gray-400 sm:text-base">
              <p>Telegram: @akioka_shop</p>
              <p>TikTok: @_prexrv_</p>
              <p>YouTube: @aki-oka_shop</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-400 sm:mt-10 sm:pt-8">
          <p>&copy; 2026 Aki-Oka. Все права защищены.</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/docs/privacy-policy" className="transition hover:text-white">Политика конфиденциальности</Link>
            <Link href="/docs/terms" className="transition hover:text-white">Оферта</Link>
            <Link href="/docs/cookies" className="transition hover:text-white">Cookie</Link>
            <Link href="/docs/about" className="transition hover:text-white">Реквизиты</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}