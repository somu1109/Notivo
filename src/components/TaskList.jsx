import { useState } from 'react';
import TaskItem from './TaskItem';
import { Target, ArrowUpRight, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function TaskList({ tasks, updateTaskStatus, deleteTask, clearAllTasks }) {
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  if (tasks.length === 0) {
    return (
      <div className="card card-dark" style={{ textAlign: 'center', padding: '22px 16px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-yellow)',
          margin: '0 auto 8px'
        }}>
          <Target size={18} />
        </div>
        <div style={{ fontWeight: 400, color: '#FFFFFF', fontSize: '1rem', letterSpacing: '-0.01em' }}>
          No Goals Scheduled
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8A8A86', marginTop: '3px', maxWidth: '300px', margin: '3px auto 0' }}>
          Schedule a time-based goal or milestone above to keep your future vision on track.
        </div>
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

  const totalDone = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="card card-dark" style={{ padding: '14px 18px' }}>
      <div className="card-header-row" style={{ marginBottom: '10px' }}>
        <div className="card-title">
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-yellow)'
          }}>
            <Target size={14} />
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '1rem' }}>Schedule &amp; Goals</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsClearAllModalOpen(true)}
            className="btn btn-secondary"
            style={{ 
              padding: '4px 10px', 
              height: '26px', 
              fontSize: '0.74rem', 
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#D1D1D6'
            }}
            title="Clear all goals"
          >
            <Trash2 size={11} />
            <span>Clear All</span>
          </button>

          <span style={{ 
            fontSize: '0.78rem', 
            fontWeight: 500,
            background: 'rgba(255, 255, 255, 0.1)', 
            color: '#FFFFFF',
            padding: '3px 10px', 
            borderRadius: 'var(--radius-pill)'
          }}>
            <span style={{ color: 'var(--color-yellow)' }}>{totalDone}</span> / {tasks.length}
          </span>
          <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
      
      {['Missed', 'Today', 'Upcoming', 'Done'].map(group => {
        if (grouped[group].length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: '10px' }}>
            <div style={{ 
              color: group === 'Done' ? 'var(--color-yellow)' : '#8A8A86', 
              marginBottom: '4px', 
              fontSize: '0.72rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{group}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>({grouped[group].length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {grouped[group].map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  updateTaskStatus={updateTaskStatus} 
                  deleteTask={deleteTask}
                  onDeleteClick={(t) => setTaskToDelete(t)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Confirmation Modal for Single Goal Delete */}
      <ConfirmModal 
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="Delete Goal?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      {/* Confirmation Modal for Clearing All Goals */}
      <ConfirmModal 
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          if (clearAllTasks) {
            clearAllTasks();
          }
          setIsClearAllModalOpen(false);
        }}
        title="Clear All Goals?"
        message="Are you sure you want to clear all scheduled goals? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}
