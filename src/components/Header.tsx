'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const itemsCount = getTotalItems();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowMobileSearch(false);
    setShowMobileMenu(false);
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || name.charAt(0).toUpperCase()
    );
  };

  const avatarUrl = user?.avatar_url || (user?.avatar ? getImageUrl(user.avatar) : null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  const closeMobilePanels = () => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  };

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог' },
    { href: '/wishlist', label: 'Избранное' },
  ];

  const iconButtonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-primary hover:text-primary hover:bg-gray-50 shrink-0';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div ref={mobileMenuRef}>
          <div className="flex h-16 items-center justify-between gap-2 md:h-20 md:gap-3">
            <div className="flex min-w-0 items-center gap-2 md:gap-4">
              <button
                type="button"
                className={`${iconButtonClass} md:hidden`}
                onClick={() => {
                  setShowMobileMenu((prev) => !prev);
                  setShowMobileSearch(false);
                }}
                aria-label="Открыть меню"
              >
                {showMobileMenu ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              <Link
                href="/"
                className="truncate whitespace-nowrap text-lg font-bold tracking-tight text-primary sm:text-xl md:text-2xl"
                onClick={closeMobilePanels}
              >
                Aki-Oka
              </Link>
            </div>

            <form onSubmit={handleSearch} className="hidden flex-1 px-2 md:block">
              <div className="relative mx-auto max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary"
                  aria-label="Искать"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <nav className="hidden items-center gap-5 lg:flex">
              <Link href="/" className="text-sm font-medium text-gray-700 transition hover:text-primary">
                Главная
              </Link>
              <Link href="/catalog" className="text-sm font-semibold text-primary transition hover:text-primary/80">
                Каталог
              </Link>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
              <button
                type="button"
                className={`${iconButtonClass} md:hidden`}
                onClick={() => {
                  setShowMobileSearch((prev) => !prev);
                  setShowMobileMenu(false);
                }}
                aria-label="Открыть поиск"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link href="/wishlist" className={`${iconButtonClass} hidden md:inline-flex`} aria-label="Избранное">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {isAuthenticated && (
                <div className={iconButtonClass}>
                  <NotificationBell />
                </div>
              )}

              <Link href="/cart" className={`${iconButtonClass} relative`} aria-label="Корзина">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemsCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {itemsCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 transition hover:border-primary hover:bg-gray-50"
                    aria-label="Меню пользователя"
                    aria-expanded={showUserMenu}
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-blue-600 text-xs font-bold text-white shadow-sm">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={user?.username || 'User'}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(user?.first_name || user?.username || 'U')}</span>
                      )}
                    </div>

                    <span className="hidden max-w-[110px] truncate text-sm font-medium text-gray-900 lg:block">
                      {user?.first_name || user?.username}
                    </span>

                    <svg className="hidden h-4 w-4 text-gray-500 lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-blue-600 text-lg font-bold text-white shadow-md">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={user?.username || 'User'}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{getInitials(user?.first_name || user?.username || 'U')}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">
                            {user?.first_name || user?.username}
                          </p>
                          <p className="truncate text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 transition hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Мой профиль
                        </Link>

                        <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 transition hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Мои заказы
                        </Link>

                        <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-700 transition hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Избранное
                        </Link>

                        <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 transition hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Настройки
                        </Link>

                        <div className="my-2 border-t border-gray-100" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Выйти
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-white transition hover:bg-blue-600 md:px-4"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Войти</span>
                </Link>
              )}
            </div>
          </div>

          {showMobileSearch && (
            <div className="border-t border-gray-100 py-3 md:hidden">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary"
                    aria-label="Искать"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {showMobileMenu && (
            <div className="border-t border-gray-100 py-3 md:hidden">
              <nav className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-50 hover:text-primary"
                    onClick={closeMobilePanels}
                  >
                    {item.label}
                  </Link>
                ))}

                {!isAuthenticated ? (
                  <Link
                    href="/login"
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMobilePanels();
                    }}
                  >
                    Войти в аккаунт
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-50 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMobilePanels();
                      }}
                    >
                      Профиль
                    </Link>

                    <Link
                      href="/profile/orders"
                      className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-50 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMobilePanels();
                      }}
                    >
                      Мои заказы
                    </Link>

                    <Link
                      href="/profile/settings"
                      className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-50 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMobilePanels();
                      }}
                    >
                      Настройки
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMobilePanels();
                        logout();
                      }}
                      className="rounded-xl px-3 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Выйти
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}