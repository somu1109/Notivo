import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useGoals() {
  const [goals, setGoals] = useLocalStorage('daily_goals', []);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());

  // Handle midnight day change
  useEffect(() => {
    const timer = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60000); // check every minute
    return () => clearInterval(timer);
  }, [currentDate]);

  const todayGoals = goals.filter(g => g.date === currentDate);

  const addGoal = (text) => {
    if (!text.trim()) return;
    const newGoal = {
      id: Date.now().toString() + Math.random(),
      text: text.trim(),
      done: false,
      date: currentDate,
      completedAt: null
    };
    setGoals([...goals, newGoal]);
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const isDone = !g.done;
        return { ...g, done: isDone, completedAt: isDone ? Date.now() : null };
      }
      return g;
    }));
  };

  const editGoal = (id, newText) => {
    if (!newText.trim()) return;
    setGoals(goals.map(g => g.id === id ? { ...g, text: newText.trim() } : g));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const bringBackUnfinished = () => {
    const dates = [...new Set(goals.map(g => g.date))];
    if (dates.length < 2) return; // Only one day exists
    
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    // Find the most recent past day
    const pastDate = dates.find(d => d !== currentDate);
    if (!pastDate) return;

    const unfinished = goals.filter(g => g.date === pastDate && !g.done);
    if (unfinished.length === 0) return;

    const carriedOver = unfinished.map(g => ({
      ...g,
      id: Date.now().toString() + Math.random(), // new id
      date: currentDate,
      text: g.text + ' (carried over)'
    }));

    setGoals([...goals, ...carriedOver]);
  };

  return {
    goals,
    todayGoals,
    currentDate,
    addGoal,
    toggleGoal,
    editGoal,
    deleteGoal,
    bringBackUnfinished
  };
}
