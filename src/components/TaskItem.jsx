import { formatDateTime } from '../utils/time';
import { Trash2 } from 'lucide-react';

export default function TaskItem({ task, updateTaskStatus, deleteTask, onDeleteClick }) {
  const isDone = task.status === 'Done';

  const handleToggle = () => {
    if (isDone) {
      updateTaskStatus(task.id, 'Upcoming');
    } else {
      updateTaskStatus(task.id, 'Done');
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'Done':
        return {
          background: 'var(--color-yellow)',
          color: '#1C1C1E',
          label: 'Done'
        };
      case 'Missed':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#8A8A86',
          label: 'Missed'
        };
      case 'Reminded':
        return {
          background: 'var(--color-yellow-soft)',
          color: '#1C1C1E',
          label: 'Reminded'
        };
      case 'Upcoming':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.12)',
          color: '#D1D1D6',
          label: 'Upcoming'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="item-row" style={{ 
      justifyContent: 'space-between',
      padding: '12px 6px',
      opacity: isDone ? 0.6 : 1,
      transition: 'opacity 0.2s ease, transform 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {/* Custom Circular Checkbox */}
        <input 
          type="checkbox" 
          checked={isDone} 
          onChange={handleToggle}
          className="custom-checkbox"
          aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'done'}`}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: '0.96rem', 
            fontWeight: 400,
            color: 'inherit',
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '0.8rem', color: '#8A8A86' }}>
              {formatDateTime(task.datetime)}
            </span>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 500,
              padding: '2px 8px', 
              borderRadius: 'var(--radius-pill)',
              background: badge.background,
              color: badge.label === 'Missed' ? '#8A8A86' : badge.color
            }}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={() => {
            if (onDeleteClick) {
              onDeleteClick(task);
            } else if (deleteTask) {
              deleteTask(task.id);
            }
          }}
          className="round-btn"
          style={{ width: '32px', height: '32px', border: 'none', background: 'rgba(255, 255, 255, 0.08)', color: '#8A8A86' }}
          title="Delete Task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
