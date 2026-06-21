import { useEffect } from 'react';
import { useTimerStore } from '../store/timerStore';

export const useSleepTimerCountdown = () => {
  const timerActive = useTimerStore((state) => state.timerActive);
  const tickTimer = useTimerStore((state) => state.tickTimer);

  useEffect(() => {
    if (!timerActive) return;

    // Tick the timer store every 1 second
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, tickTimer]);
};
