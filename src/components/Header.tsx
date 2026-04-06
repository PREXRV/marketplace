'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const itemsCount = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase();
  };

  const avatarUrl = user?.avatar_url || (user?.avatar ? getImageUrl(user.avatar) : null);

  // Закрываем меню при клике вне
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowMobileMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Десктоп версия */}
      <div className="hidden md:block container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-primary whitespace-nowrap">
            Aki-Oka
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400 hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium transition">
              Главная
            </Link>
            <Link href="/catalog" className="text-primary font-semibold border-b-2 border-primary pb-1 transition">
              Каталог
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/wishlist" className="p-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={user?.username || 'User'}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user?.first_name || user?.username || 'U')}</span>
                    )}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-900">
                    {user?.first_name || user?.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black/5">
                    <div className="p-4 border-b flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={user?.username || 'User'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(user?.first_name || user?.username || 'U')}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {user?.first_name || user?.username}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Мой профиль</span>
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Мои заказы</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318