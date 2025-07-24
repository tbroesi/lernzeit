import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  startTime: number;
}

export function GameTimer({ startTime }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
      <Clock className="w-4 h-4" />
      <span className="font-mono">{formatTime(elapsedTime)}</span>
    </div>
  );
}