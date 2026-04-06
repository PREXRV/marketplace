'use client';

import { useEffect, useRef, useState } from 'react';
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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  ),
  tiktok: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-6.95A8.16 8.16 0 0022 11.1V7.65a8.64 8.64 0 01-2.41-1z" />
    </svg>
  ),
  youtube: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
  const [canScrollVideoRight, setCanScrollVideoRight] = useState(false);
  const [canScrollPostsLeft, setCanScrollPostsLeft] = useState(false);
  const [canScrollPostsRight, setCanScrollPostsRight] = useState(false);

  if (!posts?.length) return null;

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.post_date ? new Date(a.post_date).getTime() : 0;
    const dateB = b.post_date ? new Date(b.post_date).getTime() : 0;
    return dateB - dateA;
  });

  const videoPosts = sortedPosts.filter(
    (p) => p.platform === 'tiktok' || p.platform === 'youtube' || p.video_url || p.video_embed_url
  );

  const regularPosts = sortedPosts.filter(
    (p) => p.platform === 'telegram' && !p.video_url && !p.video_embed_url
  );

  const updateScrollState = (container: HTMLDivElement | null, type: 'video' | 'posts') => {
    if (!container) return;
    const canLeft = container.scrollLeft > 10;
    const canRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;

    if (type === 'video') {
      setCanScrollVideoLeft(canLeft);
      setCanScrollVideoRight(canRight);
    } else {
      setCanScrollPostsLeft(canLeft);
      setCanScrollPostsRight(canRight);
    }
  };

  useEffect(() => {
    updateScrollState(videoScrollRef.current, 'video');
    updateScrollState(postsScrollRef.current, 'posts');

    const handleResize = () => {
      updateScrollState(videoScrollRef.current, 'video');
      updateScrollState(postsScrollRef.current, 'posts');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [posts]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (post.thumbnail_url) return post.thumbnail_url.startsWith('http') ? post.thumbnail_url : `${apiBase}${post.thumbnail_url}`;
    if (post.image_url) return post.image_url.startsWith('http') ? post.image_url : `${apiBase}${post.image_url}`;
    if (post.image) return post.image.startsWith('http') ? post.image : `${apiBase}${post.image}`;
    return null;
  };

  const formatText = (text?: string, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const scrollSlider = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right', type: 'video' | 'posts') => {
    if (!ref.current) return;
    const scrollAmount = window.innerWidth < 640 ? 280 : 380;
    const newScrollLeft =
      direction === 'left'
        ? ref.current.scrollLeft - scrollAmount
        : ref.current.scrollLeft + scrollAmount;

    ref.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });

    setTimeout(() => updateScrollState(ref.current, type), 350);
  };

  return (
    <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-10 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Мы в социальных сетях
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Видео, новости и посты из наших актуальных каналов.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {videoPosts.some((p) => p.platform === 'tiktok') && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r ${platformColors.tiktok} px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg sm:px-6 sm:py-3`}
              >
                {platformLogos.tiktok}
                <span>Подписаться на {platformNames.tiktok}</span>
              </a>
            )}

            {regularPosts.some((p) => p.platform === 'telegram') && (
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r ${platformColors.telegram} px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg sm:px-6 sm:py-3`}
              >
                {platformLogos.telegram}
                <span>Подписаться на {platformNames.telegram}</span>
              </a>
            )}

            {videoPosts.some((p) => p.platform === 'youtube') && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r ${platformColors.youtube} px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg sm:px-6 sm:py-3`}
              >
                {platformLogos.youtube}
                <span>Подписаться на {platformNames.youtube}</span>
              </a>
            )}
          </div>
        </div>

        {videoPosts.length > 0 && (
          <div className="mb-10 sm:mb-12">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Наши видео</h3>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={() => scrollSlider(videoScrollRef, 'left', 'video')}
                  disabled={!canScrollVideoLeft}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Прокрутить видео влево"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollSlider(videoScrollRef, 'right', 'video')}
                  disabled={!canScrollVideoRight}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Прокрутить видео вправо"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={videoScrollRef}
              onScroll={() => updateScrollState(videoScrollRef.current, 'video')}
              className="overflow-x-auto pb-3 scrollbar-hide"
            >
              <div className="flex w-max gap-4 sm:gap-6">
                {videoPosts.map((post) => {
                  const imageUrl = getImageUrl(post);
                  const displayText = post.text || '';

                  return (
                    <div
                      key={post.id}
                      className="flex w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl sm:w-[330px] lg:w-[350px]"
                    >
                      <div className="relative">
                        <VideoEmbed
                          platform={post.platform}
                          embedUrl={post.video_embed_url}
                          videoUrl={post.video_url}
                          thumbnailUrl={imageUrl || undefined}
                          postUrl={post.post_url}
                        />

                        <div className={`absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${platformColors[post.platform]} px-2.5 py-1 text-xs font-semibold text-white shadow-lg sm:px-3 sm:py-1.5 sm:text-sm`}>
                          {platformLogos[post.platform]}
                          <span>{platformNames[post.platform]}</span>
                        </div>

                        {post.duration && (
                          <div className="absolute left-3 top-3 z-30 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                            {formatDuration(post.duration)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-4 flex-grow">
                          {displayText && (
                            <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">
                              {formatText(displayText, 150)}
                            </p>
                          )}
                        </div>

                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700"
                        >
                          Смотреть в {platformNames[post.platform]}
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => scrollSlider(videoScrollRef, 'left', 'video')}
                disabled={!canScrollVideoLeft}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition disabled:opacity-40"
                aria-label="Прокрутить видео влево"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollSlider(videoScrollRef, 'right', 'video')}
                disabled={!canScrollVideoRight}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition disabled:opacity-40"
                aria-label="Прокрутить видео вправо"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {regularPosts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {videoPosts.length > 0 ? 'Последние посты' : 'Наши посты'}
              </h3>

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={() => scrollSlider(postsScrollRef, 'left', 'posts')}
                  disabled={!canScrollPostsLeft}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Прокрутить посты влево"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollSlider(postsScrollRef, 'right', 'posts')}
                  disabled={!canScrollPostsRight}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Прокрутить посты вправо"
                >
                  <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={postsScrollRef}
              onScroll={() => updateScrollState(postsScrollRef.current, 'posts')}
              className="overflow-x-auto pb-3 scrollbar-hide"
            >
              <div className="flex w-max gap-4 sm:gap-6">
                {regularPosts.map((post) => {
                  const imageUrl = getImageUrl(post);
                  const displayText = post.text || '';

                  return (
                    <a
                      key={post.id}
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl sm:w-[330px] lg:w-[350px]"
                    >
                      {imageUrl ? (
                        <div className="relative h-48 overflow-hidden sm:h-52">
                          <img
                            src={imageUrl}
                            alt="Пост из Telegram"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${platformColors[post.platform]} px-2.5 py-1 text-xs font-semibold text-white shadow-lg sm:px-3 sm:py-1.5 sm:text-sm`}>
                            {platformLogos[post.platform]}
                            <span>{platformNames[post.platform]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`relative flex h-24 items-center justify-center bg-gradient-to-r ${platformColors[post.platform]}`}>
                          <div className="scale-125 text-white">{platformLogos[post.platform]}</div>
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <p className="mb-4 line-clamp-4 flex-1 text-sm leading-relaxed text-gray-700">
                          {formatText(displayText, 200)}
                        </p>

                        <div className="mb-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 sm:text-sm">
                          <div className="flex items-center gap-3 sm:gap-4">
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
                            <span className="text-[11px] text-gray-400 sm:text-xs">{formatDate(post.post_date)}</span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition group-hover:text-purple-700">
                          Читать полностью
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              <button
                onClick={() => scrollSlider(postsScrollRef, 'left', 'posts')}
                disabled={!canScrollPostsLeft}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition disabled:opacity-40"
                aria-label="Прокрутить посты влево"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollSlider(postsScrollRef, 'right', 'posts')}
                disabled={!canScrollPostsRight}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition disabled:opacity-40"
                aria-label="Прокрутить посты вправо"
              >
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}