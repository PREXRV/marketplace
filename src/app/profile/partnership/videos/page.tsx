'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { partnershipAPI } from '@/services/api';
import { Video, Plus, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ✅ SVG иконки соцсетей
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F58529"/>
        <stop offset="50%" stopColor="#DD2A7B"/>
        <stop offset="100%" stopColor="#8134AF"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#2AABEE">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const VKIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0077FF">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.745-.576.745z"/>
  </svg>
);

const RutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#E63934">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 13.5c0 1.933-1.567 3.5-3.5 3.5H8V7h5c1.933 0 3.5 1.567 3.5 3.5 0 .98-.403 1.865-1.05 2.5.647.635 1.05 1.52 1.05 2.5zM10 9v2h3c.552 0 1-.448 1-1s-.448-1-1-1h-3zm3 6c.552 0 1-.448 1-1s-.448-1-1-1h-3v2h3z"/>
  </svg>
);

const OtherLinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const PLATFORMS = [
  { value: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/watch?v=...', Icon: YouTubeIcon },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/reel/...',  Icon: InstagramIcon },
  { value: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@user/video/...', Icon: TikTokIcon },
  { value: 'telegram',  label: 'Telegram',  placeholder: 'https://t.me/channel/123',        Icon: TelegramIcon },
  { value: 'vk',        label: 'ВКонтакте', placeholder: 'https://vk.com/video...',         Icon: VKIcon },
  { value: 'rutube',    label: 'Rutube',    placeholder: 'https://rutube.ru/video/...',      Icon: RutubeIcon },
  { value: 'other',     label: 'Другое...',  placeholder: 'https://...',                    Icon: OtherLinkIcon },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    platform: 'youtube',
  });

  const currentPlatform = PLATFORMS.find(p => p.value === formData.platform);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const videosRes = await partnershipAPI.getVideos();
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : videosRes.data?.results || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await partnershipAPI.uploadVideo(formData);
      toast.success('Видео отправлено на модерацию!');
      setShowForm(false);
      setFormData({ url: '', platform: 'youtube' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка загрузки видео');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Одобрено
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> На модерации
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Отклонено
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/profile/partnership" className="text-primary hover:underline mb-4 inline-block">
          ← Назад
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Мои видео</h1>
          <p className="text-gray-600">Загружайте видео с обзорами товаров</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold mb-8 flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus className="w-5 h-5" />
          Загрузить видео
        </motion.button>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Загрузить видео</h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Платформы */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Платформа <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {PLATFORMS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, platform: value }))}
                      className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border-2 text-xs font-semibold transition
                        ${formData.platform === value
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50/40'
                        }`}
                    >
                      <Icon />
                      <span className="leading-tight text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ссылка */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ссылка на видео <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData(p => ({ ...p, url: e.target.value }))}
                  placeholder={currentPlatform?.placeholder || 'https://...'}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-60 transition flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </>
                  ) : 'Загрузить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Список видео */}
        <div className="grid md:grid-cols-2 gap-6">
          {videos.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center shadow-xl">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">У вас пока нет загруженных видео</p>
            </div>
          ) : (
            videos.map(video => {
              const platform = PLATFORMS.find(p => p.value === video.platform);
              const PlatformIcon = platform?.Icon || OtherLinkIcon;
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                          <PlatformIcon />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {platform?.label || video.platform_display || video.platform}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(video.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(video.status)}
                    </div>

                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-purple-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{video.url}</span>
                    </a>

                    {/* ✅ Комментарий от администратора */}
                    {video.admin_notes && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                          💬 Комментарий администратора
                        </p>
                        <p className="text-sm text-blue-800">{video.admin_notes}</p>
                      </div>
                    )}

                    {video.rejection_reason && (
                      <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-2">
                        ❌ Причина: {video.rejection_reason}
                      </p>
                    )}

                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
