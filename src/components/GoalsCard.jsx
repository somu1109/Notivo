import { useState } from 'react';
import { Edit2, Trash2, Plus, ListChecks, ArrowUpRight } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function GoalsCard({ 
  todayGoals, 
  addGoal, 
  toggleGoal, 
  editGoal, 
  deleteGoal,
  clearTodayGoals,
  bringBackUnfinished,
  hasPastUnfinished
}) {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      addGoal(inputText);
      setInputText('');
    }
  };

  const handleSaveEdit = (id) => {
    editGoal(id, editText);
    setEditingId(null);
  };

  const doneCount = todayGoals.filter(g => g.done).length;
  const totalCount = todayGoals.length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && doneCount === totalCount;

  return (
    <div className="card" style={{ padding: '14px 18px' }}>
      <div className="card-header-row" style={{ marginBottom: '8px' }}>
        <span className="card-title" style={{ fontSize: '1rem' }}>Today's Tasks</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {totalCount > 0 && (
            <button
              type="button"
              onClick={() => setIsClearAllModalOpen(true)}
              className="btn btn-secondary"
              style={{ 
                padding: '4px 12px', 
                height: '28px', 
                fontSize: '0.76rem', 
                gap: '5px',
                color: 'var(--color-text-muted)' 
              }}
              title="Clear all tasks for today"
            >
              <Trash2 size={12} />
              <span>Clear All Tasks</span>
            </button>
          )}

          <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>

      {/* Rounded Input with Black Pill "Add" Button */}
      <form onSubmit={handleAdd} className="form-row" style={{ marginBottom: '12px' }}>
        <input 
          type="text" 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          placeholder="What task do you plan to achieve today?" 
          className="input-field"
          style={{ flex: 1, minWidth: '200px', padding: '8px 16px', height: '38px', fontSize: '0.88rem' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ padding: '0 18px', height: '38px', fontSize: '0.84rem' }}
        >
          <Plus size={15} strokeWidth={1.5} /> Add Task
        </button>
      </form>

      {totalCount > 0 && (
        <div style={{ 
          marginBottom: '12px', 
          background: 'rgba(255, 255, 255, 0.45)', 
          padding: '8px 14px', 
          borderRadius: '14px', 
          border: '1px solid var(--color-gray-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-main)' }}>
            <span>{doneCount} of {totalCount} completed</span>
            <span style={{ fontWeight: 600 }}>{Math.round(progressPercent)}%</span>
          </div>
          
          {/* Yellow Progress Pill Track */}
          <div style={{ 
            height: '6px', 
            background: 'rgba(0, 0, 0, 0.08)', 
            borderRadius: 'var(--radius-pill)', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              height: '100%', 
              background: 'var(--color-yellow)', 
              width: `${progressPercent}%`, 
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.3s ease' 
            }} />
          </div>
          
          {allDone && (
            <div style={{ marginTop: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-main)', textAlign: 'center' }}>
              All tasks completed for today!
            </div>
          )}
        </div>
      )}

      {totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--color-text-muted)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--color-neutral-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            margin: '0 auto 8px'
          }}>
            <ListChecks size={18} strokeWidth={1.5} />
          </div>
          <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.88rem' }}>No tasks set for today</div>
          <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>Type a task above to start your daily chain.</div>
        </div>
      )}

      {/* Accordion-Style List with Dotted Dividers */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {todayGoals.map(goal => (
          <div 
            key={goal.id} 
            className="item-row" 
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <input 
                type="checkbox" 
                checked={goal.done} 
                onChange={() => toggleGoal(goal.id)}
                className="custom-checkbox"
              />
              
              {editingId === goal.id ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)} 
                    className="input-field"
                    style={{ padding: '6px 14px' }}
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(goal.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <span style={{ 
                  flex: 1, 
                  textDecoration: goal.done ? 'line-through' : 'none', 
                  color: goal.done ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  wordBreak: 'break-word',
                  fontWeight: 400,
                  fontSize: '0.92rem'
                }}>
                  {goal.text}
                </span>
              )}
            </div>

            {editingId !== goal.id && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="round-btn"
                  onClick={() => { setEditingId(goal.id); setEditText(goal.text); }}
                  title="Edit Task"
                  style={{ width: '30px', height: '30px', padding: 0 }}
                >
                  <Edit2 size={13} color="var(--color-text-muted)" />
                </button>
                <button 
                  className="round-btn"
                  onClick={() => setGoalToDelete(goal)}
                  title="Delete Task"
                  style={{ width: '30px', height: '30px', padding: 0 }}
                >
                  <Trash2 size={13} color="var(--color-text-muted)" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasPastUnfinished && totalCount === 0 && (
        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <button onClick={bringBackUnfinished} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Bring back yesterday's unfinished tasks
          </button>
        </div>
      )}

      {/* Confirmation Modal for Single Task Delete */}
      <ConfirmModal 
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        title="Delete Task?"
        message={`Are you sure you want to delete "${goalToDelete?.text}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      {/* Confirmation Modal for Clear All Tasks */}
      <ConfirmModal 
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          if (clearTodayGoals) {
            clearTodayGoals();
          }
          setIsClearAllModalOpen(false);
        }}
        title="Clear All Tasks?"
        message="Are you sure you want to clear all tasks for today? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}
