'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  media_url?: string | null;
  media_file?: string | null;
  button_text?: string;
  button_link?: string;
  button_style?: string;
  button_text_2?: string;
  button_link_2?: string;
  button_style_2?: string;
  layout?: string;
  text_align?: string;
  bg_color?: string;
  bg_gradient_start?: string;
  bg_gradient_end?: string;
  text_color?: string;
  title_color?: string;
  overlay?: string;
  animation?: string;
  animation_duration?: number;
  height_desktop?: number;
  height_mobile?: number;
  show_title?: boolean;
  show_subtitle?: boolean;
  show_description?: boolean;
  show_buttons?: boolean;
  show_overlay?: boolean;
  solo_mode?: boolean;
}

export default function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressRef.current!);
          return 100;
        }
        return p + 2;
      });
    }, 100);
  };

  const changeTo = (index: number, dir: 'next' | 'prev') => {
    if (animating || index === current) return;
    setDirection(dir);
    setPrev(current);
    setAnimating(true);
    setCurrent(index);
    startProgress();
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 650);
  };

  const goToNext = () => changeTo((current + 1) % banners.length, 'next');
  const goToPrev = () => changeTo((current - 1 + banners.length) % banners.length, 'prev');
  const goToSlide = (i: number) => changeTo(i, i > current ? 'next' : 'prev');

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    startProgress();
    timerRef.current = setInterval(goToNext, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [banners.length, paused, current]);

  if (!banners?.length) return null;

  const banner = banners[current];
  const prevBanner = prev !== null ? banners[prev] : null;
  if (!banner) return null;

  const height = isMobile
    ? 200
    : banner.height_desktop || 620;

  const getMediaUrl = (b: Banner) => {
    if (b.media_url) return b.media_url;
    if (b.media_file) {
      if (b.media_file.startsWith('http')) return b.media_file;
      return `${process.env.NEXT_PUBLIC_API_URL}${b.media_file}`;
    }
    return null;
  };

  const getBgStyle = (b: Banner) => {
    const mediaUrl = getMediaUrl(b);
    if (mediaUrl) return {};
    if (b.bg_gradient_start && b.bg_gradient_end) {
      return {
        background: `linear-gradient(135deg, ${b.bg_gradient_start}, ${b.bg_gradient_end})`,
      };
    }
    return { backgroundColor: b.bg_color || '#4F46E5' };
  };

  const getButtonStyle = (style?: string) =>
    (
      {
        primary: 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg shadow-white/20',
        secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30',
        outline: 'border border-white/70 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm',
      } as Record<string, string>
    )[style || 'primary'] || 'bg-white text-blue-600 hover:bg-blue-50';

  const contentPos =
    {
      center: 'items-center justify-center',
      left: 'items-center justify-start md:pl-10 lg:pl-16',
      right: 'items-center justify-end md:pr-10 lg:pr-16',
      top: 'items-start justify-center pt-12 md:pt-16',
      bottom: 'items-end justify-center pb-12 md:pb-16',
    }[banner.layout || 'center'] || 'items-center justify-center';

  const textAlign =
    {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[banner.text_align || 'center'] || 'text-center';

  const btnAlign =
    {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    }[banner.text_align || 'center'] || 'justify-center';

  const animStyles = `
    @keyframes slideInRight  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideInLeft   { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutLeft  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes fadeInUp      { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn       { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer       { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes float         { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes pulseGlow     { 0%,100% { box-shadow: 0 0 12px rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 24px rgba(255,255,255,0.35); } }

    .slide-enter-next { animation: slideInRight 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-enter-prev { animation: slideInLeft  0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-exit-next  { animation: slideOutLeft 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-exit-prev  { animation: slideOutRight 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .scale-enter      { animation: scaleIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }

    .text-reveal-1 { animation: fadeInUp 0.7s 0.05s both; }
    .text-reveal-2 { animation: fadeInUp 0.7s 0.18s both; }
    .text-reveal-3 { animation: fadeInUp 0.7s 0.3s both; }
    .text-reveal-4 { animation: fadeInUp 0.7s 0.42s both; }

    .btn-float { animation: float 3s ease-in-out infinite; }
    .btn-glow  { animation: pulseGlow 2s ease-in-out infinite; }

    .shimmer-text {
      background: linear-gradient(90deg, currentColor 25%, rgba(255,255,255,0.8) 50%, currentColor 75%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }
  `;

  const renderSlide = (b: Banner, cls: string) => {
    const mediaUrl = getMediaUrl(b);
    const bg = getBgStyle(b);

    return (
      <div key={b.id} className={`absolute inset-0 ${cls}`} style={bg}>
        {mediaUrl && (
          <div className="absolute inset-0 overflow-hidden">
            {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
              <iframe
                src={mediaUrl}
                className="h-full w-full pointer-events-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <OptimizedImage
                src={mediaUrl}
                alt={b.title}
                fill
                className="object-cover scale-enter"
                sizes="100vw"
              />
            )}
          </div>
        )}

        {b.show_overlay !== false && b.overlay && b.overlay !== 'none' && (
          b.overlay === 'gradient' ? (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          ) : (
            <div
              className="absolute inset-0 bg-black"
              style={{
                opacity: b.overlay === 'light' ? 0.22 : b.overlay === 'medium' ? 0.42 : 0.58,
              }}
            />
          )
        )}

        {!b.solo_mode && !isMobile && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-10"
                style={{
                  width: `${22 + i * 18}px`,
                  height: `${22 + i * 18}px`,
                  background: 'white',
                  left: `${12 + i * 15}%`,
                  top: `${18 + i * 10}%`,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{animStyles}</style>

      <section
        className="relative w-full overflow-hidden select-none"
        style={{ height: `${height}px` }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {prevBanner && renderSlide(prevBanner, direction === 'next' ? 'slide-exit-next' : 'slide-exit-prev')}
        {renderSlide(banner, animating ? (direction === 'next' ? 'slide-enter-next' : 'slide-enter-prev') : '')}

        {!banner.solo_mode && (
          <div className={`absolute inset-0 z-10 flex ${contentPos} px-4 sm:px-6 lg:px-8`}>
            <div className={`w-full max-w-4xl ${textAlign}`}>
              {banner.subtitle && banner.show_subtitle !== false && (
                <div className="text-reveal-1 mb-3 inline-block sm:mb-4">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:px-4 sm:text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: banner.text_color || '#fff',
                      border: '1px solid rgba(255,255,255,0.28)',
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    {banner.subtitle}
                  </span>
                </div>
              )}

              {banner.show_title !== false && banner.title && (
                <h1
                  className="text-reveal-2 mb-4 text-3xl font-black leading-tight drop-shadow-2xl sm:text-4xl md:text-6xl lg:text-7xl"
                  style={{ color: banner.title_color || banner.text_color || '#fff' }}
                >
                  {banner.title}
                </h1>
              )}

              {banner.show_description !== false && banner.description && (
                <p
                  className="text-reveal-3 mb-6 max-w-2xl text-sm leading-6 opacity-90 drop-shadow-lg sm:mb-8 sm:text-base md:text-lg lg:text-xl"
                  style={{
                    color: banner.text_color || '#fff',
                    margin:
                      banner.text_align === 'center'
                        ? '0 auto 1.5rem'
                        : '0 0 1.5rem',
                  }}
                >
                  {banner.description}
                </p>
              )}

              {banner.show_buttons !== false && (banner.button_text || banner.button_text_2) && (
                <div className={`text-reveal-4 flex flex-col gap-3 sm:flex-row sm:gap-4 ${btnAlign}`}>
                  {banner.button_text && banner.button_link && (
                    <Link
                      href={banner.button_link}
                      className={`group relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] sm:px-7 sm:py-4 sm:text-base lg:text-lg ${getButtonStyle(
                        banner.button_style
                      )} ${!isMobile ? 'btn-glow' : ''}`}
                    >
                      <span className="relative z-10">{banner.button_text}</span>
                      <svg
                        className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)',
                        }}
                      />
                    </Link>
                  )}

                  {banner.button_text_2 && banner.button_link_2 && (
                    <Link
                      href={banner.button_link_2}
                      className={`group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] sm:px-7 sm:py-4 sm:text-base lg:text-lg ${getButtonStyle(
                        banner.button_style_2
                      )} ${!isMobile ? 'btn-float' : ''}`}
                    >
                      {banner.button_text_2}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 sm:flex md:left-4 md:h-12 md:w-12"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)' }}
              aria-label="Предыдущий баннер"
            >
              <svg className="h-4 w-4 text-white md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 sm:flex md:right-4 md:h-12 md:w-12"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)' }}
              aria-label="Следующий баннер"
            >
              <svg className="h-4 w-4 text-white md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-6 sm:gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="relative flex items-center justify-center"
                style={{
                  width: i === current ? (isMobile ? 28 : 40) : 10,
                  height: 10,
                  transition: 'width 0.3s ease',
                }}
                aria-label={`Перейти к баннеру ${i + 1}`}
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: i === current ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.42)',
                  }}
                />
                {i === current && (
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{
                        width: `${progress}%`,
                        transition: 'width 0.1s linear',
                      }}
                    />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}
        />
      </section>
    </>
  );
}