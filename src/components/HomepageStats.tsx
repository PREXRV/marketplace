export default function HomepageStats() {
  return (
    <section className="py-12 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container mx-auto grid grid-cols-3 gap-8 text-center">
        <div><div className="text-4xl font-bold text-green-600">1500+</div><p>Товаров</p></div>
        <div><div className="text-4xl font-bold text-blue-600">500+</div><p>Заказов/мес</p></div>
        <div><div className="text-4xl font-bold text-purple-600">4.9⭐</div><p>Отзывы</p></div>
      </div>
    </section>
  );
}
