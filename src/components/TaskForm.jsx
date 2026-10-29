import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaskForm({ addTask }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Goal title cannot be empty');
      return;
    }

    if (!date || !time) {
      setError('Please select date and time');
      return;
    }

    const datetime = new Date(`${date}T${time}`);
    if (datetime.getTime() <= Date.now()) {
      setError('Goal target time must be in the future');
      return;
    }

    addTask(title.trim(), datetime.toISOString());
    setTitle('');
    setDate('');
    setTime('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {error && (
          <div style={{ 
            color: '#1C1C1E', 
            fontSize: '0.82rem', 
            fontWeight: 500,
            background: 'var(--color-yellow-soft)', 
            border: '1px solid var(--color-yellow)',
            padding: '8px 14px', 
            borderRadius: 'var(--radius-input)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            {error}
          </div>
        )}
        
        <input 
          type="text" 
          placeholder="What goal or milestone do you want to schedule?" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="input-field"
          style={{ height: '38px', padding: '0 14px', fontSize: '0.88rem' }}
        />
        
        <div className="form-row" style={{ gap: '10px' }}>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="input-field"
            style={{ flex: 1, minWidth: '140px', height: '38px', padding: '0 12px', fontSize: '0.84rem' }}
          />
          <input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)} 
            className="input-field"
            style={{ flex: 1, minWidth: '140px', height: '38px', padding: '0 12px', fontSize: '0.84rem' }}
          />
          <button 
            type="submit" 
            className="btn btn-black" 
            style={{ 
              minWidth: '120px', 
              height: '38px',
              fontSize: '0.84rem' 
            }}
          >
            <Plus size={15} /> Add Goal
          </button>
        </div>
      </form>
    </div>
  );
}
