'use client';

import { useEffect, useState } from 'react';

interface Props {
  amount: number;
  reason: string;
}

export default function ExperienceToast({ amount, reason }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="font-bold text-lg">+{amount} XP</div>
            <div className="text-sm text-purple-100">{reason}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
