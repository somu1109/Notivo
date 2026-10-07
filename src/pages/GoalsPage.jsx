import { useAppContext } from '../context/AppContext';
import GoalsCard from '../components/GoalsCard';
import GoalsHistory from '../components/GoalsHistory';

export default function GoalsPage() {
  const { goals } = useAppContext();
  const { 
    currentDate,
    morningReminder, 
    setMorningReminder, 
    eveningReminder, 
    setEveningReminder,
    morningTime,
    setMorningTime,
    eveningTime,
    setEveningTime
  } = goals;

  const pastUnfinished = goals.goals.some(g => g.date !== currentDate && !g.done);

  return (
    <div>
      <div className="page-header">
        <h2>Goals</h2>
        <p>Set and achieve your daily targets.</p>
      </div>

      <GoalsCard {...goals} hasPastUnfinished={pastUnfinished} />
      
      <div className="card">
        <div className="card-title">Reminders</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Morning Reminder</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get a push notification to set your goals.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
              {morningReminder && (
                <input 
                  type="time" 
                  value={morningTime} 
                  onChange={e => setMorningTime(e.target.value)}
                  className="input-field"
                  style={{ width: '135px', padding: '6px 10px' }}
                />
              )}
              <label className="toggle-switch">
                <input type="checkbox" checked={morningReminder} onChange={e => setMorningReminder(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="divider" style={{ margin: 0 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Evening Reminder</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get a push notification if you have unfinished goals.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
              {eveningReminder && (
                <input 
                  type="time" 
                  value={eveningTime} 
                  onChange={e => setEveningTime(e.target.value)}
                  className="input-field"
                  style={{ width: '135px', padding: '6px 10px' }}
                />
              )}
              <label className="toggle-switch">
                <input type="checkbox" checked={eveningReminder} onChange={e => setEveningReminder(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <GoalsHistory goals={goals.goals} currentDate={currentDate} />
    </div>
  );
}
