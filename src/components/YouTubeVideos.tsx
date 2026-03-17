'use client';

import { useState } from 'react';
import { YouTubeVideo } from '@/lib/api';

interface YouTubeVideosProps {
  videos: YouTubeVideo[];
  channelUrl?: string; // URL вашего канала
}

export default function YouTubeVideos({ videos, channelUrl = 'https://youtube.com/@your-channel' }: YouTubeVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  if (!videos || videos.length === 0) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section className="py-10 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Заголовок с кнопкой подписки */}
        <div className="text-center mb-16">
          
          
          <h2 className="text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">YouTube</span>
          </h2>

          {/* ✅ Кнопка подписки */}
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Подписаться на YouTube</span>
          </a>
        </div>

        {/* Сетка видео */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Превью видео */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const videoId = video.video_id;
                      
                      if (target.src.includes('maxresdefault')) {
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      } else if (target.src.includes('hqdefault')) {
                        target.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                      } else if (target.src.includes('sddefault')) {
                        target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                      } else {
                        target.src = 'https://via.placeholder.com/640x360/1f2937/ffffff?text=Video';
                      }
                    }}
                  />
                  
                  {/* Градиентный оверлей */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Play кнопка */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500 shadow-2xl">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {/* Длительность */}
                  {video.duration && (
                    <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                      {video.duration}
                    </div>
                  )}

                  {/* Бейдж "НОВОЕ" */}
                  {video.published_date && 
                   new Date(video.published_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-lg animate-pulse">
                      Новое
                    </div>
                  )}
                </div>

                {/* Информация о видео */}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300 leading-tight min-h-[24
                px]">
                    {video.title}
                  </h3>
                  
                  {video.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная кнопка внизу (если много видео) */}
        {videos.length >= 6 && (
          <div className="text-center mt-16">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Смотреть все видео на канале</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Модальное окно - без изменений */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-6xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-14 right-0 text-white hover:text-red-500 transition-colors duration-300 group z-10"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Закрыть</span>
                <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </button>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`${selectedVideo.embed_url}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="mt-6 text-white">
              <h3 className="text-3xl font-bold mb-3">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-300 text-lg leading-relaxed">{selectedVideo.description}</p>
              )}
              
              <div className="flex items-center gap-6 mt-4 text-gray-400">
                {selectedVideo.views_count && selectedVideo.views_count > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-semibold">{selectedVideo.views_count.toLocaleString('ru-RU')} просмотров</span>
                  </div>
                )}
                
                {selectedVideo.published_date && (
                  <span className="font-medium">
                    {new Date(selectedVideo.published_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}
