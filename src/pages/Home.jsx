import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDuration } from '../utils/studyUtils';
import { Link } from 'react-router-dom';
import { Droplets, Target, CheckSquare } from 'lucide-react';

export default function Home() {
  const { study, water, goals, tasks } = useAppContext();
  
  // Timer state
  const { trackerState, currentSegments, startSession, startBreak, resumeSession, stopSession } = study;
  const [liveDisplay, setLiveDisplay] = useState(0);

  useEffect(() => {
    let timer;
    if (trackerState !== 'Idle' && currentSegments.length > 0) {
      timer = setInterval(() => {
        const currentSeg = currentSegments[currentSegments.length - 1];
        setLiveDisplay(Date.now() - currentSeg.start);
      }, 1000);
    } else {
      setLiveDisplay(0);
    }
    return () => clearInterval(timer);
  }, [trackerState, currentSegments]);

  const ringColor = trackerState === 'Studying' ? 'var(--study)' : trackerState === 'Break' ? 'var(--break)' : 'var(--text-secondary)';
  const ringProgress = trackerState === 'Idle' ? 0 : (liveDisplay % 60000) / 60000 * 100;
  
  // Timer card background
  const getTimerBg = () => {
    if (trackerState === 'Studying') return 'var(--study-light)';
    if (trackerState === 'Break') return 'var(--break-light)';
    return 'var(--card-bg)';
  };

  // Water calculations
  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const glasses = water.glasses.count;
  const targetGlasses = 8;
  const glassArray = Array.from({ length: Math.min(6, Math.max(targetGlasses, glasses)) });

  // Goals
  const todayGoals = goals.todayGoals || [];
  const topGoals = todayGoals.slice(0, 3);
  const extraGoals = Math.max(0, todayGoals.length - 3);

  // Tasks
  const upcomingTasks = (tasks.tasks || []).filter(t => t.status === 'Upcoming').sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const topTasks = upcomingTasks.slice(0, 3);
  const extraTasks = Math.max(0, upcomingTasks.length - 3);
  const formatTaskTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="home-grid">
      
      {/* 1. Timer Card */}
      <div className="card" style={{ background: getTimerBg(), display: 'flex', flexDirection: 'column', padding: 'var(--sp-6)', margin: 0, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'auto' }}>Timer</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r="100" stroke={trackerState === 'Idle' ? 'var(--border-color)' : 'var(--bg-color)'} strokeWidth="6" fill="none" />
              {trackerState !== 'Idle' && (
                <circle cx="110" cy="110" r="100" stroke={ringColor} strokeWidth="6" fill="none" strokeDasharray="628" strokeDashoffset={628 - (628 * ringProgress / 100)} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }} strokeLinecap="round" />
              )}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div className="tabular-nums" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                {formatDuration(liveDisplay)}
              </div>
              <div className={`badge ${trackerState === 'Studying' ? 'badge-study' : trackerState === 'Break' ? 'badge-break' : ''}`} style={{ background: trackerState === 'Idle' ? 'var(--bg-color)' : undefined, color: trackerState === 'Idle' ? 'var(--text-secondary)' : undefined }}>
                {trackerState === 'Idle' ? 'Ready' : (trackerState === 'Studying' ? 'Studying' : 'On break')}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--sp-3)', width: '100%', marginTop: 'auto' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: 'var(--study)', opacity: trackerState !== 'Idle' ? 0.5 : 1, cursor: trackerState !== 'Idle' ? 'not-allowed' : 'pointer' }} 
            onClick={trackerState === 'Idle' ? startSession : undefined}
          >
            Start
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: 'var(--tasks)', opacity: trackerState === 'Idle' ? 0.5 : 1, cursor: trackerState === 'Idle' ? 'not-allowed' : 'pointer' }} 
            onClick={trackerState !== 'Idle' ? () => stopSession() : undefined}
          >
            Stop
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: trackerState === 'Studying' ? 'var(--break)' : 'var(--study)', opacity: trackerState === 'Idle' ? 0.5 : 1, cursor: trackerState === 'Idle' ? 'not-allowed' : 'pointer' }} 
            onClick={trackerState === 'Studying' ? startBreak : (trackerState === 'Break' ? resumeSession : undefined)}
          >
            {trackerState === 'Break' ? 'Resume' : 'Break'}
          </button>
        </div>
      </div>

      {/* 2. Water Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-6)', margin: 0, borderRadius: 'var(--radius-lg)' }}>
        <Link to="/water" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'auto' }}>Water</Link>
        
        <div style={{ textAlign: 'center', margin: 'var(--sp-6) 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
            <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--water)', lineHeight: 1 }}>{glasses}</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ {targetGlasses}</span>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 'var(--sp-2)' }}>
            {water.isRunning ? `Next in ${formatTime(water.timeLeft)}` : 'Reminders stopped'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: 'var(--sp-6)' }}>
          {glassArray.map((_, i) => (
            <div key={i} style={{ width: '16px', height: '24px', borderRadius: '2px 2px 6px 6px', border: '1px solid', borderColor: i < glasses ? 'var(--water)' : 'var(--border-color)', background: i < glasses ? 'var(--water)' : 'transparent', opacity: i < glasses ? 0.8 : 1 }} />
          ))}
          {glasses > glassArray.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'flex-end', marginLeft: '4px' }}>+</div>}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', background: 'var(--water-light)', color: 'var(--water)' }} onClick={water.addGlass}>
          <Droplets size={18} /> I drank water
        </button>
      </div>

      {/* 3. Goals Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-6)', margin: 0, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Goals</div>
          <Link to="/goals" style={{ fontSize: '0.9rem', color: 'var(--goals)', fontWeight: 600 }}>View all</Link>
        </div>

        {todayGoals.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <Target size={32} style={{ marginBottom: 'var(--sp-2)', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem' }}>No goals yet.</div>
            <Link to="/goals" style={{ fontSize: '0.9rem', color: 'var(--goals)', fontWeight: 600, marginTop: 'var(--sp-1)' }}>Add your first goal</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {topGoals.map((goal, i) => (
              <div key={goal.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', width: '16px' }}>{i + 1}.</span>
                <input type="checkbox" className="custom-checkbox" checked={goal.done} onChange={() => goals.toggleGoal(goal.id)} style={{ width: '18px', height: '18px', marginTop: '2px' }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: goal.done ? 'line-through' : 'none', color: goal.done ? 'var(--text-secondary)' : 'var(--text-main)' }}>
                  {goal.text}
                </span>
              </div>
            ))}
            {extraGoals > 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 'var(--sp-6)' }}>+{extraGoals} more</div>}
          </div>
        )}
      </div>

      {/* 4. Tasks Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-6)', margin: 0, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tasks</div>
          <Link to="/tasks" style={{ fontSize: '0.9rem', color: 'var(--tasks)', fontWeight: 600 }}>View all</Link>
        </div>

        {upcomingTasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <CheckSquare size={32} style={{ marginBottom: 'var(--sp-2)', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem' }}>No upcoming tasks.</div>
            <Link to="/tasks" style={{ fontSize: '0.9rem', color: 'var(--tasks)', fontWeight: 600, marginTop: 'var(--sp-1)' }}>Schedule one</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {topTasks.map((task, i) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', width: '16px' }}>{i + 1}.</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)', fontWeight: 500 }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--tasks)' }}>
                    {formatTaskTime(task.datetime)}
                  </div>
                </div>
              </div>
            ))}
            {extraTasks > 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 'var(--sp-6)' }}>+{extraTasks} more</div>}
          </div>
        )}
      </div>

    </div>
  );
}
