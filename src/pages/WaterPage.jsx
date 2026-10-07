import { useAppContext } from '../context/AppContext';

import { GlassWater, Play, Square } from 'lucide-react';

export default function WaterPage() {
  const { water } = useAppContext();
  const {
    isRunning,
    intervalMs,
    timeLeft,
    glasses,
    startWater,
    stopWater,
    addGlass,
    handleIntervalChange
  } = water;

  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const intervals = [
    { label: '30m', value: 1800000 },
    { label: '45m', value: 2700000 },
    { label: '1h', value: 3600000 },
    { label: '2h', value: 7200000 }
  ];

  const toggleTimer = () => {
    if (isRunning) stopWater();
    else startWater();
  };

  const targetGlasses = 8;
  const glassArray = Array.from({ length: Math.max(targetGlasses, glasses.count) });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--sp-4)' }}>
        <h2>Water</h2>
        <p>Stay hydrated with scheduled reminders.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Hydration Tracker</div>
          <span className={isRunning ? 'badge badge-water' : 'badge'}>
            {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-1)' }}>Next Reminder</div>
          <div className="tabular-nums" style={{ fontSize: '3rem', fontWeight: 800, color: isRunning ? 'var(--water)' : 'var(--text-secondary)', lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reminder Interval</label>
          <div className="segmented-control">
            {intervals.map(int => (
              <button 
                key={int.value}
                onClick={() => handleIntervalChange(int.value)}
                className={`segmented-btn ${intervalMs === int.value ? 'active' : ''}`}
              >
                {int.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <button 
            onClick={toggleTimer} 
            className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`} 
            style={{ flex: 1, height: '44px', background: !isRunning ? 'var(--water)' : undefined, color: !isRunning ? '#fff' : undefined }}
          >
            {isRunning ? <><Square size={18} fill="currentColor" /> Stop Timer</> : <><Play size={18} fill="currentColor" /> Start Timer</>}
          </button>
        </div>

        <div className="divider" style={{ margin: 'var(--sp-3) 0' }}></div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Water</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{glasses.count} / {targetGlasses} glasses</div>
            </div>
            <button onClick={addGlass} className="btn btn-primary" style={{ background: 'var(--water)', height: '40px' }}>
              <GlassWater size={18} /> I drank water
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {glassArray.map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: '32px', height: '40px', 
                  borderRadius: '4px 4px 10px 10px', 
                  border: '2px solid',
                  borderColor: i < glasses.count ? 'var(--water)' : 'var(--border-color)',
                  background: i < glasses.count ? 'var(--water-light)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
              >
                {i < glasses.count && <div style={{ width: '100%', height: '80%', background: 'var(--water)', borderRadius: '2px 2px 6px 6px', alignSelf: 'flex-end', opacity: 0.8 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
