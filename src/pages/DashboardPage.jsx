import React, { useMemo, Component } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { Download, Trash2, Filter, Search, Plus, ChevronDown } from 'lucide-react';
import { calculateSessionTotals } from '../utils/studyUtils';

/* ── Error Boundary: prevents chart crashes from freezing the whole app ── */
class DashboardErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('Dashboard crashed:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)' }}>
          <h3>Dashboard encountered an error</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try refreshing the page.</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: '16px', padding: '8px 20px', background: '#4573d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════════════════════
   ALL helper components / constants MUST be defined OUTSIDE the render 
   body. If any of these are inside DashboardPage(), the 5-second 
   AppContext timer causes Recharts to fully unmount & remount every 
   tick, eventually crashing the page.
   ══════════════════════════════════════════════════════════════════════ */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minWidth: '120px' }}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', marginTop: '4px' }}>
            <span style={{ width: 10, height: 10, background: entry.color, borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
            {entry.name}: {entry.value}{entry.name === 'Water' ? ' gl' : entry.name === 'Goals' ? '%' : entry.name === 'Tasks' ? '' : 'h'}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={12} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>
      {payload.value}
    </text>
  </g>
);

// CRITICAL: This was inside the component body before, causing the 5s remount crash
const CardFooter = ({ text }) => (
  <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
    <Filter size={12} /> {text}
  </div>
);

const mainChartMargin = { top: 10, right: 20, left: 0, bottom: 5 };
const smallChartMargin = { top: 10, right: 10, left: -20, bottom: 5 };

const CARD = {
  background: 'var(--card-bg)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  boxShadow: 'none',
  overflow: 'hidden',
};

const PIE_COLORS = ['var(--study)', 'var(--break)'];

/* ══════════════════════════════════════════════════════════════════════ */

function DashboardPageInner() {
  // Context provides hook objects directly — NOT raw setters
  const { study, water, goals, tasks } = useAppContext();

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
      waterText: avgWater,
      goalsPercent,
      tasksDone: completedTasks,
    };
  }, [study.sessions, water.glassesHistory, goals.goals, tasks.tasks]);

  /* ── Weekly chart data (Mon → Sun) ── */
  const weeklyData = useMemo(() => {
    const studyDataRaw = study.sessions || [];
    const waterDataRaw = water.glassesHistory || {};
    const tasksDataRaw = tasks.tasks || [];

    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const daysSinceMon = dow === 0 ? 6 : dow - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMon);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      data.push({
        dateString: d.toDateString(),
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
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

  /* ── Pie data ── */
  const pieData = useMemo(() => {
    const studyDataRaw = study.sessions || [];
    let totalStudy = 0, totalBreak = 0;
    studyDataRaw.forEach(s => {
      const { study: st, breakTime: bt } = calculateSessionTotals(s.segments);
      totalStudy += st; totalBreak += bt;
    });
    if (totalStudy === 0 && totalBreak === 0) return [{ name: 'Empty', value: 1 }];
    return [{ name: 'Study', value: totalStudy }, { name: 'Break', value: totalBreak }];
  }, [study.sessions]);

  /* ── Clear data via localStorage directly (hooks don't expose raw setters) ── */
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('study_sessions');
      localStorage.removeItem('water_glasses_history');
      localStorage.removeItem('goals_list');
      localStorage.removeItem('reminder_tasks');
      window.location.reload();
    }
  };

  const kpis = [
    { label: 'Study Average', value: kpiData.studyText, footer: '1 Filter' },
    { label: 'Water Average', value: kpiData.waterText, footer: '1 Filter' },
    { label: 'Goals Completed', value: `${kpiData.goalsPercent}%`, footer: '1 Filter' },
    { label: 'Tasks Completed', value: kpiData.tasksDone, footer: 'No Filters' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px', fontFamily: 'var(--font-main)' }}>

      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Reporting &gt;</div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            My Dashboard <ChevronDown size={16} color="var(--text-secondary)" />
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 12px', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            <Search size={14} color="var(--text-secondary)" /> Search
          </div>
          <button style={{ background: '#4573d2', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Plus size={16} /> Add chart
          </button>
        </div>
      </div>

      {/* ═══ KPI Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.6rem', color: 'var(--text-main)', fontWeight: 400, letterSpacing: '-1px' }}>
              {kpi.value}
            </div>
            <CardFooter text={kpi.footer} />
          </div>
        ))}
      </div>

      {/* ═══ Main Charts Row: Study (60%) + Water (40%) ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
        {/* Study Time by Day */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Study Time by Day</div>
          <div style={{ height: 260, padding: '0 16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={mainChartMargin}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={<AxisTick />} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-color)', opacity: 0.2 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="square" />
                <Bar dataKey="Study" stackId="a" fill="var(--study)" radius={[0, 0, 0, 0]} barSize={22} />
                <Bar dataKey="Break" stackId="a" fill="var(--break)" radius={[0, 0, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CardFooter text="1 Filter • Last 7 Days" />
        </div>

        {/* Water Intake */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Water Intake</div>
          <div style={{ height: 260, padding: '0 16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={smallChartMargin}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={<AxisTick />} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-color)', opacity: 0.2 }} />
                <Bar dataKey="Water" fill="var(--water)" radius={[0, 0, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CardFooter text="1 Filter" />
        </div>
      </div>

      {/* ═══ Small Charts Row: Goals / Tasks / Split ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Goals Completion */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Goals Completion</div>
          <div style={{ height: 200, padding: '0 16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={smallChartMargin}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={<AxisTick />} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} />
                <YAxis tickFormatter={val => `${val}%`} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="linear" dataKey="Goals" stroke="var(--goals)" strokeWidth={2} dot={{ r: 4, fill: 'var(--goals)', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <CardFooter text="1 Filter" />
        </div>

        {/* Tasks Finished */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Tasks Finished</div>
          <div style={{ height: 200, padding: '0 16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={smallChartMargin}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={<AxisTick />} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-color)', opacity: 0.2 }} />
                <Bar dataKey="Tasks" fill="var(--tasks)" radius={[0, 0, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CardFooter text="No Filters" />
        </div>

        {/* Study vs Break Split */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Study vs Break Split</div>
          <div style={{ height: 200, padding: '0 16px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="40%" cy="50%" innerRadius="55%" outerRadius="80%" dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Empty' ? 'var(--border-color)' : PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="square" wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 500, color: 'var(--text-main)' }}>Split</div>
            </div>
          </div>
          <CardFooter text="1 Filter" />
        </div>
      </div>

      {/* ═══ Bottom Row: Heatmap / Insights / Data Mgmt ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Heatmap */}
        <div style={{ ...CARD }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>Weekly Heatmap</div>
          <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Study', 'Water'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', width: '48px', flexShrink: 0 }}>{label}</div>
                {weeklyData.map((d, i) => (
                  <div key={i} style={{
                    flex: 1, height: '24px', borderRadius: '4px',
                    background: d[label] > 0 ? (label === 'Study' ? 'var(--study)' : 'var(--water)') : 'var(--bg-color)',
                    opacity: d[label] > 0 ? 0.9 : 0.5,
                  }} title={`${d.name}: ${d[label]}`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div style={{ ...CARD }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>Insights</div>
          <ul style={{ margin: 0, padding: '24px 16px 24px 36px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: 400 }}>
            <li>Your best study day logged <b style={{ color: 'var(--study)' }}>{Math.max(0, ...weeklyData.map(d => d.Study))} hours</b>.</li>
            <li>You reached your water target on <b style={{ color: 'var(--water)' }}>{weeklyData.filter(d => d.Water >= 8).length}</b> out of 7 days.</li>
            <li>You have completed <b style={{ color: 'var(--goals)' }}>{kpiData.goalsPercent}%</b> of your lifetime goals.</li>
          </ul>
        </div>

        {/* Data Management */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>Data Management</div>
          <div style={{ padding: '24px 16px', display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            <button style={{ flex: 1, background: '#4573d2', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Download size={14} /> Export
            </button>
            <button onClick={handleClearData} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '4px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Trash2 size={14} color="#f43f5e" /> Clear All
            </button>
          </div>
        </div>
      </div>

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
