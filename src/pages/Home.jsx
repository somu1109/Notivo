import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Droplets, Target, ListChecks, Play, Pause, Square, AlarmClock, ArrowUpRight,
  Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Home() {
  const { study, water, goals, tasks, user } = useAppContext();
  const { 
    trackerState, 
    currentSegments, 
    startSession, 
    startBreak, 
    resumeSession, 
    stopSession,
    studyLengthMs 
  } = study;

  // Study timer display
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

  const formatDuration = (ms) => {
    if (!ms || ms < 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Dial progress (percentage of studyLengthMs or 25 min default)
  const totalTargetMs = studyLengthMs > 0 ? studyLengthMs : 25 * 60 * 1000;
  const ringProgress = Math.min(100, (liveDisplay / totalTargetMs) * 100);

  // Water data (12 glasses default)
  const targetGlasses = 12;
  const glasses = water.glasses.count;

  // Goals data
  const todayStr = goals.currentDate;
  const todayGoals = goals.goals.filter(g => g.date === todayStr);
  const topGoals = todayGoals.slice(0, 2);

  // Tasks data
  const upcomingTasks = (tasks.tasks || [])
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  const topTasks = upcomingTasks.slice(0, 2);
  const formatTaskTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Live Digital Clock State & Helpers
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const rawHours = now.getHours();
  const clockHours = (rawHours % 12 || 12).toString().padStart(2, '0');
  const clockMinutes = now.getMinutes().toString().padStart(2, '0');
  const clockSeconds = now.getSeconds().toString().padStart(2, '0');
  const clockAmPm = rawHours >= 12 ? 'PM' : 'AM';
  const clockDayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const clockFullDate = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  
  const getWeekNumber = (d) => {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  const weekNumber = getWeekNumber(now);
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone?.replace('_', ' ') || 'Local Time';

  // 2. Interactive Calendar State & Calculation
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const calendarMonthName = calendarDate.toLocaleString('default', { month: 'short' });

  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

  // Highlight days with goals or tasks
  const activityDates = new Set();
  (goals.goals || []).forEach(g => {
    try {
      const d = new Date(g.date);
      if (!isNaN(d.getTime())) {
        activityDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    } catch {}
  });
  (tasks.tasks || []).forEach(t => {
    try {
      const d = new Date(t.datetime);
      if (!isNaN(d.getTime())) {
        activityDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    } catch {}
  });

  const calendarDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      hasActivity: false
    });
  }
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const key = `${calendarYear}-${calendarMonth}-${i}`;
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      hasActivity: activityDates.has(key)
    });
  }
  const totalCalendarCells = calendarDays.length > 35 ? 42 : 35;
  const remainingCells = totalCalendarCells - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      hasActivity: false
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
      {/* ═══ Top Greeting ═══ */}
      <div>
        <h1 style={{ 
          fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', 
          fontWeight: 300, 
          letterSpacing: '-0.03em', 
          color: 'var(--color-text-main)',
          lineHeight: 1.15
        }}>
          {user?.greeting || 'Good Morning, Somu'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '2px' }}>
          Here is your daily productivity, focus, and hydration overview.
        </p>
      </div>

      <div className="home-grid">
      
      {/* ── CARD 1: Time Tracker (Compact Crextio Dial) ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div className="card-header-row" style={{ marginBottom: 0 }}>
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
              <AlarmClock size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>Time tracker</span>
          </div>
          <Link to="/study" className="card-arrow-btn">
            <ArrowUpRight size={13} />
          </Link>
        </div>
        
        {/* Compact Dial */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2px 0 4px' }}>
          <div style={{ position: 'relative', width: '132px', height: '132px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* Thin tick mark circle */}
              <circle 
                cx="66" 
                cy="66" 
                r="58" 
                stroke="var(--color-gray-border)" 
                strokeWidth="2" 
                strokeDasharray="2 5" 
                fill="none" 
              />
              
              {/* Base track */}
              <circle 
                cx="66" 
                cy="66" 
                r="49" 
                stroke="rgba(0,0,0,0.06)" 
                strokeWidth="7" 
                fill="none" 
              />
              
              {/* Thick Yellow Progress Arc */}
              {trackerState !== 'Idle' && (
                <circle 
                  cx="66" 
                  cy="66" 
                  r="49" 
                  stroke="var(--color-yellow)" 
                  strokeWidth="7" 
                  fill="none" 
                  strokeDasharray="308" 
                  strokeDashoffset={308 - (308 * ringProgress / 100)} 
                  style={{ transition: 'stroke-dashoffset 1s linear' }} 
                  strokeLinecap="round" 
                />
              )}
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div className="tabular-nums" style={{ 
                fontSize: '1.7rem', 
                fontWeight: 300, 
                color: 'var(--color-text-main)', 
                lineHeight: 1, 
                letterSpacing: '-0.5px' 
              }}>
                {formatDuration(liveDisplay)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 400 }}>
                {trackerState === 'Idle' ? 'Work Time' : trackerState}
              </div>
            </div>
          </div>

          {/* Round 36px Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', height: '36px', justifyContent: 'center' }}>
            {trackerState === 'Idle' ? (
              <button 
                className="round-btn" 
                style={{ width: '36px', height: '36px', background: 'var(--color-ink)', color: '#FFFFFF' }}
                onClick={startSession}
                title="Start Focus"
              >
                <Play size={14} fill="currentColor" />
              </button>
            ) : (
              <>
                <button 
                  className="round-btn" 
                  style={{ width: '36px', height: '36px', background: 'var(--color-ink)', color: '#FFFFFF' }}
                  onClick={() => stopSession()}
                  title="Stop Focus"
                >
                  <Square size={12} fill="currentColor" />
                </button>
                <button 
                  className="round-btn" 
                  style={{ width: '36px', height: '36px', background: 'var(--color-yellow)', color: '#1C1C1E', border: 'none' }}
                  onClick={trackerState === 'Studying' ? startBreak : resumeSession}
                  title={trackerState === 'Studying' ? 'Take Break' : 'Resume Focus'}
                >
                  {trackerState === 'Studying' ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
              </>
            )}

            <button 
              className="round-btn" 
              style={{ width: '36px', height: '36px', background: 'var(--color-neutral-bg)' }}
              onClick={trackerState === 'Studying' ? startBreak : (trackerState === 'Break' ? resumeSession : undefined)}
              title="Quick Break / Alarm"
            >
              <AlarmClock size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Digital Clock & Date ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div className="card-header-row" style={{ marginBottom: 0 }}>
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
              <Clock size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>Clock &amp; Date</span>
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            background: 'var(--color-yellow)',
            color: '#1C1C1E',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            letterSpacing: '0.5px'
          }}>
            LIVE
          </div>
        </div>

        {/* Digital Time Centerpiece */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: 'auto 0',
          padding: '4px 0'
        }}>
          {/* Main Time with Seconds and AM/PM */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="tabular-nums" style={{ 
              fontSize: '2.4rem', 
              fontWeight: 300, 
              color: 'var(--color-text-main)', 
              lineHeight: 1, 
              letterSpacing: '-1px' 
            }}>
              {clockHours}:{clockMinutes}
            </span>
            <span className="tabular-nums" style={{ 
              fontSize: '1.2rem', 
              fontWeight: 300, 
              color: 'var(--color-text-muted)' 
            }}>
              :{clockSeconds}
            </span>
            <span style={{ 
              background: 'var(--color-ink)', 
              color: '#FFFFFF', 
              padding: '2px 7px', 
              borderRadius: 'var(--radius-pill)', 
              fontSize: '0.72rem', 
              fontWeight: 500,
              marginLeft: '4px'
            }}>
              {clockAmPm}
            </span>
          </div>

          {/* Formatted Date Pill */}
          <div style={{ 
            marginTop: '10px', 
            background: 'rgba(255, 255, 255, 0.5)', 
            border: '1px solid var(--color-gray-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 14px',
            fontSize: '0.8rem',
            color: 'var(--color-text-main)',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{clockDayName}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <span>{clockFullDate}</span>
          </div>
        </div>

        {/* Bottom Timezone / Week Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px dashed var(--color-gray-border)',
          fontSize: '0.74rem',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {timeZoneName}
            </span>
          </div>
          <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Week {weekNumber}</span>
        </div>
      </div>

      {/* ── CARD 3: Hydration Tracker ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div className="card-header-row" style={{ marginBottom: 0 }}>
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
              <Droplets size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>Hydration</span>
          </div>
          <Link to="/water" className="card-arrow-btn">
            <ArrowUpRight size={13} />
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', margin: '4px 0 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {glasses}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 300 }}>
              / {targetGlasses}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {water.isRunning ? `Next in ${formatTime(water.timeLeft)}` : 'Reminders stopped'}
          </div>
        </div>

        {/* 12 Rounded Glass Tiles that Fill with Wave Animation */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const filled = i < glasses;
            return (
              <div 
                key={i} 
                style={{ 
                  position: 'relative',
                  width: '18px', 
                  height: '26px', 
                  borderRadius: '3px 3px 7px 7px', 
                  border: '1.2px solid', 
                  borderColor: filled ? 'rgba(255, 216, 77, 0.95)' : 'var(--color-gray-border)', 
                  background: filled ? 'var(--color-yellow-soft)' : 'rgba(255, 255, 255, 0.4)', 
                  boxShadow: filled ? '0 2px 6px rgba(255, 216, 77, 0.35)' : 'none',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }} 
              >
                {filled && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '82%',
                    background: 'linear-gradient(180deg, #FFE873 0%, #FFD84D 45%, #F5C518 100%)',
                    borderRadius: '0 0 6px 6px',
                    overflow: 'hidden'
                  }}>
                    <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="water-wave" style={{ position: 'absolute', top: '-4px', left: 0, width: '200%', height: '7px', fill: '#FFE873' }}>
                      <path d="M 0 6 Q 25 12, 50 6 T 100 6 T 150 6 T 200 6 V 16 H 0 Z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', height: '32px', padding: '0 14px', fontSize: '0.8rem' }} 
          onClick={water.addGlass}
        >
          <Droplets size={13} strokeWidth={1.5} /> I drank water
        </button>
      </div>

      {/* ── CARD 4: Daily Tasks ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div className="card-header-row" style={{ marginBottom: 0 }}>
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
              <ListChecks size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>Daily Tasks</span>
          </div>
          <Link to="/tasks" className="card-arrow-btn">
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {todayGoals.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0', padding: '10px 0' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-neutral-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              marginBottom: '4px'
            }}>
              <ListChecks size={15} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>No tasks scheduled today</div>
            <Link to="/tasks" className="btn btn-secondary" style={{ marginTop: '6px', fontSize: '0.76rem', padding: '3px 12px', height: '26px' }}>
              Add a task
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', margin: '4px 0' }}>
            {topGoals.map((goal) => (
              <div 
                key={goal.id} 
                className="item-row"
                style={{ padding: '5px 0' }}
              >
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={goal.done} 
                  onChange={() => goals.toggleGoal(goal.id)} 
                />
                <span style={{ 
                  flex: 1, 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  textDecoration: goal.done ? 'line-through' : 'none', 
                  color: goal.done ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  fontSize: '0.84rem'
                }}>
                  {goal.text}
                </span>
              </div>
            ))}
            {todayGoals.length > 2 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                +{todayGoals.length - 2} more tasks
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <Link to="/tasks" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.78rem', height: '30px', padding: 0 }}>
            View all tasks
          </Link>
        </div>
      </div>

      {/* ── CARD 5: Calendar Widget ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        {/* Header with Month / Year and Prev / Next Arrows */}
        <div className="card-header-row" style={{ marginBottom: '4px' }}>
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
              <CalendarIcon size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>
              {calendarMonthName} {calendarYear}
            </span>
          </div>

          {/* Month Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              className="round-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{ width: '24px', height: '24px', padding: 0 }}
            >
              <ChevronLeft size={13} />
            </button>
            <button 
              className="round-btn"
              onClick={handleNextMonth}
              title="Next Month"
              style={{ width: '24px', height: '24px', padding: 0 }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* 7-column Weekday Headers (Su Mo Tu We Th Fr Sa) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          textAlign: 'center', 
          fontSize: '0.7rem', 
          color: 'var(--color-text-muted)',
          fontWeight: 500,
          marginBottom: '2px'
        }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ padding: '2px 0' }}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          rowGap: '2px',
          textAlign: 'center',
          fontSize: '0.74rem'
        }}>
          {calendarDays.map((item, idx) => {
            const isToday = item.isCurrentMonth && item.day === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear();
            const hasActivity = item.hasActivity;

            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '20px',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isToday ? 'var(--color-yellow)' : 'transparent',
                  color: isToday ? '#1C1C1E' : (item.isCurrentMonth ? 'var(--color-text-main)' : 'var(--color-text-muted)'),
                  fontWeight: isToday ? 600 : (item.isCurrentMonth ? 400 : 300),
                  opacity: item.isCurrentMonth ? 1 : 0.35,
                  boxShadow: isToday ? '0 2px 6px rgba(255, 216, 77, 0.4)' : 'none',
                  fontSize: '0.72rem',
                  lineHeight: 1
                }}>
                  {item.day}
                </div>
                {hasActivity && !isToday && (
                  <span style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: 'var(--color-yellow)',
                    position: 'absolute',
                    bottom: '0px'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '4px',
          borderTop: '1px dashed var(--color-gray-border)',
          fontSize: '0.74rem',
          color: 'var(--color-text-muted)'
        }}>
          <span>Today: {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <button 
            onClick={() => setCalendarDate(new Date())} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-text-main)', 
              fontSize: '0.74rem', 
              fontWeight: 500, 
              cursor: 'pointer',
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── CARD 6: Upcoming Goals ── */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '14px 18px', 
        margin: 0, 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div className="card-header-row" style={{ marginBottom: 0 }}>
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
              <Target size={14} />
            </div>
            <span style={{ fontSize: '0.98rem' }}>Upcoming Goals</span>
          </div>
          <Link to="/goals" className="card-arrow-btn">
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {upcomingTasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto 0', padding: '10px 0' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-neutral-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              marginBottom: '4px'
            }}>
              <Target size={15} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>No upcoming goals</div>
            <Link to="/goals" className="btn btn-secondary" style={{ marginTop: '6px', fontSize: '0.76rem', padding: '3px 12px', height: '26px' }}>
              Create goal
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', margin: '4px 0' }}>
            {topTasks.map((task) => (
              <div 
                key={task.id} 
                className="item-row"
                style={{ padding: '5px 0' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-main)', fontSize: '0.84rem' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {formatTaskTime(task.datetime)}
                  </div>
                </div>
              </div>
            ))}
            {upcomingTasks.length > 2 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                +{upcomingTasks.length - 2} more goals
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <Link to="/goals" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.78rem', height: '30px', padding: 0 }}>
            Manage goal schedule
          </Link>
        </div>
      </div>

    </div>
  </div>
  );
}
