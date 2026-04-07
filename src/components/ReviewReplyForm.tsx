'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ReviewReplyFormProps {
  reviewId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default function ReviewReplyForm({ reviewId, onSuccess, onCancel }: ReviewReplyFormProps) {
  const { tokens, user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingModeration, setPendingModeration] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Введите текст ответа');
      return;
    }
    if (!tokens?.access) {
      setError('Вы не авторизованы');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const result = await api.addReviewReply(tokens.access, reviewId, text.trim());
      setText('');
      if (result.is_approved) {
        onSuccess();
      } else {
        setPendingModeration(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки ответа');
    } finally {
      setLoading(false);
    }
  };

  if (pendingModeration) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-800 mb-1 text-sm md:text-base">Ответ отправлен на модерацию</p>
            <p className="text-xs md:text-sm text-amber-700">
              Ваш ответ появится после проверки модератором. Обычно это занимает до 24 часов.
            </p>
            <button
              onClick={onCancel}
              className="mt-2 text-xs md:text-sm text-amber-600 hover:text-amber-800 underline transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваш ответ
        </label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Напишите ответ на отзыв..."
          rows={3}
          className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
          disabled={loading}
        />
        {!(user as any)?.is_staff && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span>🛡️</span> Ответ появится после проверки модератором
          </p>
        )}
        {error && (
          <p className="text-red-600 text-xs md:text-sm mt-2 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          <SendIcon />
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}