'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/favorites');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Перенаправление...</p>
      </div>
    </div>
  );
}
