'use client';
import { useEffect, useState } from 'react';

interface MiniCountdownTimerProps {
  endDate: string;
}

export default function MiniCountdownTimer({ endDate }: MiniCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    return <div className="text-white text-sm font-semibold">Завершена</div>;
  }

  return (
    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
      {timeLeft.days > 0 && (
        <span className="text-white font-bold text-sm">{timeLeft.days}д </span>
      )}
      <span className="text-white font-bold text-sm">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        <span className="animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </span>
    </div>
  );
}
