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
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 md:p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
        <svg className="w-5 h-5 md:w-6 md:h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="text-base md:text-lg font-bold">⚡ Акция заканчивается через:</span>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {timeLeft.days > 0 && (
          <div className="text-center bg-white bg-opacity-20 rounded-xl p-2 md:p-3">
            <div className="text-xl md:text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-[10px] md:text-sm opacity-90">дней</div>
          </div>
        )}
        <div className="text-center bg-white bg-opacity-20 rounded-xl p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-[10px] md:text-sm opacity-90">часов</div>
        </div>
        <div className="text-center bg-white bg-opacity-20 rounded-xl p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-[10px] md:text-sm opacity-90">минут</div>
        </div>
        <div className="text-center bg-white bg-opacity-20 rounded-xl p-2 md:p-3">
          <div className="text-xl md:text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-[10px] md:text-sm opacity-90">секунд</div>
        </div>
      </div>
    </div>
  );
}