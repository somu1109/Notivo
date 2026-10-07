import { formatDateTime } from '../utils/time';
import { CheckCircle2, Trash2 } from 'lucide-react';

export default function TaskItem({ task, updateTaskStatus, deleteTask }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Upcoming': return 'badge badge-tasks-upcoming';
      case 'Reminded': return 'badge badge-break';
      case 'Missed': return 'badge badge-tasks-missed';
      case 'Done': return 'badge badge-tasks-done';
      default: return 'badge';
    }
  };

  const isDone = task.status === 'Done';

  return (
    <div className="item-row" style={{ 
      borderBottom: '1px solid var(--border-color)', 
      borderRadius: 0,
      opacity: isDone ? 0.6 : 1
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: isDone ? 'var(--text-secondary)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
          {task.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {formatDateTime(task.datetime)}
          </span>
          <span className={getBadgeClass(task.status)}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="actions">
        {!isDone && (
          <button 
            onClick={() => updateTaskStatus(task.id, 'Done')}
            className="icon-btn"
            title="Mark Done"
            style={{ color: 'var(--study)' }}
          >
            <CheckCircle2 size={18} />
          </button>
        )}
        <button 
          onClick={() => deleteTask(task.id)}
          className="icon-btn"
          title="Delete"
          style={{ color: 'var(--tasks)' }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
