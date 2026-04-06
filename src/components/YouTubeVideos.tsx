'use client';

import { useState } from 'react';
import { YouTubeVideo } from '@/lib/api';

interface YouTubeVideosProps {
  videos: YouTubeVideo[];
  channelUrl?: string;
}

export default function YouTubeVideos({
  videos,
  channelUrl = 'https://youtube.com/@your-channel',
}: YouTubeVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  if (!videos?.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white py-10 sm:py-12 lg:py-16">
      <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/2 translate-y-1/2 rounded-full bg-red-500/5 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              YouTube
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base lg:text-lg">
            Свежие обзоры, новинки и видео с товарами магазина.
          </p>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-[48px] items-center gap-3 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base lg:text-lg"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>Подписаться на YouTube</span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {videos.map((video, index) => (
            <button
              key={video.id}
              type="button"
              className="group text-left"
              onClick={() => setSelectedVideo(video)}
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both` }}
            >
              <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl sm:rounded-3xl">
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-red-500 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                      <svg className="ml-0.5 h-7 w-7 text-white sm:h-8 sm:w-8 lg:h-10 lg:w-10" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/85 px-2.5 py-1 text-xs font-bold text-white sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-sm">
                      {video.duration}
                    </div>
                  )}

                  {video.published_date &&
                    new Date(video.published_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                        Новое
                      </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 lg:p-6">
                  <h3 className="min-h-[48px] text-base font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-red-600 sm:min-h-[56px] sm:text-lg lg:text-xl">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {videos.length >= 6 && (
          <div className="mt-8 text-center sm:mt-12 lg:mt-16">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-pink-700 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base lg:px-10 lg:py-5 lg:text-lg"
            >
              <span>Смотреть все видео на канале</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:-top-14 sm:h-12 sm:w-12"
              aria-label="Закрыть видео"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              <iframe
                src={`${selectedVideo.embed_url}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>

            <div className="mt-4 text-white sm:mt-6">
              <h3 className="text-xl font-bold sm:text-2xl lg:text-3xl">{selectedVideo.title}</h3>

              {selectedVideo.description && (
                <p className="mt-2 text-sm leading-relaxed text-gray-300 sm:text-base lg:text-lg">
                  {selectedVideo.description}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 sm:text-base">
                {selectedVideo.views_count && selectedVideo.views_count > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{selectedVideo.views_count.toLocaleString('ru-RU')} просмотров</span>
                  </div>
                )}

                {selectedVideo.published_date && (
                  <span>
                    {new Date(selectedVideo.published_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
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
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}