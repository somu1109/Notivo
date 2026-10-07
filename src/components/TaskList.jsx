import TaskItem from './TaskItem';
import { Calendar } from 'lucide-react';

export default function TaskList({ tasks, updateTaskStatus, deleteTask }) {
  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-secondary)' }}>
        <Calendar size={48} color="var(--border-color)" style={{ marginBottom: 'var(--sp-3)' }} />
        <div>No tasks yet. Schedule one above!</div>
      </div>
    );
  }

  // Sort tasks by time, nearest first
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const grouped = { Today: [], Upcoming: [], Missed: [], Done: [] };
  const todayStr = new Date().toDateString();

  sortedTasks.forEach(task => {
    if (task.status === 'Done') grouped.Done.push(task);
    else if (task.status === 'Missed') grouped.Missed.push(task);
    else if (new Date(task.datetime).toDateString() === todayStr) grouped.Today.push(task);
    else grouped.Upcoming.push(task);
  });

  return (
    <div className="card">
      <div className="card-title">Schedule</div>
      
      {['Missed', 'Today', 'Upcoming', 'Done'].map(group => {
        if (grouped[group].length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 'var(--sp-5)' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{group}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {grouped[group].map(task => (
                <TaskItem key={task.id} task={task} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
