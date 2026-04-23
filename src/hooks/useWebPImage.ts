import { useState, useEffect } from 'react';

/**
 * Преобразует оригинальный URL в WebP-URL (замена расширения)
 */
export function getWebPUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  // Не трогаем внешние ссылки, если не хотим
  // Заменяем .jpg, .jpeg, .png на .webp
  return originalUrl.replace(/\.(jpe?g|png)$/i, '.webp');
}

/**
 * Хук, который пробует загрузить WebP, а при ошибке возвращает оригинал.
 * Возвращает финальный URL (string) и флаг загрузки.
 */
export function useWebPImage(originalUrl: string | null | undefined): {
  url: string | null;
  loading: boolean;
  error: boolean;
} {
  const [state, setState] = useState<{
    url: string | null;
    loading: boolean;
    error: boolean;
  }>({
    url: originalUrl || null,
    loading: !!originalUrl,
    error: false,
  });

  useEffect(() => {
    if (!originalUrl) {
      setState({ url: null, loading: false, error: false });
      return;
    }

    const webpUrl = getWebPUrl(originalUrl);
    let isMounted = true;
    const img = new Image();

    img.onload = () => {
      if (isMounted) {
        setState({ url: webpUrl, loading: false, error: false });
      }
    };
    img.onerror = () => {
      if (isMounted) {
        setState({ url: originalUrl, loading: false, error: true });
      }
    };
    img.src = webpUrl;
  }, [originalUrl]);

  return state;
}