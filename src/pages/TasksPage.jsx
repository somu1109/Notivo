import { useAppContext } from '../context/AppContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Target, ArrowUpRight } from 'lucide-react';

export default function TasksPage() {
  const { tasks: tasksContext, user } = useAppContext();
  const { tasks, addTask, updateTaskStatus, deleteTask, clearAllTasks } = tasksContext;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-text-main)' }}>
          Goals &amp; Milestones
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '2px' }}>
          {user?.greeting ? `${user.greeting} • ` : ''}Schedule time-sensitive goals and stay on top of critical future milestones.
        </p>
      </div>

      <div className="card" style={{ padding: '14px 18px' }}>
        <div className="card-header-row" style={{ marginBottom: '8px' }}>
          <div className="card-title">
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--color-yellow-soft)',
              border: '1px solid var(--color-gray-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1C1C1E'
            }}>
              <Target size={14} />
            </div>
            <span style={{ fontSize: '1rem' }}>Create New Goal</span>
          </div>

          <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
            <ArrowUpRight size={13} />
          </div>
        </div>

        <TaskForm addTask={addTask} />
      </div>

      <TaskList 
        tasks={tasks} 
        updateTaskStatus={updateTaskStatus} 
        deleteTask={deleteTask} 
        clearAllTasks={clearAllTasks}
      />
    </div>
  );
}
