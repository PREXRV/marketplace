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
    seconds: 0
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
          seconds: Math.floor((difference / 1000) % 60)
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
      <div className="bg-white/20 rounded-lg px-2 py-1 md:px-4 md:py-2">
        <p className="text-white text-xs md:text-sm font-semibold">Акция завершена</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Дни (если больше 0) */}
      {timeLeft.days > 0 && (
        <>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[60px] text-center">
            <div className="text-base md:text-xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-[10px] md:text-xs text-white/80">дней</div>
          </div>
          <span className="text-white text-base md:text-xl font-bold">:</span>
        </>
      )}
      
      {/* Часы */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[60px] text-center">
        <div className="text-base md:text-xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs text-white/80">часов</div>
      </div>
      
      <span className="text-white text-base md:text-xl font-bold">:</span>
      
      {/* Минуты */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[60px] text-center">
        <div className="text-base md:text-xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs text-white/80">минут</div>
      </div>
      
      <span className="text-white text-base md:text-xl font-bold">:</span>
      
      {/* Секунды */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 min-w-[40px] md:min-w-[60px] text-center">
        <div className="text-base md:text-xl font-bold text-white animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs text-white/80">секунд</div>
      </div>
    </div>
  );
}