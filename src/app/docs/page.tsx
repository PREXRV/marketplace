// src/app/docs/page.tsx
import Link from 'next/link';

const docs = [
  {
    href: '/docs/privacy-policy',
    label: 'Политика конфиденциальности',
    icon: '🔐',
    desc: 'Как мы собираем, храним и используем ваши персональные данные',
    color: 'blue',
  },
  {
    href: '/docs/terms',
    label: 'Пользовательское соглашение',
    icon: '📄',
    desc: 'Условия использования сайта и совершения покупок',
    color: 'purple',
  },
  {
    href: '/docs/personal-data',
    label: 'Согласие на обработку данных',
    icon: '✅',
    desc: 'Форма согласия на обработку персональных данных по 152-ФЗ',
    color: 'green',
  },
  {
    href: '/docs/delivery',
    label: 'Условия доставки',
    icon: '🚚',
    desc: 'Способы, сроки и стоимость доставки по России',
    color: 'orange',
  },
  {
    href: '/docs/returns',
    label: 'Условия возврата и обмена',
    icon: '↩️',
    desc: 'Порядок возврата и обмена товаров в течение 14 дней',
    color: 'red',
  },
  {
    href: '/docs/payment',
    label: 'Условия оплаты',
    icon: '💳',
    desc: 'Доступные способы оплаты и безопасность платежей',
    color: 'cyan',
  },
  {
    href: '/docs/about',
    label: 'О компании и реквизиты',
    icon: '🏢',
    desc: 'Юридические реквизиты, ИНН, ОГРН и контактная информация',
    color: 'gray',
  },
  {
    href: '/docs/cookies',
    label: 'Политика Cookie',
    icon: '🍪',
    desc: 'Использование файлов cookie на сайте',
    color: 'yellow',
  },
  {
    href: '/docs/gamification',
    label: 'Система геймификации',
    icon: '🎮',
    desc: 'Баллы, квесты, магазин наград и правила системы лояльности',
    color: 'purple',
  },
  {
    href: '/docs/partnership',
    label: 'Партнёрская программа',
    icon: '🤝',
    desc: 'Условия сотрудничества с блогерами, реферальная программа и вывод средств',
    color: 'green',
  },
  {
    href: '/docs/gift-conditions',
    label: 'Дарственная на товар с условиями',
    icon: '🎁',
    desc: 'Условия передачи товара в собственность партнёра после выполнения требований',
    color: 'orange',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  green: 'bg-green-50 border-green-200 hover:border-green-400',
  orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  red: 'bg-red-50 border-red-200 hover:border-red-400',
  cyan: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
  gray: 'bg-gray-50 border-gray-200 hover:border-gray-400',
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
};

export default function DocsIndexPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Документы</h1>
        <p className="text-gray-600 text-lg">
          Юридические документы, регулирующие использование нашего магазина
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map(doc => (
          <Link
            key={doc.href}
            href={doc.href}
            className={`block p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${colorMap[doc.color]}`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{doc.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{doc.label}</h3>
                <p className="text-sm text-gray-600">{doc.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
