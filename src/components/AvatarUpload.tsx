'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface AvatarUploadProps {
  size?: number;         // Размер аватара в px (default: 150)
  showDelete?: boolean;  // Показывать кнопку удаления (default: true)
  onSuccess?: (avatarUrl: string | null) => void;
}

export default function AvatarUpload({
  size = 150,
  showDelete = true,
  onSuccess,
}: AvatarUploadProps) {
  const { user, tokens, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Валидация файла
  const validateFile = (file: File): string | null => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return 'Формат не поддерживается. Используйте JPEG, PNG или WebP';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Размер файла не должен превышать 5MB';
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!tokens?.access) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/products/profile/upload-avatar/`, {
        method: 'POST',
        headers: {
          // ✅ Bearer — как в остальных запросах проекта
          Authorization: `Bearer ${tokens.access}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      // ✅ data.avatar_url — прямой URL из Яндекс бакета
      // data.user содержит полный обновлённый объект пользователя
      updateUser(data.user);
      onSuccess?.(data.avatar_url);
    } catch (err: any) {
      alert(err.message || 'Ошибка загрузки аватара');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [tokens, updateUser, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Удалить аватар?') || !tokens?.access) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/products/profile/delete-avatar/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.access}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка удаления');
      }

      // ✅ Обнуляем аватар в контексте
      updateUser({ ...user!, avatar: null, avatar_url: null } as any);
      onSuccess?.(null);
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления аватара');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Берём avatar_url напрямую — это уже полная ссылка на бакет
  const avatarSrc = (user as any)?.avatar_url || user?.avatar || null;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Аватар с drag & drop */}
      <div
        className={`relative rounded-full overflow-hidden border-4 transition-all duration-200 cursor-pointer
          ${dragOver
            ? 'border-blue-400 scale-105 shadow-lg shadow-blue-200'
            : 'border-gray-200 hover:border-blue-300'
          }`}
        style={{ width: size, height: size }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        title="Нажмите или перетащите фото"
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt="Аватар"
            width={size}
            height={size}
            className="object-cover w-full h-full"
            unoptimized  // ✅ Для внешних URL (storage.yandexcloud.net)
            key={avatarSrc}  // Принудительное обновление при смене URL
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <svg className="w-1/3 h-1/3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Оверлей при загрузке / hover */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200
          ${uploading
            ? 'bg-black/60'
            : 'bg-black/0 hover:bg-black/40'
          }`}>
          {uploading ? (
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="opacity-0 hover:opacity-100 transition text-white text-xs font-medium text-center px-2">
              📷 Изменить
            </div>
          )}
        </div>
      </div>

      {/* Подсказка drag & drop */}
      {!uploading && (
        <p className="text-xs text-gray-400 text-center">
          Нажмите или перетащите фото<br />
          <span className="text-gray-300">JPEG, PNG, WebP · до 5MB</span>
        </p>
      )}

      {/* Кнопки */}
      <div className="flex gap-3">
        <label
          className={`px-5 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer
            hover:bg-blue-700 transition text-sm
            ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        >
          {uploading ? 'Загрузка...' : 'Изменить фото'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {showDelete && avatarSrc && (
          <button
            onClick={handleDeleteAvatar}
            disabled={uploading}
            className="px-5 py-2 border border-red-400 text-red-500 rounded-lg font-medium text-sm
              hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
