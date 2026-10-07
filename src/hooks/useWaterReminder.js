import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useWaterReminder(showNotification) {
  const [isRunning, setIsRunning] = useLocalStorage('water_isRunning', false);
  const [intervalMs, setIntervalMs] = useLocalStorage('water_intervalMs', 3600000); // 1 hr default
  const [nextReminder, setNextReminder] = useLocalStorage('water_nextReminder', null);
  const [glassesHistory, setGlassesHistory] = useLocalStorage('water_glasses_history', {});
  const [timeLeft, setTimeLeft] = useState(null);

  const today = new Date().toDateString();
  const glasses = { count: glassesHistory[today] || 0, date: today };

  // Note: the useEffect that reset glasses is no longer needed because 
  // we dynamically read glassesHistory[today] which is 0 if undefined.

  useEffect(() => {
    if (!isRunning || !nextReminder) {
      setTimeLeft(null);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = nextReminder - now;

      if (remaining <= 0) {
        if (showNotification) {
           showNotification('Time to drink water 💧', { body: 'Stay hydrated!' }, '/water');
        }
        setNextReminder(Date.now() + intervalMs);
      } else {
        setTimeLeft(remaining);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isRunning, nextReminder, intervalMs, setNextReminder, showNotification]);

  const startWater = () => {
    if (isRunning) return;
    setIsRunning(true);
    setNextReminder(Date.now() + intervalMs);
  };

  const stopWater = () => {
    setIsRunning(false);
    setNextReminder(null);
    setTimeLeft(null);
  };

  const addGlass = () => {
    setGlassesHistory(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };

  const handleIntervalChange = (newInterval) => {
    setIntervalMs(newInterval);
    if (isRunning) {
      setNextReminder(Date.now() + newInterval);
    }
  };

  return {
    isRunning,
    intervalMs,
    timeLeft,
    glassesHistory,
    glasses,
    startWater,
    stopWater,
    addGlass,
    handleIntervalChange
  };
}
