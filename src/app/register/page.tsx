'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    router.push('/profile');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const getErrorText = (key: string): string | null => {
    const val = errors[key];
    if (!val) return null;
    return Array.isArray(val) ? val[0] : val;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Клиентская валидация
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Введите логин';
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    if (formData.password.length < 8) newErrors.password = 'Пароль должен быть не менее 8 символов';
    if (!formData.password2) newErrors.password2 = 'Подтвердите пароль';
    if (formData.password && formData.password2 && formData.password !== formData.password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // ✅ Маппинг: password2 → confirm_password для бэкенда
      await register({
        username:         formData.username,
        email:            formData.email,
        password:         formData.password,
        confirm_password: formData.password2,
        first_name:       formData.first_name,
        last_name:        formData.last_name,
        phone:            formData.phone,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      try {
        const serverErrors = JSON.parse(err.message);
        // Маппинг обратно: confirm_password → password2
        if (serverErrors.confirm_password) {
          serverErrors.password2 = serverErrors.confirm_password;
          delete serverErrors.confirm_password;
        }
        setErrors(serverErrors);
      } catch {
        setErrors({ general: err.message || 'Ошибка регистрации. Попробуйте снова.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Экран успешной регистрации
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Аккаунт создан!</h2>
            <p className="text-gray-600 mb-6">Вы успешно зарегистрированы. Войдите в аккаунт.</p>
            <Link href="/login" className="btn-primary py-3 px-8 text-lg font-semibold inline-block">
              Войти
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
              <p className="text-gray-600">Создайте аккаунт для заказов</p>
            </div>

            {/* ✅ Общая ошибка */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{getErrorText('general')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Логин */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Логин <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ivan_ivanov"
                  />
                  {getErrorText('username') && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span> {getErrorText('username')}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ivan@example.com"
                  />
                  {getErrorText('email') && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span> {getErrorText('email')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder="Иван"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder="Иванов"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Пароль */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Минимум 8 символов"
                  />
                  {getErrorText('password') && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span> {getErrorText('password')}
                    </p>
                  )}
                </div>

                {/* Подтверждение пароля */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подтвердите пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.password2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Повторите пароль"
                  />
                  {getErrorText('password2') && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span> {getErrorText('password2')}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Индикатор совпадения паролей */}
              {formData.password && formData.password2 && (
                <div className={`text-sm flex items-center gap-2 ${
                  formData.password === formData.password2 ? 'text-green-600' : 'text-red-500'
                }`}>
                  <span>{formData.password === formData.password2 ? '✅' : '❌'}</span>
                  {formData.password === formData.password2 ? 'Пароли совпадают' : 'Пароли не совпадают'}
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                <input
                  type="checkbox"
                  id="agree"
                  required
                  className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  Я принимаю{' '}
                  <Link href="/docs/terms" target="_blank" className="text-primary hover:underline font-medium">
                    Пользовательское соглашение
                  </Link>{' '}
                  и{' '}
                  <Link href="/docs/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                    Политику конфиденциальности
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Регистрация...
                  </span>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-primary hover:text-blue-700 font-semibold">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
