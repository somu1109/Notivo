import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useTasks(showNotification) {
  const [tasks, setTasks] = useLocalStorage('reminder_tasks', []);

  useEffect(() => {
    const checkTasks = () => {
      const now = Date.now();
      let changed = false;

      const newTasks = tasks.map(task => {
        if (task.status === 'Upcoming' && new Date(task.datetime).getTime() <= now) {
          changed = true;
          const isMissed = now - new Date(task.datetime).getTime() > 60000;
          const newStatus = isMissed ? 'Missed' : 'Reminded';
          
          if (showNotification) {
            showNotification(isMissed ? 'Missed Task' : 'Task Reminder', {
              body: task.title
            }, '/tasks');
          }
          
          return { ...task, status: newStatus };
        }
        return task;
      });

      if (changed) {
        setTasks(newTasks);
      }
    };

    checkTasks();
    const interval = setInterval(checkTasks, 30000);
    return () => clearInterval(interval);
  }, [tasks, setTasks, showNotification]);

  const addTask = (title, datetime) => {
    const newTask = {
      id: Date.now().toString() + Math.random(),
      title,
      datetime,
      status: 'Upcoming'
    };
    setTasks([...tasks, newTask]);
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: newStatus,
          completedAt: newStatus === 'Done' ? Date.now() : t.completedAt
        };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return { tasks, addTask, updateTaskStatus, deleteTask };
}
