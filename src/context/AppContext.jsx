import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotification } from '../hooks/useNotification';
import { useStudyTimer } from '../hooks/useStudyTimer';
import { useGoals } from '../hooks/useGoals';
import { useWaterReminder } from '../hooks/useWaterReminder';
import { useTasks } from '../hooks/useTasks';
import { useLastActive } from '../hooks/useLastActive';

const AppContext = createContext();

export function AppProvider({ children }) {
  const notificationContext = useNotification();
  const { showNotification } = notificationContext;

  const studyContext = useStudyTimer(showNotification);
  const goalsContext = useGoals(showNotification); // Pass notification down if we move goal reminders there, wait, I put them in GoalsContainer currently. Let's move them here later if needed.
  const waterContext = useWaterReminder(showNotification);
  const tasksContext = useTasks(showNotification);
  
  const lastActiveContext = useLastActive();

  // Handle Goal Notifications here at the top level
  const { todayGoals } = goalsContext;
  const [morningReminder, setMorningReminder] = useState(() => JSON.parse(localStorage.getItem('goals_morning_reminder') ?? 'true'));
  const [eveningReminder, setEveningReminder] = useState(() => JSON.parse(localStorage.getItem('goals_evening_reminder') ?? 'true'));
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem('goals_morning_time') || '09:00');
  const [eveningTime, setEveningTime] = useState(() => localStorage.getItem('goals_evening_time') || '20:00');
  
  useEffect(() => {
    localStorage.setItem('goals_morning_reminder', JSON.stringify(morningReminder));
  }, [morningReminder]);

  useEffect(() => {
    localStorage.setItem('goals_evening_reminder', JSON.stringify(eveningReminder));
  }, [eveningReminder]);

  useEffect(() => {
    localStorage.setItem('goals_morning_time', morningTime);
  }, [morningTime]);

  useEffect(() => {
    localStorage.setItem('goals_evening_time', eveningTime);
  }, [eveningTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const todayStr = now.toDateString();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const notifiedM = localStorage.getItem('goals_notified_morning');
      if (morningReminder && currentHHMM >= morningTime && notifiedM !== todayStr) {
        if (todayGoals.length === 0) {
          showNotification('Morning Goals', { body: 'Write your goals for today!' }, '/goals');
          localStorage.setItem('goals_notified_morning', todayStr);
        }
      }

      const notifiedE = localStorage.getItem('goals_notified_evening');
      if (eveningReminder && currentHHMM >= eveningTime && notifiedE !== todayStr) {
        const unfinishedCount = todayGoals.filter(g => !g.done).length;
        if (unfinishedCount > 0) {
          showNotification('Evening Goals Reminder', { body: `You still have ${unfinishedCount} unfinished goal(s) today.` }, '/goals');
          localStorage.setItem('goals_notified_evening', todayStr);
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [morningReminder, eveningReminder, morningTime, eveningTime, todayGoals.length, showNotification, todayGoals]);

  // Combine them all
  const value = {
    notification: notificationContext,
    study: studyContext,
    goals: { 
      ...goalsContext, 
      morningReminder, setMorningReminder, 
      eveningReminder, setEveningReminder,
      morningTime, setMorningTime,
      eveningTime, setEveningTime
    },
    water: waterContext,
    tasks: tasksContext,
    lastActive: lastActiveContext
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
