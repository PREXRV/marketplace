'use client';

import { useEffect, useState } from 'react';

interface CompactCountdownTimerProps {
  endDate: string;
}

export default function CompactCountdownTimer({ endDate }: CompactCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className="rounded-lg bg-white/20 px-3 py-2 text-center sm:px-4">
        <p className="text-xs font-semibold text-white sm:text-sm">Акция завершена</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      {timeLeft.days > 0 && (
        <>
          <div className="min-w-[52px] rounded-lg bg-white/20 px-2 py-2 text-center backdrop-blur-sm sm:min-w-[60px] sm:px-3">
            <div className="text-base font-bold leading-none text-white sm:text-xl">{timeLeft.days}</div>
            <div className="mt-1 text-[10px] text-white/80 sm:text-xs">дней</div>
          </div>
          <span className="px-0.5 text-base font-bold text-white sm:text-xl" aria-hidden="true">:</span>
        </>
      )}

      <div className="min-w-[52px] rounded-lg bg-white/20 px-2 py-2 text-center backdrop-blur-sm sm:min-w-[60px] sm:px-3">
        <div className="text-base font-bold leading-none text-white sm:text-xl">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="mt-1 text-[10px] text-white/80 sm:text-xs">часов</div>
      </div>

      <span className="px-0.5 text-base font-bold text-white sm:text-xl" aria-hidden="true">:</span>

      <div className="min-w-[52px] rounded-lg bg-white/20 px-2 py-2 text-center backdrop-blur-sm sm:min-w-[60px] sm:px-3">
        <div className="text-base font-bold leading-none text-white sm:text-xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="mt-1 text-[10px] text-white/80 sm:text-xs">минут</div>
      </div>

      <span className="px-0.5 text-base font-bold text-white sm:text-xl" aria-hidden="true">:</span>

      <div className="min-w-[52px] rounded-lg bg-white/20 px-2 py-2 text-center backdrop-blur-sm sm:min-w-[60px] sm:px-3">
        <div className="animate-pulse text-base font-bold leading-none text-white sm:text-xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="mt-1 text-[10px] text-white/80 sm:text-xs">секунд</div>
      </div>
    </div>
  );
}