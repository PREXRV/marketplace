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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-xl sm:text-2xl">⏳</span>
          <div className="text-sm sm:text-base">
            <p className="font-semibold text-amber-800 mb-1">
              Ответ отправлен
            </p>
            <p className="text-amber-700 text-xs sm:text-sm">
              После модерации он появится на сайте
            </p>

            <button
              onClick={onCancel}
              className="mt-3 text-xs sm:text-sm text-amber-600 underline"
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
          placeholder="Напишите ответ..."
          rows={3}
          disabled={loading}
          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />

        {/* Модерация */}
        {!(user as any)?.is_staff && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            🛡️ Проверяется модератором
          </p>
        )}

        {/* Ошибка */}
        {error && (
          <p className="text-red-600 text-xs sm:text-sm mt-2 flex items-center gap-1">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* КНОПКИ */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm sm:text-base bg-primary text-white rounded-lg disabled:opacity-50"
        >
          <SendIcon />
          {loading ? 'Отправка...' : 'Отправить'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}