'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { affiliateAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RegistrationFormProps {
  onClose: () => void;
  onSuccess?: () => void; 
}

export default function RegistrationForm({ onClose, onSuccess }: RegistrationFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    social_platform: '',
    social_username: '',
    followers_count: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'followers_count' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await affiliateAPI.register(formData);
      
      toast.success('🎉 Регистрация успешна! Добро пожаловать в партнерскую программу!');
      
      // Если есть токен - авторизуем пользователя
      if (response.data.token) {
        const userData = {
          id: response.data.affiliate?.user?.id || 0,
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
        };
        
        await login(response.data.token, userData);
      }
      
      // Закрываем форму
      onClose();
      if (onSuccess) onSuccess();
      
      // Обновляем страницу
      router.refresh();
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Обработка различных типов ошибок
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Проверяем конкретные поля с ошибками
        if (errors.username) {
          toast.error('❌ Это имя пользователя уже занято');
        } else if (errors.email) {
          toast.error('❌ Этот email уже используется');
        } else if (errors.phone) {
          toast.error('❌ Неверный формат телефона');
        } else if (errors.password) {
          toast.error('❌ Пароль слишком слабый (минимум 8 символов)');
        } else if (errors.message) {
          toast.error(`❌ ${errors.message}`);
        } else {
          toast.error('❌ Ошибка регистрации. Проверьте данные');
        }
      } else if (error.message === 'Network Error') {
        toast.error('❌ Ошибка сети. Проверьте подключение к интернету');
      } else {
        toast.error('❌ Ошибка регистрации. Попробуйте позже');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">Регистрация партнера</h2>
              <p className="opacity-90">Заполните форму и начните зарабатывать</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Личная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                  placeholder="Иван"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                  placeholder="Иванов"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="ivanov_ivan"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="ivan@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="Минимум 8 символов"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="+7 (900) 123-45-67"
              />
            </div>
          </div>

          {/* Social Media Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Социальные сети</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Платформа <span className="text-red-500">*</span>
              </label>
              <select
                name="social_platform"
                value={formData.social_platform}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
              >
                <option value="">Выберите платформу</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="VK">VK</option>
                <option value="Telegram">Telegram</option>
                <option value="Other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Имя в соцсети <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="social_username"
                value={formData.social_username}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Количество подписчиков
              </label>
              <input
                type="number"
                name="followers_count"
                value={formData.followers_count}
                onChange={handleChange}
                min="0"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100"
                placeholder="1000"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
