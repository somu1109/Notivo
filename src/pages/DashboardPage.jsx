import React, { useState, useMemo, Component } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  ArrowUpRight, Download, Trash2, Clock, Droplets, CheckSquare, Target 
} from 'lucide-react';
import { calculateSessionTotals } from '../utils/studyUtils';
import { exportNotivoBackupPDF } from '../utils/pdfExport';
import ConfirmModal from '../components/ConfirmModal';

/* ── Error Boundary ── */
class DashboardErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('Dashboard crashed:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ fontWeight: 400 }}>Dashboard encountered an issue</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Please refresh the view.</p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="btn btn-primary" 
            style={{ marginTop: '16px' }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Custom Recharts Tooltip in Crextio Style ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isWater = payload[0].dataKey === 'Water';
    const itemData = payload[0].payload || {};
    return (
      <div style={{ 
        background: '#1C1C1E', 
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        padding: '6px 14px', 
        borderRadius: '9999px', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        fontSize: '0.82rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap'
      }}>
        <span>{itemData.formattedDate || itemData.name || label}:</span>
        <span style={{ color: '#FFD84D' }}>
          {payload[0].value} {isWater ? 'glasses' : 'hrs'}
        </span>
      </div>
    );
  }
  return null;
};

const AxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={14} textAnchor="middle" fill="var(--color-text-muted)" fontSize={12} fontWeight={500}>
      {payload.value}
    </text>
  </g>
);

