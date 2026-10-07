import { useState } from 'react';
import { Edit2, Trash2, Plus, Target } from 'lucide-react';

export default function GoalsCard({ 
  todayGoals, 
  addGoal, 
  toggleGoal, 
  editGoal, 
  deleteGoal,
  bringBackUnfinished,
  hasPastUnfinished
}) {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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
    <div className="card">
      <div className="card-title">
        <Target size={20} color="var(--goals)" />
        Today's Goals
      </div>

      <form onSubmit={handleAdd} className="form-row" style={{ marginBottom: 'var(--sp-5)' }}>
        <input 
          type="text" 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          placeholder="What do you want to accomplish today?" 
          className="input-field"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ background: 'var(--goals)' }}>
          <Plus size={18} /> Add
        </button>
      </form>

      {totalCount > 0 && (
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--text-secondary)' }}>
            <span>{doneCount} of {totalCount} done</span>
            <span style={{ color: allDone ? 'var(--study)' : 'var(--goals)' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--goals)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}></div>
          </div>
          {allDone && <div style={{ color: 'var(--study)', marginTop: 'var(--sp-2)', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>All goals completed today 🎉</div>}
        </div>
      )}

      {totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-secondary)' }}>
          Write your first goal for today!
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todayGoals.map(goal => (
          <li key={goal.id} className="item-row" style={{ borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}>
            <input 
              type="checkbox" 
              checked={goal.done} 
              onChange={() => toggleGoal(goal.id)}
              className="custom-checkbox"
            />
            
            {editingId === goal.id ? (
              <div style={{ flex: 1, display: 'flex', gap: 'var(--sp-2)' }}>
                <input 
                  type="text" 
                  value={editText} 
                  onChange={e => setEditText(e.target.value)} 
                  className="input-field"
                  style={{ padding: '6px 10px' }}
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(goal.id)} className="btn btn-primary" style={{ background: 'var(--goals)' }}>Save</button>
                <button onClick={() => setEditingId(null)} className="btn btn-secondary">Cancel</button>
              </div>
            ) : (
              <span style={{ 
                flex: 1, 
                textDecoration: goal.done ? 'line-through' : 'none', 
                color: goal.done ? 'var(--text-secondary)' : 'var(--text-main)',
                wordBreak: 'break-word',
                fontWeight: 500
              }}>
                {goal.text}
              </span>
            )}

            {editingId !== goal.id && (
              <div className="actions">
                <button 
                  className="icon-btn"
                  onClick={() => { setEditingId(goal.id); setEditText(goal.text); }}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="icon-btn"
                  onClick={() => { if(window.confirm('Delete this goal?')) deleteGoal(goal.id); }}
                  title="Delete"
                  style={{ color: 'var(--tasks)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasPastUnfinished && totalCount === 0 && (
        <div style={{ marginTop: 'var(--sp-5)', textAlign: 'center' }}>
          <button onClick={bringBackUnfinished} className="btn btn-secondary">
            Bring back yesterday's unfinished goals
          </button>
        </div>
      )}
    </div>
  );
}
