import { useState } from 'react';
import { calculateSessionTotals, formatDuration } from '../utils/studyUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CustomSelect from './CustomSelect';
import { ArrowUpRight, BookOpen } from 'lucide-react';

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
    <div className="card" style={{ padding: '14px 18px', margin: 0, position: 'relative', zIndex: 30 }}>
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
            <BookOpen size={14} />
          </div>
          <span style={{ fontSize: '1rem' }}>Today's Summary</span>
        </div>
        <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
          <ArrowUpRight size={13} />
        </div>
      </div>
      
      {/* 3 Reference-Style Cards: Yellow Tint, White, and Black */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        
        {/* 1. Study Time (Yellow Tint #FFF8DE) */}
        <div style={{ 
          background: 'var(--color-yellow-tint)', 
          border: '1px solid var(--color-yellow-soft)',
          padding: '10px 16px', 
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
            Study Time
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
            {formatDuration(totalStudy)}
          </div>
        </div>
        
        {/* 2. Break Time */}
        <div style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid var(--color-gray-border)',
          padding: '10px 16px', 
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
            Break Time
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
            {formatDuration(totalBreak)}
          </div>
        </div>
        
        {/* 3. Sessions (Black Card #1C1C1E with White Text) */}
        <div style={{ 
          background: '#1C1C1E', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 16px', 
          borderRadius: '18px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.55)', fontWeight: 400 }}>
            Sessions
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 300, color: '#FFFFFF', lineHeight: 1 }}>
            {todaySessions.length + (currentSegments.length > 0 ? 1 : 0)}
          </div>
        </div>
      </div>

      {/* Pill-shaped Daily Goal Progress Track with Yellow Fill */}
      <div style={{ 
        background: 'var(--glass-subtle-bg, rgba(255, 255, 255, 0.45))', 
        padding: '10px 14px', 
        borderRadius: '16px', 
        border: '1px solid var(--color-gray-border)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-main)' }}>Daily Target:</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="number"
                  min="0.1"
                  step="0.5"
                  className="input-field"
                  value={dailyGoalHours || ''}
                  onChange={e => setDailyGoalHours(Number(e.target.value))}
                  style={{ width: '70px', padding: '4px 10px', height: '30px' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>hours</span>
              </div>
            )}
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
            {Math.round(progressPercent)}% Achieved
          </span>
        </div>

        {/* Yellow Fill Pill Track */}
        <div style={{ 
          height: '7px', 
          background: 'var(--color-neutral-bg)', 
          borderRadius: 'var(--radius-pill)', 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            height: '100%', 
            background: 'var(--color-yellow)', 
            width: `${progressPercent}%`, 
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
          }} />
        </div>
      </div>
    </div>
  );
}