function DashboardPageInner() {
  const { study, water, goals, tasks, user } = useAppContext();
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  /* ── KPI calculations ── */
  const kpiData = useMemo(() => {
    const studyDataRaw = study.sessions || [];
    const waterDataRaw = water.glassesHistory || {};
    const goalsDataRaw = goals.goals || [];
    const tasksDataRaw = tasks.tasks || [];

    let totalStudy = 0, totalBreak = 0;
    studyDataRaw.forEach(s => {
      const { study: st, breakTime: bt } = calculateSessionTotals(s.segments);
      totalStudy += st; totalBreak += bt;
    });
    const avgMs = studyDataRaw.length > 0 ? totalStudy / studyDataRaw.length : 0;
    const avgMins = Math.floor(avgMs / 60000);
    const avgHours = Math.floor(avgMins / 60);

    let totalWater = 0;
    const wk = Object.keys(waterDataRaw);
    wk.forEach(k => totalWater += waterDataRaw[k]);
    const avgWater = wk.length > 0 ? (totalWater / wk.length).toFixed(1) : '0';

    let completedGoals = 0;
    goalsDataRaw.forEach(g => { if (g.done) completedGoals++; });
    const goalsPercent = goalsDataRaw.length > 0 ? Math.round((completedGoals / goalsDataRaw.length) * 100) : 0;

    let completedTasks = 0;
    tasksDataRaw.forEach(t => { if (t.status === 'Done') completedTasks++; });

    return {
      studyText: `${avgHours}h ${avgMins % 60}m`,
      studyHoursOnly: (totalStudy / 3600000).toFixed(1),
      waterText: avgWater,
      goalsPercent,
      tasksDone: completedTasks,
      totalTasks: tasksDataRaw.length,
    };
  }, [study.sessions, water.glassesHistory, goals.goals, tasks.tasks]);

  /* ── Weekly chart data (Starting Monday → Sunday) ── */
  const weeklyData = useMemo(() => {
    const studyDataRaw = study.sessions || [];
    const waterDataRaw = water.glassesHistory || {};
    const tasksDataRaw = tasks.tasks || [];

    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const daysSinceMon = dow === 0 ? 6 : dow - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMon);

    const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      data.push({
        dateString: d.toDateString(),
        dayLetter: dayLetters[i],
        name: dayNames[i],
        formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        Study: 0, Break: 0, Water: 0, Tasks: 0, Goals: kpiData.goalsPercent,
      });
    }

    studyDataRaw.forEach(s => {
      const day = data.find(d => d.dateString === new Date(s.date).toDateString());
      if (day) {
        const { study: st, breakTime: bt } = calculateSessionTotals(s.segments);
        day.Study += st / 3600000;
        day.Break += bt / 3600000;
      }
    });

    Object.keys(waterDataRaw).forEach(dateKey => {
      const day = data.find(d => d.dateString === new Date(dateKey).toDateString());
      if (day) day.Water += waterDataRaw[dateKey];
    });

    tasksDataRaw.forEach(t => {
      if (t.status === 'Done' && t.datetime) {
        const day = data.find(d => d.dateString === new Date(t.datetime).toDateString());
        if (day) day.Tasks += 1;
      }
    });

    data.forEach(d => {
      d.Study = parseFloat(d.Study.toFixed(2));
      d.Break = parseFloat(d.Break.toFixed(2));
    });
    return data;
  }, [study.sessions, water.glassesHistory, tasks.tasks, kpiData.goalsPercent]);

  const maxStudy = useMemo(() => Math.max(0.1, ...weeklyData.map(d => d.Study)), [weeklyData]);

  /* ── Export PDF Backup with Notivo Template ── */
  const handleExportBackup = async () => {
    try {
      await exportNotivoBackupPDF({ 
        study, 
        water, 
        goals, 
        tasks, 
        kpiData, 
        userName: user?.userName || 'Somu' 
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not generate PDF backup. Please try again.');
    }
  };

  /* ── Clear All Data safely with ConfirmModal ── */
  const handleConfirmClearData = () => {
    localStorage.removeItem('study_sessions');
    localStorage.removeItem('study_state');
    localStorage.removeItem('study_current_segments');
    localStorage.removeItem('study_notified');
    localStorage.removeItem('study_daily_goal');
    localStorage.removeItem('study_length_ms');
    localStorage.removeItem('break_length_ms');
    localStorage.removeItem('water_glasses');
    localStorage.removeItem('water_glasses_history');
    localStorage.removeItem('water_isRunning');
    localStorage.removeItem('water_is_running');
    localStorage.removeItem('water_intervalMs');
    localStorage.removeItem('water_nextReminder');
    localStorage.removeItem('goals_list');
    localStorage.removeItem('daily_goals');
    localStorage.removeItem('reminder_tasks');
    localStorage.removeItem('goals_notified_morning');
    localStorage.removeItem('goals_notified_evening');
    window.location.reload();
  };

  const allTasks = tasks.tasks || [];
  const topTasks = allTasks.slice(0, 4);

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
          {user?.greeting || 'Welcome in, Notivo'}
        </h1>
      </div>

      {/* ═══ Reference Segmented Pill Metric Bar & Big Numbers ═══ */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        gap: '16px', 
        flexWrap: 'wrap' 
      }}>
        {/* Left: 4 Metric Pill Bars matching Crextio */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="metric-pill-bar">
            <span className="metric-pill-label" style={{ fontSize: '0.72rem' }}>Focus Rate</span>
            <div className="pill-bar pill-bar-black" style={{ minWidth: '78px', height: '30px', fontSize: '0.78rem', padding: '0 12px' }}>
              {kpiData.studyText}
            </div>
          </div>

          <div className="metric-pill-bar">
            <span className="metric-pill-label" style={{ fontSize: '0.72rem' }}>Tasks Done</span>
            <div className="pill-bar pill-bar-yellow" style={{ minWidth: '68px', height: '30px', fontSize: '0.78rem', padding: '0 12px' }}>
              {kpiData.goalsPercent}%
            </div>
          </div>

          <div className="metric-pill-bar">
            <span className="metric-pill-label" style={{ fontSize: '0.72rem' }}>Hydration</span>
            <div className="pill-bar pill-bar-hatched" style={{ minWidth: '78px', height: '30px', fontSize: '0.78rem', padding: '0 12px' }}>
              {Math.min(100, Math.round((parseFloat(kpiData.waterText) / 12) * 100))}%
            </div>
          </div>

          <div className="metric-pill-bar">
            <span className="metric-pill-label" style={{ fontSize: '0.72rem' }}>Goal Queue</span>
            <div className="pill-bar pill-bar-outline" style={{ minWidth: '72px', height: '30px', fontSize: '0.78rem', padding: '0 12px' }}>
              {kpiData.tasksDone}/{kpiData.totalTasks}
            </div>
          </div>
        </div>

        {/* Right: 3 Large Light Stats matching Crextio */}
        <div style={{ display: 'flex', gap: '22px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} strokeWidth={1.5} color="var(--color-text-muted)" />
              <span style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
                {kpiData.studyHoursOnly}h
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 400 }}>
              Study Time
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Droplets size={14} strokeWidth={1.5} color="var(--color-text-muted)" />
              <span style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
                {kpiData.waterText}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 400 }}>
              Water Avg
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckSquare size={14} strokeWidth={1.5} color="var(--color-text-muted)" />
              <span style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
                {kpiData.tasksDone}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 400 }}>
              Goals Met
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Main Card Grid (Crextio Layout) ═══ */}
      <div className="dashboard-cards-grid">

        {/* 1. Progress Card (Study Time by Day with Thin Vertical Pill Bars) */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '14px 18px' }}>
          <div className="card-header-row" style={{ marginBottom: '4px' }}>
            <span className="card-title" style={{ fontSize: '1rem' }}>Progress</span>
            <Link to="/study" className="card-arrow-btn" style={{ width: '26px', height: '26px' }} title="Go to Study">
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {kpiData.studyHoursOnly} h
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              Focus time this week
            </span>
          </div>

          {/* Vertical Pill Bar Chart */}
          <div style={{ height: 105, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="transparent" />
                <XAxis dataKey="dayLetter" tick={<AxisTick />} tickLine={false} axisLine={false} interval={0} />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="Study" radius={[9999, 9999, 9999, 9999]} barSize={8}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`study-bar-${index}`} 
                      fill={entry.Study > 0 && entry.Study === maxStudy ? 'var(--color-yellow)' : (entry.Study > 0 ? 'var(--chart-bar-default)' : 'var(--color-gray-light)')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Hydration / Water Intake Card */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '14px 18px' }}>
          <div className="card-header-row" style={{ marginBottom: '4px' }}>
            <span className="card-title" style={{ fontSize: '1rem' }}>Water Intake</span>
            <Link to="/water" className="card-arrow-btn" style={{ width: '26px', height: '26px' }} title="Go to Water">
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {kpiData.waterText} gl
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              Daily intake average
            </span>
          </div>

          <div style={{ height: 105 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="transparent" />
                <XAxis dataKey="dayLetter" tick={<AxisTick />} tickLine={false} axisLine={false} interval={0} />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="Water" radius={[9999, 9999, 9999, 9999]} barSize={8}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`water-bar-${index}`} 
                      fill={entry.Water >= 12 ? 'var(--color-yellow)' : (entry.Water > 0 ? 'var(--chart-bar-default)' : 'var(--color-gray-light)')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Dark Goals Card (Priority Goals) */}
        <div className="card card-dark" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', padding: '14px 18px' }}>
          <div className="card-header-row" style={{ marginBottom: '4px' }}>
            <span className="card-title" style={{ fontSize: '1rem' }}>Priority Goals</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 300, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--color-yellow)' }}>{kpiData.tasksDone}</span> / {kpiData.totalTasks}
              </div>
              <Link to="/goals" className="card-arrow-btn" style={{ width: '26px', height: '26px' }} title="Go to Goals">
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginTop: '4px' }}>
            {topTasks.length === 0 ? (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.82rem', margin: 'auto 0', textAlign: 'center', padding: '14px 0' }}>
                No pending goals scheduled.
              </div>
            ) : (
              topTasks.map(t => {
                const isDone = t.status === 'Done';
                return (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px dotted rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDone ? 'var(--color-yellow)' : '#FFFFFF'
                      }}>
                        <Target size={12} />
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.84rem', 
                          fontWeight: 400, 
                          color: isDone ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                          {t.datetime ? new Date(t.datetime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                        </div>
                      </div>
                    </div>

                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={isDone} 
                      onChange={() => tasks.updateTaskStatus(t.id, isDone ? 'Upcoming' : 'Done')}
                      title="Toggle goal"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ═══ Lower Grid: Tasks, Weekly Sync Timeline, Data Management ═══ */}
      <div className="dashboard-bottom-grid">

        {/* Daily Habits Card */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '14px 18px' }}>
          <div className="card-header-row" style={{ marginBottom: '4px' }}>
            <span className="card-title" style={{ fontSize: '1rem' }}>Daily Habits</span>
            <Link to="/tasks" className="card-arrow-btn" style={{ width: '26px', height: '26px' }} title="Go to Tasks">
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="item-row" style={{ justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 400 }}>Deep Focus Session</span>
              <span style={{ 
                fontSize: '0.72rem', 
                background: 'var(--color-yellow-soft)', 
                color: '#1C1C1E', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-pill)',
                fontWeight: 500
              }}>
                Active
              </span>
            </div>

            <div className="item-row" style={{ justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 400 }}>Water Reminder</span>
              <span style={{ 
                fontSize: '0.72rem', 
                background: water.isRunning ? 'var(--color-yellow)' : 'var(--color-neutral-bg)', 
                color: water.isRunning ? '#1C1C1E' : 'var(--color-text-muted)', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-pill)',
                fontWeight: 500
              }}>
                {water.isRunning ? 'Running' : 'Paused'}
              </span>
            </div>

            <div className="item-row" style={{ justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 400 }}>Daily Tasks Completed</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                {kpiData.goalsPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Focus Heatmap */}
        <div className="card" style={{ gridColumn: 'span 5', padding: '14px 18px' }}>
          <div className="card-header-row" style={{ marginBottom: '4px' }}>
            <span className="card-title" style={{ fontSize: '1rem' }}>Weekly Focus Timeline</span>
            <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {['Study', 'Water'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '42px', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{label}</span>
                <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                  {weeklyData.map((d, i) => {
                    const val = d[label];
                    const isHigh = label === 'Study' ? val >= 2 : val >= 6;
                    return (
                      <div 
                        key={i} 
                        style={{
                          flex: 1,
                          height: '24px',
                          borderRadius: '6px',
                          background: val > 0 
                            ? (isHigh ? 'var(--color-yellow)' : 'var(--chart-bar-default)') 
                            : 'var(--color-neutral-bg)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.68rem',
                          fontWeight: 500,
                          color: val > 0 ? (isHigh ? '#1C1C1E' : '#FFFFFF') : 'transparent'
                        }}
                        title={`${d.name}: ${val}`}
                      >
                        {d.dayLetter}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management Card */}
        <div className="card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 18px' }}>
          <div>
            <div className="card-header-row" style={{ marginBottom: '4px' }}>
              <span className="card-title" style={{ fontSize: '1rem' }}>Controls</span>
              <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
                <ArrowUpRight size={13} />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
              Export logs or reset your local tracker caches safely.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            <button 
              onClick={handleExportBackup} 
              className="btn btn-secondary" 
              style={{ width: '100%', fontSize: '0.78rem', height: '30px', padding: 0 }}
              title="Download PDF backup report"
            >
              <Download size={13} /> Export Backup
            </button>
            <button 
              onClick={() => setIsClearDataModalOpen(true)} 
              className="btn btn-secondary" 
              style={{ width: '100%', fontSize: '0.78rem', height: '30px', padding: 0 }}
              title="Reset all local data"
            >
              <Trash2 size={13} color="#8A8A86" /> Clear All Data
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Clearing All App Data */}
      <ConfirmModal 
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={handleConfirmClearData}
        title="Clear All App Data?"
        message="Are you sure you want to clear all data? This will permanently reset all your study sessions, hydration logs, goals, and tasks. This action cannot be undone."
        confirmText="Reset Everything"
        cancelText="Cancel"
        isDanger={true}
      />

    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardPageInner />
    </DashboardErrorBoundary>
  );
}
