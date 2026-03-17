'use client';
import { useEffect, useState, useRef } from 'react';
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
  const [current, setCurrent]       = useState(0);
  const [prev, setPrev]             = useState<number | null>(null);
  const [animating, setAnimating]   = useState(false);
  const [direction, setDirection]   = useState<'next' | 'prev'>('next');
  const [isMobile, setIsMobile]     = useState(false);
  const [paused, setPaused]         = useState(false);
  const [progress, setProgress]     = useState(0);
  const timerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100; }
        return p + (100 / 50); // 5000ms / 100ms = 50 шагов
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
    }, 700);
  };

  const goToNext = () => changeTo((current + 1) % banners.length, 'next');
  const goToPrev = () => changeTo((current - 1 + banners.length) % banners.length, 'prev');
  const goToSlide = (i: number) => changeTo(i, i > current ? 'next' : 'prev');

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    startProgress();
    timerRef.current = setInterval(goToNext, 5000);
    return () => {
      clearInterval(timerRef.current!);
      clearInterval(progressRef.current!);
    };
  }, [banners.length, paused, current]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[current];
  const prevBanner = prev !== null ? banners[prev] : null;
  if (!banner) return null;

  const height = isMobile ? (banner.height_mobile || 400) : (banner.height_desktop || 600);

  const getMediaUrl = (b: Banner) => {
    if (b.media_url) return b.media_url;
    if (b.media_file) {
      if (b.media_file.startsWith('http')) return b.media_file;
      return `http://localhost:8000${b.media_file}`;
    }
    return null;
  };

  const getBgStyle = (b: Banner) => {
    const mediaUrl = getMediaUrl(b);
    if (mediaUrl) return {};
    if (b.bg_gradient_start && b.bg_gradient_end)
      return { background: `linear-gradient(135deg, ${b.bg_gradient_start}, ${b.bg_gradient_end})` };
    return { backgroundColor: b.bg_color || '#4F46E5' };
  };

  const getButtonStyle = (style?: string) => ({
    primary: 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg shadow-white/20',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30',
    outline: 'border-2 border-white text-white bg-transparent hover:bg-white/10 backdrop-blur-sm',
  }[style || 'primary'] || 'bg-white text-blue-600 hover:bg-blue-50');

  const contentPos = ({
    center: 'items-center justify-center',
    left:   'items-center justify-start md:pl-16',
    right:  'items-center justify-end md:pr-16',
    top:    'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
  }[banner.layout || 'center']);

  const textAlign   = ({ left: 'text-left', center: 'text-center', right: 'text-right' }[banner.text_align || 'center']);
  const btnAlign    = ({ left: 'justify-start', center: 'justify-center', right: 'justify-end' }[banner.text_align || 'center']);

  // ✅ CSS анимации через style тег
  const animStyles = `
    @keyframes slideInRight  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideInLeft   { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutLeft  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes fadeInUp      { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInDown    { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn       { from { opacity: 0; transform: scale(1.08); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer       { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes float         { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes pulseGlow     { 0%,100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 40px rgba(255,255,255,0.6); } }
    @keyframes particleFloat { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }

    .slide-enter-next { animation: slideInRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-enter-prev { animation: slideInLeft  0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-exit-next  { animation: slideOutLeft  0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
    .slide-exit-prev  { animation: slideOutRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
    .scale-enter      { animation: scaleIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }

    .text-reveal-1 { animation: fadeInUp 0.8s 0.1s both; }
    .text-reveal-2 { animation: fadeInUp 0.8s 0.25s both; }
    .text-reveal-3 { animation: fadeInUp 0.8s 0.4s both; }
    .text-reveal-4 { animation: fadeInUp 0.8s 0.55s both; }

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
    const mUrl = getMediaUrl(b);
    const bg   = getBgStyle(b);
    return (
      <div
        key={b.id}
        className={`absolute inset-0 ${cls}`}
        style={bg}
      >
        {/* Фоновое медиа */}
        {mUrl && (
          <div className="absolute inset-0 overflow-hidden">
            {mUrl.includes('youtube.com') || mUrl.includes('youtu.be') ? (
              <iframe src={mUrl} className="w-full h-full pointer-events-none" allow="autoplay; encrypted-media" allowFullScreen />
            ) : (
              <img src={mUrl} alt={b.title} className="w-full h-full object-cover scale-enter" />
            )}
          </div>
        )}

        {/* ✅ Оверлей */}
        {b.show_overlay !== false && b.overlay && b.overlay !== 'none' && (
          b.overlay === 'gradient'
            ? <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            : <div className="absolute inset-0 bg-black" style={{
                opacity: b.overlay === 'light' ? 0.2 : b.overlay === 'medium' ? 0.4 : 0.6
              }} />
        )}

        {/* ✅ Декоративные частицы */}
        {!b.solo_mode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-10"
                style={{
                  width: `${20 + i * 15}px`, height: `${20 + i * 15}px`,
                  background: 'white',
                  left: `${10 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                  animation: `particleFloat ${4 + i}s linear infinite`,
                  animationDelay: `${i * 0.8}s`,
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

      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: `${height}px` }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ✅ Предыдущий слайд (уходит) */}
        {prevBanner && renderSlide(prevBanner, direction === 'next' ? 'slide-exit-next' : 'slide-exit-prev')}

        {/* ✅ Текущий слайд (входит) */}
        {renderSlide(banner, animating ? (direction === 'next' ? 'slide-enter-next' : 'slide-enter-prev') : '')}

        {/* ✅ Контент поверх */}
        {!banner.solo_mode && (
          <div className={`absolute inset-0 z-10 flex ${contentPos} px-4`}>
            <div className={`max-w-4xl w-full ${textAlign}`}>

              {/* Бейдж */}
              {banner.subtitle && banner.show_subtitle !== false && (
                <div className="text-reveal-1 inline-block mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.15)', color: banner.text_color || '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {banner.subtitle}
                  </span>
                </div>
              )}

              {/* Заголовок */}
              {banner.show_title !== false && banner.title && (
                <h1 className="text-reveal-2 text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight drop-shadow-2xl"
                  style={{ color: banner.title_color || banner.text_color || '#fff' }}>
                  {banner.title}
                </h1>
              )}

              {/* Описание */}
              {banner.show_description !== false && banner.description && (
                <p className="text-reveal-3 text-base md:text-xl mb-8 opacity-90 max-w-2xl drop-shadow-lg"
                  style={{
                    color: banner.text_color || '#fff',
                    margin: banner.text_align === 'center' ? '0 auto 2rem' : '0 0 2rem',
                  }}>
                  {banner.description}
                </p>
              )}

              {/* Кнопки */}
              {banner.show_buttons !== false && (banner.button_text || banner.button_text_2) && (
                <div className={`text-reveal-4 flex flex-col sm:flex-row gap-4 ${btnAlign}`}>
                  {banner.button_text && banner.button_link && (
                    <Link href={banner.button_link}
                      className={`group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 btn-glow overflow-hidden ${getButtonStyle(banner.button_style)}`}>
                      <span className="relative z-10">{banner.button_text}</span>
                      <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      {/* Shine эффект */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)' }} />
                    </Link>
                  )}
                  {banner.button_text_2 && banner.button_link_2 && (
                    <Link href={banner.button_link_2}
                      className={`group inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 btn-float ${getButtonStyle(banner.button_style_2)}`}>
                      {banner.button_text_2}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ Стрелки */}
        {banners.length > 1 && (
          <>
            <button onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 group flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <svg className="w-5 h-5 text-white transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 group flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <svg className="w-5 h-5 text-white transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* ✅ Точки + прогресс-бар */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className="relative flex items-center justify-center"
                style={{ width: i === current ? 40 : 12, height: 12, transition: 'width 0.3s ease' }}>
                <span className="absolute inset-0 rounded-full"
                  style={{ background: i === current ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)', borderRadius: 999 }} />
                {i === current && (
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute inset-y-0 left-0 bg-white rounded-full"
                      style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ✅ Нижняя градиентная тень */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)' }} />
      </div>
    </>
  );
}
