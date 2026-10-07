import { useState, useEffect } from 'react';

export function useLastActive() {
  const [lastActive, setLastActive] = useState(() => {
    return parseInt(window.localStorage.getItem('study_last_active')) || Date.now();
  });
  const [awayTime, setAwayTime] = useState(() => {
    const now = Date.now();
    const stored = parseInt(window.localStorage.getItem('study_last_active')) || now;
    if (now - stored > 10 * 60 * 1000) return stored;
    return null;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setLastActive((prev) => {
         if (currentNow - prev > 10 * 60 * 1000) {
           setAwayTime(prev); // Capture the time we left
         }
         return currentNow;
      });
      window.localStorage.setItem('study_last_active', currentNow.toString());
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const clearAwayTime = () => setAwayTime(null);

  return { lastActive, awayTime, clearAwayTime };
}
