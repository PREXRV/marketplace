'use client';
import { useState, useRef } from 'react';
import VideoEmbed from './VideoEmbed';

interface SocialPost {
  id: number;
  platform: string;
  title?: string;
  text?: string;
  image?: string;
  image_url?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_embed_url?: string;
  duration?: number;
  post_url: string;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  post_date?: string;
}

const platformLogos: Record<string, JSX.Element> = {
  telegram: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-6.95A8.16 8.16 0 0022 11.1V7.65a8.64 8.64 0 01-2.41-1z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

const socialLinks: Record<string, string> = {
  tiktok: 'https://www.tiktok.com/@_prexrv_',
  telegram: 'https://t.me/akioka_shop',
  youtube: 'https://www.youtube.com/@aki-oka_shop',
};

const platformColors: Record<string, string> = {
  telegram: 'from-blue-500 to-blue-600',
  tiktok: 'from-black to-gray-900',
  youtube: 'from-red-600 to-red-700',
};

const platformNames: Record<string, string> = {
  telegram: 'Telegram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export default function SocialFeed({ posts }: { posts: SocialPost[] }) {
  const videoScrollRef = useRef<HTMLDivElement>(null);
  const postsScrollRef = useRef<HTMLDivElement>(null);
  
  const [canScrollVideoLeft, setCanScrollVideoLeft] = useState(false);
  const [canScrollVideoRight, setCanScrollVideoRight] = useState(true);
  const [canScrollPostsLeft, setCanScrollPostsLeft] = useState(false);
  const [canScrollPostsRight, setCanScrollPostsRight] = useState(true);

  if (!posts || posts.length === 0) {
    return null;
  }

  // Сортируем по дате (новые первыми)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.post_date ? new Date(a.post_date).getTime() : 0;
    const dateB = b.post_date ? new Date(b.post_date).getTime() : 0;
    return dateB - dateA;
  });

  // Разделяем на видео и обычные посты
  const videoPosts = sortedPosts.filter(p => 
    p.platform === 'tiktok' || p.platform === 'youtube' || p.video_url || p.video_embed_url
  );
  const regularPosts = sortedPosts.filter(p => 
    p.platform === 'telegram' && !p.video_url && !p.video_embed_url
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getImageUrl = (post: SocialPost) => {
    if (post.thumbnail_url) {
      return post.thumbnail_url.startsWith('http') ? post.thumbnail_url : `http://localhost:8000${post.thumbnail_url}`;
    }
    if (post.image_url) {
      return post.image_url.startsWith('http') ? post.image_url : `http://localhost:8000${post.image_url}`;
    }
    if (post.image) {
      return post.image.startsWith('http') ? post.image : `http://localhost:8000${post.image}`;
    }
    return null;
  };

  const formatText = (text?: string, maxLength: number = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const scrollVideo = (direction: 'left' | 'right') => {
    if (videoScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? videoScrollRef.current.scrollLeft - scrollAmount
        : videoScrollRef.current.scrollLeft + scrollAmount;
      
      videoScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(() => {
        if (videoScrollRef.current) {
          setCanScrollVideoLeft(videoScrollRef.current.scrollLeft > 0);
          setCanScrollVideoRight(
            videoScrollRef.current.scrollLeft < 
            videoScrollRef.current.scrollWidth - videoScrollRef.current.clientWidth - 10
          );
        }
      }, 300);
    }
  };

  const scrollPosts = (direction: 'left' | 'right') => {
    if (postsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? postsScrollRef.current.scrollLeft - scrollAmount
        : postsScrollRef.current.scrollLeft + scrollAmount;
      
      postsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(() => {
        if (postsScrollRef.current) {
          setCanScrollPostsLeft(postsScrollRef.current.scrollLeft > 0);
          setCanScrollPostsRight(
            postsScrollRef.current.scrollLeft < 
            postsScrollRef.current.scrollWidth - postsScrollRef.current.clientWidth - 10
          );
        }
      }, 300);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Мы в социальных сетях
          </h2>

          {/* Кнопки подписок */}
          <div className="flex flex-wrap justify-center gap-4">
            {videoPosts.some(p => p.platform === 'tiktok') && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-r ${platformColors.tiktok} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2`}
              >
                {platformLogos.tiktok}
                <span>Подписаться на {platformNames.tiktok}</span>
              </a>
            )}
            {regularPosts.some(p => p.platform === 'telegram') && (
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-r ${platformColors.telegram} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2`}
              >
                {platformLogos.telegram}
                <span>Подписаться на {platformNames.telegram}</span>
              </a>
            )}
            {videoPosts.some(p => p.platform === 'youtube') && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-r ${platformColors.youtube} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2`}
              >
                {platformLogos.youtube}
                <span>Подписаться на {platformNames.youtube}</span>
              </a>
            )}
          </div>
        </div>

        {/* ВИДЕО СЕКЦИЯ */}
        {videoPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>Наши видео</span>
            </h3>
            
            <div className="relative">
              {canScrollVideoLeft && (
                <button
                  onClick={() => scrollVideo('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Прокрутить влево"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div 
                ref={videoScrollRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                  {videoPosts.map((post) => {
                    const imageUrl = getImageUrl(post);
                    const displayText = post.text || '';

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-[350px] flex-shrink-0 flex flex-col"
                      >
                        <div className="relative">
                          <VideoEmbed
                            platform={post.platform}
                            embedUrl={post.video_embed_url}
                            videoUrl={post.video_url}
                            thumbnailUrl={imageUrl || undefined}
                            postUrl={post.post_url}
                          />
                          
                          <div className={`absolute top-3 right-3 bg-gradient-to-r ${platformColors[post.platform]} text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg z-30`}>
                            {platformLogos[post.platform]}
                            <span>{platformNames[post.platform]}</span>
                          </div>

                          {post.duration && (
                            <div className="absolute top-3 left-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold z-30">
                              {formatDuration(post.duration)}
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <div className="flex-grow mb-4">
                            {displayText && (
                              <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                                {formatText(displayText, 150)}
                              </p>
                            )}
                          </div>

                          <a
                            href={post.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg text-sm mt-auto"
                          >
                            Смотреть в {platformNames[post.platform]}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {canScrollVideoRight && (
                <button
                  onClick={() => scrollVideo('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Прокрутить вправо"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ОБЫЧНЫЕ ПОСТЫ (TELEGRAM) - ТЕПЕРЬ ТОЖЕ В СТРОКУ */}
        {regularPosts.length > 0 && (
          <div>
            {videoPosts.length > 0 && (
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Последние посты
              </h3>
            )}
            
            <div className="relative">
              {canScrollPostsLeft && (
                <button
                  onClick={() => scrollPosts('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Прокрутить влево"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div 
                ref={postsScrollRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                  {regularPosts.map((post) => {
                    const imageUrl = getImageUrl(post);
                    const displayText = post.text || '';

                    return (
                      <a
                        key={post.id}
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-[350px] flex-shrink-0 flex flex-col"
                      >
                        {imageUrl ? (
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt="Пост из Telegram"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className={`absolute top-3 right-3 bg-gradient-to-r ${platformColors[post.platform]} text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg`}>
                              {platformLogos[post.platform]}
                              <span>{platformNames[post.platform]}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`relative h-24 bg-gradient-to-r ${platformColors[post.platform]} flex items-center justify-center`}>
                            <div className="text-white scale-150">
                              {platformLogos[post.platform]}
                            </div>
                          </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                          <p className="text-gray-700 leading-relaxed mb-4 flex-1 line-clamp-4">
                            {formatText(displayText, 200)}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              {formatNumber(post.views_count) && (
                                <div className="flex items-center gap-1">
                                  <span>👁️</span>
                                  <span>{formatNumber(post.views_count)}</span>
                                </div>
                              )}
                              {formatNumber(post.likes_count) && (
                                <div className="flex items-center gap-1">
                                  <span>❤️</span>
                                  <span>{formatNumber(post.likes_count)}</span>
                                </div>
                              )}
                            </div>
                            {post.post_date && (
                              <span className="text-xs text-gray-400">{formatDate(post.post_date)}</span>
                            )}
                          </div>

                          <span className="text-purple-600 font-semibold group-hover:text-purple-700 flex items-center gap-2 text-sm">
                            Читать полностью
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {canScrollPostsRight && (
                <button
                  onClick={() => scrollPosts('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Прокрутить вправо"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
