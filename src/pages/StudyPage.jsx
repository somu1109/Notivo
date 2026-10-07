import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StudySummary from '../components/StudySummary';
import StudyHistory from '../components/StudyHistory';
import CustomSelect from '../components/CustomSelect';

export default function StudyPage() {
  const { study } = useAppContext();
  const { 
    sessions, 
    currentSegments, 
    deleteSession,
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
    <div>
      <div className="page-header">
        <h2>Study</h2>
        <p>Track your focus sessions and daily goals.</p>
      </div>

      <StudySummary sessions={sessions} currentSegments={currentSegments} />
      
      <div className="card">
        <div className="card-title">Notification Settings</div>
        <div className="form-row" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Suggest Break After:</label>
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
                  style={{ width: '80px', padding: '6px 10px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>minutes</span>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Break Over After:</label>
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
                  style={{ width: '80px', padding: '6px 10px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>minutes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudyHistory sessions={sessions} deleteSession={deleteSession} />
    </div>
  );
}
