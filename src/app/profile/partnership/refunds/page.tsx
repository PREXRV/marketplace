'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnershipAPI } from '@/services/api';
import { DollarSign, Plus, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_request: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [refundsRes, requestsRes] = await Promise.all([
        partnershipAPI.getRefunds(),
        partnershipAPI.getProductRequests(),
      ]);
      setRefunds(refundsRes.data);
      setRequests(requestsRes.data.filter((r: any) => r.status === 'delivered'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await partnershipAPI.createRefund(formData);
      toast.success('Запрос на возврат отправлен!');
      setShowForm(false);
      setFormData({ product_request: '', reason: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка создания запроса');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
          <CheckCircle className="w-4 h-4" /> Одобрен
        </span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
          <Clock className="w-4 h-4" /> На рассмотрении
        </span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
          <XCircle className="w-4 h-4" /> Отклонен
        </span>;
      case 'completed':
        return <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
          <CheckCircle className="w-4 h-4" /> Завершен
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/profile/partnership" className="text-primary hover:underline mb-4 inline-block">
          ← Назад
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Возвраты товаров</h1>
          <p className="text-gray-600">Запросите возврат доставленного товара</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-2 text-blue-900">ℹ️ Как работает возврат?</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Вы можете запросить возврат товара после его получения</li>
            <li>• Укажите причину возврата в форме</li>
            <li>• Администратор рассмотрит ваш запрос в течение 3 дней</li>
            <li>• После одобрения вы получите инструкции по возврату</li>
          </ul>
        </div>

        {/* Add Button */}
        {requests.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold mb-8 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Запросить возврат
          </motion.button>
        )}

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Запрос на возврат</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Выберите товар для возврата</label>
                <select
                  value={formData.product_request}
                  onChange={(e) => setFormData({ ...formData, product_request: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-600"
                  required
                >
                  <option value="">Выберите товар</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.product_title} (Доставлен: {new Date(request.delivered_at).toLocaleDateString('ru-RU')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Причина возврата</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-600 min-h-32"
                  placeholder="Опишите причину возврата..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Отправить запрос
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold"
                >
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* No delivered products message */}
        {requests.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xl mb-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">У вас нет доставленных товаров для возврата</p>
          </div>
        )}

        {/* Refunds List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Мои запросы на возврат</h2>
          {refunds.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">У вас пока нет запросов на возврат</p>
            </div>
          ) : (
            refunds.map((refund) => (
              <motion.div
                key={refund.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{refund.product_title}</h3>
                    <p className="text-sm text-gray-600">
                      Создано: {new Date(refund.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {getStatusBadge(refund.status)}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">Причина возврата:</p>
                  <p className="text-gray-600">{refund.reason}</p>
                </div>

                {refund.admin_notes && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-2">💬 Комментарий администратора:</p>
                    <p className="text-blue-800">{refund.admin_notes}</p>
                  </div>
                )}

                {refund.resolved_at && (
                  <p className="text-xs text-gray-500 mt-4">
                    Рассмотрено: {new Date(refund.resolved_at).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
