'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnershipAPI } from '@/services/api';
import { Youtube, Instagram, Send, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SocialMediaPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'youtube',
    username: '',
    url: '',
    followers_count: 0,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await partnershipAPI.getSocialAccounts();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await partnershipAPI.addSocialAccount(formData);
      toast.success('Соцсеть добавлена!');
      setShowForm(false);
      setFormData({ platform: 'youtube', username: '', url: '', followers_count: 0 });
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка добавления');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту соцсеть?')) return;
    try {
      await partnershipAPI.deleteSocialAccount(id);
      toast.success('Соцсеть удалена');
      fetchAccounts();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-5 h-5 md:w-6 md:h-6" />;
      case 'instagram': return <Instagram className="w-5 h-5 md:w-6 md:h-6" />;
      case 'telegram': return <Send className="w-5 h-5 md:w-6 md:h-6" />;
      default: return <div className="w-5 h-5 md:w-6 md:h-6">📱</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <Link href="/profile/partnership" className="text-primary hover:underline mb-4 inline-block text-sm md:text-base">
          ← Назад
        </Link>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Мои социальные сети</h1>
          <p className="text-sm md:text-base text-gray-600">Добавьте ваши социальные сети для верификации</p>
        </div>

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold mb-6 md:mb-8 flex items-center gap-2 text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Добавить соцсеть
        </motion.button>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl mb-6 md:mb-8"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Добавить соцсеть</h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 md:mb-2">Платформа</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-600 text-sm md:text-base"
                  required
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 md:mb-2">Ник</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-600 text-sm md:text-base"
                  placeholder="@your_username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 md:mb-2">Ссылка</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-600 text-sm md:text-base"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 md:mb-2">Количество подписчиков</label>
                <input
                  type="number"
                  value={formData.followers_count}
                  onChange={(e) => setFormData({ ...formData, followers_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-600 text-sm md:text-base"
                  min="0"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base"
                >
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Accounts List */}
        <div className="space-y-3 md:space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <p className="text-gray-600 text-base md:text-lg">У вас пока нет добавленных соцсетей</p>
            </div>
          ) : (
            accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg md:rounded-xl flex items-center justify-center text-purple-600">
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base md:text-lg">{account.platform_display}</h3>
                      <p className="text-sm md:text-base text-gray-600">{account.username}</p>
                      <a 
                        href={account.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 text-xs md:text-sm hover:underline break-all"
                      >
                        {account.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-left md:text-right">
                      <p className="text-xl md:text-2xl font-bold">{account.followers_count.toLocaleString()}</p>
                      <p className="text-gray-600 text-xs md:text-sm">подписчиков</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {account.verified ? (
                        <div className="flex items-center gap-1 md:gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="text-xs md:text-sm font-bold">Верифицирован</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 md:gap-2 text-yellow-600">
                          <Clock className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="text-xs md:text-sm font-bold">На проверке</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:bg-red-50 p-1.5 md:p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}