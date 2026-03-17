'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { partnershipAPI } from '@/services/api';
import {
  LayoutDashboard, Package, Video, Share2, BarChart2,
  RotateCcw, ChevronRight, Star, MessageCircle,
} from 'lucide-react';

export default function PartnershipSidebar() {
  const pathname = usePathname();
  const [partner, setPartner]       = useState<any>(null);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    partnershipAPI.getPartnerProfile()
      .then(res => setPartner(res.data))
      .catch(() => setPartner(null));

    loadUnread();
    // ✅ Polling каждые 15 сек
    const interval = setInterval(loadUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadUnread = async () => {
    try {
      const res = await partnershipAPI.getChatHistory();
      const messages: any[] = res?.data?.messages || res?.data || [];
      const count = messages.filter((m: any) => m.sender === 'admin' && !m.is_read).length;
      setUnreadChat(count);
    } catch {
      setUnreadChat(0);
    }
  };

  const NAV_ITEMS = [
    { href: '/profile/partnership',                  label: 'Дашборд',           icon: LayoutDashboard, exact: true },
    { href: '/profile/partnership/request-product',  label: 'Запросить товар',   icon: Package },
    { href: '/profile/partnership/videos',           label: 'Мои видео',         icon: Video },
    { href: '/profile/partnership/social-media',     label: 'Соцсети',           icon: Share2 },
    { href: '/profile/partnership/analytics',        label: 'Аналитика',         icon: BarChart2 },
    { href: '/profile/partnership/chat',             label: 'Чат с поддержкой',  icon: MessageCircle, badge: unreadChat },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Шапка партнёра */}
      {partner && (
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
              {partner.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg truncate">{partner.username}</p>
              <p className="text-purple-200 text-sm truncate">{partner.status_display}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-purple-200 text-xs">Партнёрский код</span>
            <code className="font-mono font-bold text-sm tracking-wider">{partner.partner_code}</code>
          </div>
        </div>
      )}

      {/* Навигация */}
      <nav className="p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon   = item.icon;
            const badge  = (item as any).badge || 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-sm border border-purple-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 transition-colors ${
                      active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {/* ✅ Красная точка если есть непрочитанные */}
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {/* ✅ Текстовый бейдж рядом с названием */}
                  {active && <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Лимит товаров */}
      {partner && (
        <div className="mx-3 mb-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Лимит товаров</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-purple-700">
              {partner.available ?? partner.free_products_limit}
            </p>
            <p className="text-xs text-purple-500 mb-1">доступно</p>
          </div>
          <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  ((partner.used_this_month ?? 0) / Math.max(partner.free_products_limit, 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-purple-500 mt-1">
            {partner.used_this_month ?? 0} из {partner.free_products_limit} использовано в этом месяце
          </p>
        </div>
      )}

      <div className="px-3 pb-3">
        <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition">
          ← Вернуться в профиль
        </Link>
      </div>
    </div>
  );
}
