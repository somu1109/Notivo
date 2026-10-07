import { useState } from 'react';
import { calculateSessionTotals, formatDuration } from '../utils/studyUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CustomSelect from './CustomSelect';

export default function StudySummary({ sessions, currentSegments }) {
  const [dailyGoalHours, setDailyGoalHours] = useLocalStorage('study_daily_goal', 6);
  const [forceCustom, setForceCustom] = useState(false);

  // Filter today's sessions
  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter(s => s.date === todayStr);

  let totalStudy = 0;
  let totalBreak = 0;

  // Add saved sessions
  todaySessions.forEach(s => {
    const { study, breakTime } = calculateSessionTotals(s.segments);
    totalStudy += study;
    totalBreak += breakTime;
  });

  // Include current active segments if any
  if (currentSegments && currentSegments.length > 0 && new Date(currentSegments[0].start).toDateString() === todayStr) {
    const { study, breakTime } = calculateSessionTotals(currentSegments);
    totalStudy += study;
    totalBreak += breakTime;
  }

  const goalMs = dailyGoalHours * 3600000;
  const progressPercent = goalMs > 0 ? Math.min(100, (totalStudy / goalMs) * 100) : 0;

  const goalOptions = [1, 2, 4, 6, 8, 10];
  const isCustomGoal = forceCustom || !goalOptions.includes(dailyGoalHours);

  return (
    <div className="card">
      <div className="card-title">
        Today's Summary
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
        <div style={{ background: 'var(--study-light)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--study)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Study Time</div>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--study)', marginTop: 'var(--sp-1)' }}>
            {formatDuration(totalStudy)}
          </div>
        </div>
        
        <div style={{ background: 'var(--break-light)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--break)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Break Time</div>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--break)', marginTop: 'var(--sp-1)' }}>
            {formatDuration(totalBreak)}
          </div>
        </div>
        
        <div style={{ background: 'var(--bg-color)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions</div>
          <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 'var(--sp-1)' }}>
            {todaySessions.length + (currentSegments.length > 0 ? 1 : 0)}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-color)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Daily Goal</span>
            <CustomSelect 
              value={isCustomGoal ? 'custom' : dailyGoalHours} 
              onChange={val => {
                if (val === 'custom') {
                  setForceCustom(true);
                } else {
                  setForceCustom(false);
                  setDailyGoalHours(Number(val));
                }
              }}
              options={[
                { value: 1, label: '1 Hour' },
                { value: 2, label: '2 Hours' },
                { value: 4, label: '4 Hours' },
                { value: 6, label: '6 Hours' },
                { value: 8, label: '8 Hours' },
                { value: 10, label: '10 Hours' },
                { value: 'custom', label: 'Custom...' }
              ]}
              style={{ width: '120px' }}
            />
            {isCustomGoal && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <input 
                  type="number"
                  min="0.1"
                  step="0.5"
                  className="input-field"
                  value={dailyGoalHours || ''}
                  onChange={e => setDailyGoalHours(Number(e.target.value))}
                  style={{ width: '80px', padding: '6px 10px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>hours</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: progressPercent >= 100 ? 'var(--study)' : 'var(--text-main)' }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--study)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}></div>
        </div>
      </div>
    </div>
  );
}
