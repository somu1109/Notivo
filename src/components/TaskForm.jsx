import { useState } from 'react';

export default function TaskForm({ addTask }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    if (!date || !time) {
      setError('Please select date and time');
      return;
    }

    const datetime = new Date(`${date}T${time}`);
    if (datetime.getTime() <= Date.now()) {
      setError('Task time must be in the future');
      return;
    }

    addTask(title.trim(), datetime.toISOString());
    setTitle('');
    setDate('');
    setTime('');
  };

  return (
    <div style={{ marginBottom: '0px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {error && <div style={{ color: 'var(--tasks)', fontSize: '0.9rem', background: 'var(--tasks-light)', padding: 'var(--sp-2)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        
        <input 
          type="text" 
          placeholder="What do you need to be reminded of?" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="input-field"
        />
        
        <div className="form-row">
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="input-field"
            style={{ flex: 1, minWidth: '150px' }}
          />
          <input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)} 
            className="input-field"
            style={{ flex: 1, minWidth: '150px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--study)', minWidth: '120px', height: '42px' }}>
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}
