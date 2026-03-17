'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function AvatarUpload() {
  const { user, token, updateAvatar, fetchProfile } = useAuth(); // ✅ ДОБАВЛЕН fetchProfile
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ ПРЯМАЯ ЗАГРУЗКА БЕЗ МОДАЛКИ
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:8000/api/profile/upload-avatar/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ Аватар загружен, URL:', data.avatar);
        
        // ✅ ВАРИАНТ 1: Быстрое обновление только аватара
        updateAvatar(data.avatar);
        
        // ✅ ВАРИАНТ 2: Полная перезагрузка профиля (НАДЁЖНЕЕ!)
        await fetchProfile();
        
        console.log('✅ Профиль обновлён из API');
        
        alert('Аватар успешно обновлен!');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка загрузки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка загрузки аватара');
    } finally {
      setUploading(false);
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Удаление аватара
  const handleDeleteAvatar = async () => {
    if (!confirm('Удалить аватар?')) return;

    try {
      const response = await fetch('http://localhost:8000/api/profile/delete-avatar/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        updateAvatar(null);
        
        // ✅ ДОБАВЛЕНО: Перезагрузка профиля после удаления
        await fetchProfile();
        
        alert('Аватар удален');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка удаления аватара');
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Аватар */}
      <div className="relative w-[150px] h-[150px]">
        <Image
          src={user?.avatar || '/default-avatar.png'}
          alt="Avatar"
          width={150}
          height={150}
          className="rounded-full object-cover border-4 border-gray-200"
          unoptimized // Для внешних URL
          key={user?.avatar} // ✅ ДОБАВЛЕНО: Принудительное обновление при изменении аватара
        />
        
        {/* Оверлей при загрузке */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <label className={`px-5 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Загрузка...' : 'Изменить фото'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {user?.avatar && (
          <button 
            onClick={handleDeleteAvatar}
            disabled={uploading}
            className="px-5 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
