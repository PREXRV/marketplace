'use client';
import { useEffect, useRef, useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

interface VideoEmbedProps {
  platform: string;
  embedUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  postUrl: string;
}

export default function VideoEmbed({ platform, embedUrl, videoUrl, thumbnailUrl, postUrl }: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // TikTok - официальный embed через blockquote
  if (platform === 'tiktok') {
    useEffect(() => {
      // Загружаем TikTok embed script
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      
      script.onload = () => {
        setIsLoaded(true);
        // ✅ ИСПРАВЛЕНИЕ: Проверяем что load это функция
        if (window.tiktokEmbed && typeof window.tiktokEmbed.load === 'function') {
          try {
            window.tiktokEmbed.load();
          } catch (error) {
            console.log('TikTok embed load failed:', error);
          }
        }
      };
      
      if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
        document.body.appendChild(script);
      } else {
        setIsLoaded(true);
        // ✅ ИСПРАВЛЕНИЕ: Проверяем что load это функция
        if (window.tiktokEmbed && typeof window.tiktokEmbed.load === 'function') {
          try {
            window.tiktokEmbed.load();
          } catch (error) {
            console.log('TikTok embed load failed:', error);
          }
        }
      }

      return () => {
        // Cleanup не нужен так как скрипт используется глобально
      };
    }, [postUrl]);

    // ✅ ИСПРАВЛЕНИЕ: Двойной слэш для экранирования
    const videoId = postUrl.match(/video\/(\d+)/)?.[1];
    const username = postUrl.match(/@([^\/]+)/)?.[1];

    return (
      <div 
        ref={containerRef}
        className="relative w-full mx-auto rounded-lg overflow-hidden"
        style={{ maxWidth: '325px', minHeight: '600px' }}
      >
        <blockquote 
          className="tiktok-embed" 
          cite={postUrl}
          data-video-id={videoId}
          style={{ maxWidth: '605px', minWidth: '325px' }}
        >
          <section>
            <a 
              target="_blank" 
              rel="noopener noreferrer"
              title={`@${username}`}
              href={`https://www.tiktok.com/@${username}`}
            >
              @{username}
            </a>
          </section>
        </blockquote>

        {/* Loader пока загружается */}
        {!isLoaded && thumbnailUrl && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <OptimizedImage 
              src={thumbnailUrl} 
              alt="Loading..."
              width={325}
              height={600}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // YouTube embed
  if (platform === 'youtube' && embedUrl) {
    return (
      <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Прямое видео
  if (videoUrl) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black">
        <video
          className="w-full h-auto max-h-[600px]"
          controls
          poster={thumbnailUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
      </div>
    );
  }

  // Fallback - превью с кнопкой
  if (thumbnailUrl) {
    return (
      <a
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-lg overflow-hidden group mx-auto cursor-pointer"
        style={{ maxWidth: '325px', height: '600px' }}
      >
        <OptimizedImage
          src={thumbnailUrl}
          alt="Video preview"
          width={325}
          height={600}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative transform group-hover:scale-110 transition-transform duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl">
              <svg className="w-14 h-14 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return null;
}

// ✅ Добавляем типы для window
declare global {
  interface Window {
    tiktokEmbed?: {
      load?: () => void;
    };
  }
}
