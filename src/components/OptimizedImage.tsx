'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { getWebPUrl } from '@/hooks/useWebPImage';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string; // опционально, если хотим другой fallback
}

export default function OptimizedImage({
  src,
  fallbackSrc,
  alt,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(getWebPUrl(src));
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackSrc || src); // откат на оригинал или fallback
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}