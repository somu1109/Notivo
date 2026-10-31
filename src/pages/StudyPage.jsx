import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StudySummary from '../components/StudySummary';
import StudyHistory from '../components/StudyHistory';
import CustomSelect from '../components/CustomSelect';
import { ArrowUpRight, Sliders } from 'lucide-react';

export default function StudyPage() {
  const { study, user } = useAppContext();
  const { 
    sessions, 
    currentSegments, 
    deleteSession,
    trackerState,
    studyLengthMs,
    setStudyLengthMs,
    breakLengthMs,
    setBreakLengthMs
  } = study;

  const [forceCustomStudy, setForceCustomStudy] = useState(false);
  const [forceCustomBreak, setForceCustomBreak] = useState(false);

  const studyOptionsArr = [
    { value: 0, label: 'Off' },
    { value: 10000, label: '10 Seconds (Test)' },
    { value: 1500000, label: '25 Minutes' },
    { value: 3000000, label: '50 Minutes' },
    { value: 5400000, label: '90 Minutes' },
    { value: 'custom', label: 'Custom...' }
  ];

  const breakOptionsArr = [
    { value: 0, label: 'Off' },
    { value: 5000, label: '5 Seconds (Test)' },
    { value: 300000, label: '5 Minutes' },
    { value: 600000, label: '10 Minutes' },
    { value: 900000, label: '15 Minutes' },
    { value: 'custom', label: 'Custom...' }
  ];

  const handleStudyChange = (val) => {
    if (val === 'custom') {
      setForceCustomStudy(true);
    } else {
      setForceCustomStudy(false);
      setStudyLengthMs(parseInt(val));
    }
  };

  const handleBreakChange = (val) => {
    if (val === 'custom') {
      setForceCustomBreak(true);
    } else {
      setForceCustomBreak(false);
      setBreakLengthMs(parseInt(val));
    }
  };

  const isCustomStudy = forceCustomStudy || !studyOptionsArr.map(o => o.value).filter(v => v !== 'custom').includes(studyLengthMs);
  const isCustomBreak = forceCustomBreak || !breakOptionsArr.map(o => o.value).filter(v => v !== 'custom').includes(breakLengthMs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-text-main)' }}>
          Focus &amp; Study
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '2px' }}>
          {user?.greeting ? `${user.greeting} • ` : ''}Organize deep work blocks with rhythmic break intervals.
        </p>
      </div>

      <StudySummary sessions={sessions} currentSegments={currentSegments} />
      
      {/* Side-by-side grid for Pacing & Interval Timers and Session History */}
      <div className="study-bottom-grid" style={{ position: 'relative', zIndex: 10 }}>
        {/* Pacing Controls Card */}
        <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0, gap: '10px', position: 'relative', zIndex: 20 }}>
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
                <Sliders size={14} />
              </div>
              <span style={{ fontSize: '1rem' }}>Pacing &amp; Interval Timers</span>
            </div>
            <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
              <ArrowUpRight size={13} />
            </div>
          </div>
          
          <div className="form-row" style={{ alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
              <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                Suggest Break After:
              </label>
              <CustomSelect 
                value={isCustomStudy ? 'custom' : studyLengthMs} 
                options={studyOptionsArr}
                onChange={handleStudyChange}
              />
              {isCustomStudy && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    min="1"
                    className="input-field" 
                    value={Math.round(studyLengthMs / 60000) || ''} 
                    onChange={e => setStudyLengthMs(parseInt(e.target.value || 0) * 60000)}
                    style={{ width: '90px', padding: '6px 14px' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>minutes</span>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
              <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '6px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                Break Over After:
              </label>
              <CustomSelect 
                value={isCustomBreak ? 'custom' : breakLengthMs} 
                options={breakOptionsArr}
                onChange={handleBreakChange}
              />
              {isCustomBreak && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    min="1"
                    className="input-field" 
                    value={Math.round(breakLengthMs / 60000) || ''} 
                    onChange={e => setBreakLengthMs(parseInt(e.target.value || 0) * 60000)}
                    style={{ width: '90px', padding: '6px 14px' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>minutes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session History Card */}
        <StudyHistory 
          sessions={sessions} 
          deleteSession={deleteSession} 
          currentSegments={currentSegments} 
          trackerState={trackerState} 
        />
      </div>
    </div>
  );
}
