import { useState, useEffect } from 'react';
import { calculateSessionTotals, formatDuration } from '../utils/studyUtils';
import { Trash2, ArrowUpRight, History } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function StudyHistory({ sessions = [], deleteSession, currentSegments = [], trackerState = 'Idle' }) {
  const [, setTick] = useState(0);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Live timer tick when there is an active running session
  useEffect(() => {
    let timer;
    if (trackerState !== 'Idle' && currentSegments && currentSegments.length > 0) {
      timer = setInterval(() => setTick(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [trackerState, currentSegments]);

  const todayStr = new Date().toDateString();
  const hasActive = trackerState !== 'Idle' && currentSegments && currentSegments.length > 0;
  const activeTotals = hasActive ? calculateSessionTotals(currentSegments) : { study: 0, breakTime: 0 };

  // Group by date
  const grouped = (Array.isArray(sessions) ? sessions : []).reduce((acc, session) => {
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

  // Include active session into today's group if running
  if (hasActive) {
    if (!grouped[todayStr]) {
      grouped[todayStr] = { study: 0, breakTime: 0, count: 0, ids: [] };
    }
    grouped[todayStr].study += activeTotals.study;
    grouped[todayStr].breakTime += activeTotals.breakTime;
    grouped[todayStr].count += 1;
  }

  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (dates.length === 0) {
    return (
      <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0, justifyContent: 'space-between', position: 'relative', zIndex: 5 }}>
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
              <History size={14} />
            </div>
            <span style={{ fontSize: '1rem' }}>Session History</span>
          </div>
          <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
            <ArrowUpRight size={13} />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1, 
          padding: '16px 8px', 
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.82rem'
        }}>
          No recorded sessions yet. Start a study session to track your history!
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0, gap: '10px', position: 'relative', zIndex: 5 }}>
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
            <History size={14} />
          </div>
          <span style={{ fontSize: '1rem' }}>Session History</span>
        </div>
        <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
          <ArrowUpRight size={13} />
        </div>
      </div>
      
      <div 
        className="no-scrollbar" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '135px', 
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {dates.map(date => {
          const data = grouped[date];
          const studyPercent = (data.study / (data.study + data.breakTime + 1)) * 100;
          const breakPercent = (data.breakTime / (data.study + data.breakTime + 1)) * 100;
          const recordedForDate = (Array.isArray(sessions) ? sessions : []).filter(s => s.date === date);

          return (
            <div key={date} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500, fontSize: '0.86rem' }}>{date}</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{data.count} sessions</span>
              </div>
              
              {/* Pill Duration Badges */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.76rem', marginBottom: '8px' }}>
                <span style={{ 
                  background: 'var(--color-yellow)', 
                  color: '#1C1C1E', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 500
                }}>
                  {formatDuration(data.study)} Study
                </span>
                <span style={{ 
                  background: 'var(--color-neutral-bg)', 
                  color: 'var(--color-text-muted)', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 400
                }}>
                  {formatDuration(data.breakTime)} Break
                </span>
              </div>

              {/* Split Progress Track */}
              <div style={{ 
                height: '5px', 
                display: 'flex', 
                borderRadius: 'var(--radius-pill)', 
                overflow: 'hidden', 
                marginBottom: '8px', 
                background: 'var(--color-neutral-bg)'
              }}>
                <div style={{ width: `${studyPercent}%`, background: 'var(--color-yellow)' }} title="Study Time" />
                <div style={{ width: `${breakPercent}%`, background: 'var(--chart-bar-default)' }} title="Break Time" />
              </div>

              {/* List with Dotted Dividers */}
              <div>
                {/* Active Live Session Row */}
                {hasActive && date === todayStr && (
                  <div className="item-row" style={{ 
                    justifyContent: 'space-between', 
                    padding: '5px 8px',
                    background: 'var(--color-yellow-soft)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 216, 77, 0.4)',
                    marginBottom: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: '#1C1C1E', 
                        display: 'inline-block' 
                      }} />
                      <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1C1C1E' }}>
                        Session {recordedForDate.length + 1} ({trackerState})
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1C1E' }}>
                        {formatDuration(activeTotals.study)}
                      </span>
                      <span style={{ 
                        fontSize: '0.64rem', 
                        padding: '1px 6px', 
                        background: '#1C1C1E', 
                        color: '#FFFFFF', 
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 600,
                        letterSpacing: '0.04em'
                      }}>
                        LIVE
                      </span>
                    </div>
                  </div>
                )}

                {/* Recorded Completed Sessions */}
                {recordedForDate.map((s, i) => {
                   const t = calculateSessionTotals(s.segments);
                   return (
                     <div className="item-row" key={s.id} style={{ justifyContent: 'space-between', padding: '4px 0' }}>
                       <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Session {i + 1}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{formatDuration(t.study)}</span>
                         <button 
                           className="round-btn"
                           onClick={() => setSessionToDelete(s.id)}
                           title="Delete Session"
                           style={{ width: '26px', height: '26px', padding: 0 }}
                         >
                           <Trash2 size={12} color="var(--color-text-muted)" />
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

      {/* Confirmation Modal for Deleting Session */}
      <ConfirmModal 
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete);
            setSessionToDelete(null);
          }
        }}
        title="Delete Session?"
        message="Are you sure you want to delete this study session history? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}
