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
        alert(`${file.name} - неподдерживаемый формат. Только фото и видео.`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} - файл слишком большой. Максимум 10MB.`);
        return false;
      }
      return true;
    });
    
    const currentFiles = formData.media_files || [];
    const totalFiles = currentFiles.length + validFiles.length;
    if (totalFiles > 5) {
      alert('Максимум 5 файлов');
      return;
    }
    
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
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
      setError(err.response?.data?.message || err.message || 'Ошибка отправки отзыва');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:p-8 text-center">
        <div className="text-5xl md:text-6xl mb-4">✅</div>
        <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-2">
          Спасибо за ваш отзыв!
        </h3>
        <p className="text-green-700 text-sm md:text-base">
          Ваш отзыв будет опубликован после модерации.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">Написать отзыв</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {user && (
        <div className="mb-6 p-3 md:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-blue-800 font-semibold text-sm md:text-base">
              ✓ Данные заполнены из вашего профиля
            </p>
            <p className="text-blue-600 text-xs md:text-sm">
              Вы вошли как {user.username}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваша оценка <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={formData.rating}
          size="lg"
          interactive
          onChange={(rating) => setFormData({ ...formData, rating })}
        />
        {formData.rating > 0 && (
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            Вы выбрали: {formData.rating} из 5 звезд
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваше имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            disabled={!!user}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              user ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
            }`}
            placeholder="Иван Иванов"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.author_email}
            onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
            disabled={!!user}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              user ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
            }`}
            placeholder="example@mail.com"
          />
          <p className="text-xs text-gray-500 mt-1">Не будет опубликован</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Номер заказа
            <span className="ml-1 text-xs text-gray-500">(опционально)</span>
          </label>
          <input
            type="text"
            value={formData.order_number}
            onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="ORD-12345"
          />
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Для проверенной покупки
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок отзыва
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="Отличный товар!"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваш отзыв <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-500">(минимум 10 символов)</span>
        </label>
        <textarea
          required
          rows={4}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm ${
            formData.comment.length > 0 && formData.comment.length < 10 
              ? 'border-red-500' 
              : 'border-gray-300'
          }`}
          placeholder="Расскажите о своих впечатлениях..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✓ Достоинства
          </label>
          <textarea
            rows={3}
            value={formData.pros}
            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
            placeholder="Что вам понравилось?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✕ Недостатки
          </label>
          <textarea
            rows={3}
            value={formData.cons}
            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
            placeholder="Что можно улучшить?"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фото и видео
          <span className="ml-2 text-xs text-gray-500">(до 5 файлов, макс. 10MB каждый)</span>
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-primary transition">
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="media-upload" className="cursor-pointer">
            <div className="text-gray-600 mb-2">
              <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Нажмите для загрузки или перетащите файлы
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Поддерживаются: JPG, PNG, GIF, MP4, MOV
            </p>
          </label>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                {formData.media_files?.[index]?.type.startsWith('video/') ? (
                  <video
                    src={preview}
                    className="w-full h-24 md:h-32 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {formData.media_files?.[index]?.type.startsWith('video/') ? '🎥' : '📷'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || formData.rating === 0}
        className="w-full md:w-auto btn-primary px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Отправка...
          </span>
        ) : (
          'Отправить отзыв'
        )}
      </button>

      <p className="text-xs md:text-sm text-gray-500 mt-4 text-center md:text-left">
        * Обязательные поля. Отзывы публикуются после модерации.
      </p>
    </form>
  );
}