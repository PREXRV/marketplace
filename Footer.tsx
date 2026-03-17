export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🛍️ Маркетплейс</h3>
            <p className="text-gray-400">
              Интернет-магазин с широким выбором товаров
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white">Главная</a></li>
              <li><a href="/catalog" className="hover:text-white">Каталог</a></li>
              <li><a href="/cart" className="hover:text-white">Корзина</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">Email: info@marketplace.uz</p>
            <p className="text-gray-400">Телефон: +998 90 123 45 67</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Маркетплейс. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
