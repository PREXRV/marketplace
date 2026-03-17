'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, MousePointerClick, 
  Award, Download, Copy, Check, ExternalLink 
} from 'lucide-react';
import { affiliateAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]); // ← Инициализируем пустым массивом
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchMaterials();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await affiliateAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await affiliateAPI.getMaterials();
      setMaterials(response.data || []); // ← Fallback на пустой массив
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]); // ← При ошибке пустой массив
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/${stats?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Ссылка скопирована!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (materialId: number) => {
    try {
      const response = await affiliateAPI.downloadMaterial(materialId);
      window.open(response.data.download_url, '_blank');
      toast.success('Материал загружен!');
    } catch (error) {
      toast.error('Ошибка загрузки материала');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Вы еще не зарегистрированы в партнерской программе</p>
          <button 
            onClick={() => window.location.href = '/affiliate'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Всего кликов',
      value: stats.total_clicks || 0,
      icon: MousePointerClick,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Продажи',
      value: stats.total_sales || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Заработано',
      value: `${stats.total_earnings || 0} ₽`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Конверсия',
      value: `${stats.conversion_rate?.toFixed(2) || 0}%`,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Дашборд партнера
          </h1>
          <p className="text-xl text-gray-600">
            Отслеживайте свою статистику и управляйте реферальными ссылками
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className={`bg-gradient-to-r ${card.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Referral Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Ваша реферальная ссылка
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-100 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              {window.location.origin}/ref/{stats.referral_code}
            </div>
            <button
              onClick={copyReferralLink}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
        </motion.div>

        {/* Tier Progress */}
        {stats.tier_progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Прогресс до следующего уровня</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">
                  {stats.tier_progress.current_tier}
                </span>
                <span className="font-semibold text-gray-700">
                  {stats.tier_progress.next_tier || 'Максимальный уровень'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all"
                  style={{
                    width: `${stats.tier_progress.next_tier 
                      ? (stats.tier_progress.current_sales / stats.tier_progress.next_tier_sales) * 100 
                      : 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.tier_progress.current_sales} из {stats.tier_progress.next_tier_sales} продаж
                {stats.tier_progress.sales_needed > 0 && 
                  ` (еще ${stats.tier_progress.sales_needed} до повышения)`
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Promo Materials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Промоматериалы</h2>
          
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Промоматериалы пока недоступны</p>
              <p className="text-sm text-gray-500">Обратитесь к менеджеру для получения материалов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {materials.map((material: any) => (
                <motion.div
                  key={material.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-50 rounded-xl p-4 cursor-pointer group"
                  onClick={() => handleDownload(material.id)}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg mb-4 flex items-center justify-center">
                    <Download className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{material.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{material.material_type}</p>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold group-hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Скачать
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
