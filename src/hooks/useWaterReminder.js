import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { notificationService } from '../services/notificationService';

export function useWaterReminder(showNotification) {
  const [isRunning, setIsRunning] = useLocalStorage('water_isRunning', false);
  const [intervalMs, setIntervalMs] = useLocalStorage('water_intervalMs', 3600000); // 1 hr default
  const [nextReminder, setNextReminder] = useLocalStorage('water_nextReminder', null);
  const [glassesHistory, setGlassesHistory] = useLocalStorage('water_glasses_history', {});
  const [timeLeft, setTimeLeft] = useState(null);

  const today = new Date().toDateString();
  const glasses = { count: glassesHistory[today] || 0, date: today };

  useEffect(() => {
    if (!isRunning || !nextReminder) {
      setTimeLeft(null);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = nextReminder - now;

      if (remaining <= 0) {
        notificationService.showImmediate('Time to drink water 💧', { body: 'Stay hydrated! Maintain your peak performance.' }, '/water');
        const nextTarget = Date.now() + intervalMs;
        setNextReminder(nextTarget);
        notificationService.scheduleWaterReminder(nextTarget, intervalMs);
      } else {
        setTimeLeft(remaining);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isRunning, nextReminder, intervalMs, setNextReminder]);

  const startWater = () => {
    if (isRunning) return;
    const target = Date.now() + intervalMs;
    setIsRunning(true);
    setNextReminder(target);
    notificationService.scheduleWaterReminder(target, intervalMs);
  };

  const stopWater = () => {
    setIsRunning(false);
    setNextReminder(null);
    setTimeLeft(null);
    notificationService.cancelWaterReminder();
  };

  const addGlass = () => {
    setGlassesHistory(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };

  const setGlassCount = (newCount) => {
    setGlassesHistory(prev => ({
      ...prev,
      [today]: Math.max(0, newCount)
    }));
  };

  const handleIntervalChange = (newInterval) => {
    setIntervalMs(newInterval);
    if (isRunning) {
      const nextTarget = Date.now() + newInterval;
      setNextReminder(nextTarget);
      notificationService.scheduleWaterReminder(nextTarget, newInterval);
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
    setGlassCount,
    handleIntervalChange
  };
}
