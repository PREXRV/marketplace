// src/app/docs/_components/DocPage.tsx
import Link from 'next/link';

interface Section {
  title: string;
  content: string | string[];
}

interface DocPageProps {
  icon: string;
  title: string;
  subtitle?: string;
  updatedAt?: string;
  sections: Section[];
}

export default function DocPage({ icon, title, subtitle, updatedAt, sections }: DocPageProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-blue-100 mt-1">{subtitle}</p>}
          </div>
        </div>
        {updatedAt && (
          <p className="text-blue-200 text-sm mt-4">
            Последнее обновление: {updatedAt}
          </p>
        )}
      </div>

      {/* Контент */}
      <div className="p-8 space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="border-l-4 border-primary pl-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {i + 1}. {section.title}
            </h2>
            {Array.isArray(section.content) ? (
              <ul className="space-y-2">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-700">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            )}
          </div>
        ))}

        {/* Навигация */}
        <div className="pt-6 border-t-2 border-gray-100">
          <Link href="/docs" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            ← Все документы
          </Link>
        </div>
      </div>
    </div>
  );
}
