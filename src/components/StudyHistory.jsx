import { calculateSessionTotals, formatDuration } from '../utils/studyUtils';
import { Trash2 } from 'lucide-react';

export default function StudyHistory({ sessions, deleteSession }) {
  // Group by date
  const grouped = sessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = { study: 0, breakTime: 0, count: 0, ids: [] };
    }
    const { study, breakTime } = calculateSessionTotals(session.segments);
    acc[session.date].study += study;
    acc[session.date].breakTime += breakTime;
    acc[session.date].count += 1;
    acc[session.date].ids.push(session.id);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (dates.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title">History</div>
      
      {dates.map(date => {
        const data = grouped[date];
        const studyPercent = (data.study / (data.study + data.breakTime + 1)) * 100;
        const breakPercent = (data.breakTime / (data.study + data.breakTime + 1)) * 100;
        
        return (
          <div key={date} style={{ marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
              <strong style={{ color: 'var(--text-main)' }}>{date}</strong>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{data.count} sessions</div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--sp-4)', fontSize: '0.9rem', marginBottom: 'var(--sp-3)', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: 'var(--study)', fontWeight: 600 }}>■</span> {formatDuration(data.study)} Study</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: 'var(--break)', fontWeight: 600 }}>■</span> {formatDuration(data.breakTime)} Break</span>
            </div>

            <div style={{ height: '8px', display: 'flex', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--sp-3)', background: 'var(--border-color)' }}>
              <div style={{ width: `${studyPercent}%`, background: 'var(--study)' }} title="Study Time"></div>
              <div style={{ width: `${breakPercent}%`, background: 'var(--break)' }} title="Break Time"></div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', padding: 'var(--sp-2)' }}>
              {sessions.filter(s => s.date === date).map((s, i) => {
                 const t = calculateSessionTotals(s.segments);
                 return (
                   <div className="item-row" key={s.id} style={{ padding: 'var(--sp-2) var(--sp-3)' }}>
                     <span className="tabular-nums" style={{ flex: 1 }}>Session {i + 1}</span>
                     <span className="tabular-nums" style={{ flex: 1, color: 'var(--study)' }}>{formatDuration(t.study)}</span>
                     <span className="tabular-nums" style={{ flex: 1, color: 'var(--break)' }}>{formatDuration(t.breakTime)}</span>
                     
                     <div className="actions">
                       <button 
                         className="icon-btn"
                         onClick={() => { if(window.confirm('Delete this session?')) deleteSession(s.id); }}
                         title="Delete Session"
                         style={{ color: 'var(--tasks)' }}
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
