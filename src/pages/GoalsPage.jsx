import { useAppContext } from '../context/AppContext';
import GoalsCard from '../components/GoalsCard';
import GoalsHistory from '../components/GoalsHistory';
import { ArrowUpRight, Bell } from 'lucide-react';

export default function GoalsPage() {
  const { goals, user } = useAppContext();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-text-main)' }}>
          Daily Tasks &amp; Habits
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '2px' }}>
          {user?.greeting ? `${user.greeting} • ` : ''}Define your daily tasks and maintain an unbroken productive chain.
        </p>
      </div>

      <GoalsCard {...goals} hasPastUnfinished={pastUnfinished} />
      
      {/* Side-by-side: Automated Reminders & Past Performance */}
      <div className="goals-bottom-grid">
        {/* Reminders Card */}
        <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0, justifyContent: 'space-between' }}>
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
                <Bell size={14} />
              </div>
              <span style={{ fontSize: '1rem' }}>Automated Reminders</span>
            </div>
            <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
              <ArrowUpRight size={13} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="item-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '6px 0' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.86rem' }}>Morning Kickstart</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                  Prompt to organize your daily tasks.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {morningReminder && (
                  <input 
                    type="time" 
                    value={morningTime} 
                    onChange={e => setMorningTime(e.target.value)}
                    className="input-field"
                    style={{ width: '110px', padding: '4px 8px', height: '28px', fontSize: '0.8rem' }}
                  />
                )}
                <label className="toggle-switch">
                  <input type="checkbox" checked={morningReminder} onChange={e => setMorningReminder(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="item-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '6px 0' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.86rem' }}>Evening Reflection</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                  Review unfinished tasks before sleep.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {eveningReminder && (
                  <input 
                    type="time" 
                    value={eveningTime} 
                    onChange={e => setEveningTime(e.target.value)}
                    className="input-field"
                    style={{ width: '110px', padding: '4px 8px', height: '28px', fontSize: '0.8rem' }}
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

        {/* Past Performance Card */}
        <GoalsHistory goals={goals.goals} currentDate={currentDate} />
      </div>
    </div>
  );
}
