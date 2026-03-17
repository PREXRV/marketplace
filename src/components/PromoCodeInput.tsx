'use client';

import { useState } from 'react';

interface PromoCodeInputProps {
  orderAmount: number;
  onApply: (discount: number, code: string) => void;
}

export default function PromoCodeInput({ orderAmount, onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Введите промокод');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ ИСПРАВЛЕНО: правильный URL
      const response = await fetch('http://127.0.0.1:8000/api/promo-codes/validate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          order_amount: orderAmount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const discount = parseFloat(data.discount_amount);
        setAppliedDiscount(discount);
        setSuccess(data.message || `Промокод применён! Скидка: ${discount.toFixed(2)} ₽`);
        onApply(discount, code.toUpperCase());
      } else {
        setError(data.error || 'Промокод недействителен');
      }
    } catch (err: any) {
      console.error('Ошибка применения промокода:', err);
      setError(err.message || 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setAppliedDiscount(0);
    setSuccess('');
    setError('');
    onApply(0, '');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Промокод
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleApply()}
          placeholder="Введите промокод"
          disabled={appliedDiscount > 0}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
        />
        
        {appliedDiscount > 0 ? (
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
          >
            Удалить
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Проверка...' : 'Применить'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 text-sm text-green-600 flex items-center gap-1 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
    </div>
  );
}
