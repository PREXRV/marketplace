'use client';

import { useState, useEffect } from 'react';
import { api, CreateReviewData } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user, tokens } = useAuth();
  
  const [formData, setFormData] = useState<CreateReviewData>({
    product: productId,
    author_name: '',
    author_email: '',
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    order_number: '',
    media_files: [],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        author_name: fullName || user.username,
        author_email: user.email
      }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isImage && !isVideo) {
        alert(`${file.name} - неподдерживаемый формат.`);
        return false;
      }

      if (!isValidSize) {
        alert(`${file.name} - файл слишком большой.`);
        return false;
      }

      return true;
    });

    const currentFiles = formData.media_files || [];
    if (currentFiles.length + validFiles.length > 5) {
      alert('Максимум 5 файлов');
      return;
    }

    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFormData({
      ...formData,
      media_files: [...currentFiles, ...validFiles]
    });
  };

  const removeFile = (index: number) => {
    const newFiles = [...(formData.media_files || [])];
    newFiles.splice(index, 1);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);

    setFormData({ ...formData, media_files: newFiles });
    setPreviews(newPreviews);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setError('Поставьте оценку');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.createReview(formData, tokens?.access);

      setSuccess(true);
      setFormData({
        product: productId,
        author_name: user ? user.first_name + ' ' + user.last_name || user.username : '',
        author_email: user ? user.email : '',
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: '',
        order_number: '',
        media_files: [],
      });

      setPreviews([]);
      if (onSuccess) setTimeout(onSuccess, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 sm:p-8 text-center">
        <div className="text-5xl sm:text-6xl mb-4">✅</div>
        <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
          Спасибо за отзыв!
        </h3>
        <p className="text-green-700 text-sm sm:text-base">
          После модерации он появится на сайте.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-900">
        Написать отзыв
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 sm:mb-6 text-sm">
          {error}
        </div>
      )}

      {user && (
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 font-semibold">
              Данные заполнены автоматически
            </p>
            <p className="text-blue-600">
              Вы вошли как {user.username}
            </p>
          </div>
        </div>
      )}

      {/* Рейтинг */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваша оценка *
        </label>

        <div className="flex flex-wrap gap-2">
          <StarRating
            rating={formData.rating}
            size="lg"
            interactive
            onChange={(rating) => setFormData({ ...formData, rating })}
          />
        </div>

        {formData.rating > 0 && (
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {formData.rating} из 5
          </p>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-5 sm:mb-6">
        <input
          type="text"
          required
          value={formData.author_name}
          disabled={!!user}
          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 text-sm sm:text-base"
          placeholder="Имя"
        />

        <input
          type="email"
          required
          value={formData.author_email}
          disabled={!!user}
          onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 text-sm sm:text-base"
          placeholder="Email"
        />

        <input
          type="text"
          value={formData.order_number}
          onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
          className="w-full border rounded-lg px-3 py-2.5 text-sm sm:text-base"
          placeholder="Номер заказа"
        />
      </div>

      {/* Комментарий */}
      <textarea
        required
        rows={4}
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        className="w-full border rounded-lg px-3 py-2.5 mb-5 sm:mb-6 text-sm sm:text-base"
        placeholder="Ваш отзыв..."
      />

      {/* Медиа */}
      <div className="mb-5 sm:mb-6">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full text-sm"
        />

        {previews.length > 0 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={preview}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || formData.rating === 0}
        className="btn-primary w-full sm:w-auto px-6 py-3 text-base sm:text-lg"
      >
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  );
}