'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endDate: string;
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white shadow-xl sm:p-6">
      <div className="mb-3 flex items-start gap-2 sm:mb-4 sm:items-center sm:gap-2">
        <svg className="mt-0.5 h-5 w-5 animate-pulse shrink-0 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-bold leading-tight sm:text-lg">⚡ Акция заканчивается через:</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {timeLeft.days > 0 && (
          <div className="rounded-xl bg-white/20 p-2 text-center sm:p-3">
            <div className="text-2xl font-bold leading-none sm:text-3xl">{timeLeft.days}</div>
            <div className="mt-1 text-[11px] opacity-90 sm:text-sm">дней</div>
          </div>
        )}
        {timeLeft.days > 0 && (
          <div className="col-span-2 hidden sm:block" aria-hidden="true" />
        )}
        <div className="rounded-xl bg-white/20 p-2 text-center sm:p-3">
          <div className="text-2xl font-bold leading-none sm:text-3xl">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="mt-1 text-[11px] opacity-90 sm:text-sm">часов</div>
        </div>
        <div className="rounded-xl bg-white/20 p-2 text-center sm:p-3">
          <div className="text-2xl font-bold leading-none sm:text-3xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="mt-1 text-[11px] opacity-90 sm:text-sm">минут</div>
        </div>
        <div className="col-span-2 rounded-xl bg-white/20 p-2 text-center sm:col-span-1 sm:p-3">
          <div className="text-2xl font-bold leading-none sm:text-3xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="mt-1 text-[11px] opacity-90 sm:text-sm">секунд</div>
        </div>
      </div>
    </div>
  );
}