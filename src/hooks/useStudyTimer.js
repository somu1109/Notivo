import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useStudyTimer(showNotification) {
  const [trackerState, setTrackerState] = useLocalStorage('study_state', 'Idle');
  const [currentSegments, setCurrentSegments] = useLocalStorage('study_current_segments', []);
  const [sessions, setSessions] = useLocalStorage('study_sessions', []);
  const [notifiedSegments, setNotifiedSegments] = useLocalStorage('study_notified', []);

  // Settings
  const [studyLengthMs, setStudyLengthMs] = useLocalStorage('study_length_ms', 50 * 60 * 1000);
  const [breakLengthMs, setBreakLengthMs] = useLocalStorage('break_length_ms', 10 * 60 * 1000);

  useEffect(() => {
    let timer;
    if (trackerState !== 'Idle' && currentSegments.length > 0) {
      timer = setInterval(() => {
        const currentSeg = currentSegments[currentSegments.length - 1];
        const duration = Date.now() - currentSeg.start;
        const segId = currentSeg.start.toString();
        
        if (!notifiedSegments.includes(segId)) {
          if (trackerState === 'Studying' && studyLengthMs > 0 && duration >= studyLengthMs) {
            if (showNotification) showNotification('Time for a short break', { body: 'You have been studying for a while.' }, '/study');
            setNotifiedSegments([...notifiedSegments, segId]);
          } else if (trackerState === 'Break' && breakLengthMs > 0 && duration >= breakLengthMs) {
            if (showNotification) showNotification('Break is over', { body: 'Back to study!' }, '/study');
            setNotifiedSegments([...notifiedSegments, segId]);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [trackerState, currentSegments, studyLengthMs, breakLengthMs, showNotification, notifiedSegments, setNotifiedSegments]);

  const startSession = () => {
    if (trackerState !== 'Idle') return;
    setTrackerState('Studying');
    setCurrentSegments([{ type: 'Study', start: Date.now(), end: null }]);
  };

  const startBreak = () => {
    if (trackerState !== 'Studying') return;
    const now = Date.now();
    const updatedSegments = [...currentSegments];
    if (updatedSegments.length > 0) {
      updatedSegments[updatedSegments.length - 1].end = now;
    }
    updatedSegments.push({ type: 'Break', start: now, end: null });
    
    setTrackerState('Break');
    setCurrentSegments(updatedSegments);
  };

  const resumeSession = () => {
    if (trackerState !== 'Break') return;
    const now = Date.now();
    const updatedSegments = [...currentSegments];
    if (updatedSegments.length > 0) {
      updatedSegments[updatedSegments.length - 1].end = now;
    }
    updatedSegments.push({ type: 'Study', start: now, end: null });

    setTrackerState('Studying');
    setCurrentSegments(updatedSegments);
  };

  const stopSession = (endTimeOverride) => {
    if (trackerState === 'Idle') return;
    const now = endTimeOverride || Date.now();
    const updatedSegments = [...currentSegments];
    if (updatedSegments.length > 0) {
      updatedSegments[updatedSegments.length - 1].end = now;
    }

    // Calculate total duration for this session to ignore < 5s sessions
    let totalMs = 0;
    updatedSegments.forEach(seg => {
      totalMs += ((seg.end || now) - seg.start);
    });

    if (totalMs >= 5000) {
      const newSession = {
        id: Date.now().toString() + Math.random(),
        date: new Date(updatedSegments[0].start).toDateString(),
        segments: updatedSegments
      };
      setSessions([...sessions, newSession]);
    }

    setTrackerState('Idle');
    setCurrentSegments([]);
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  return {
    trackerState,
    currentSegments,
    sessions,
    startSession,
    startBreak,
    resumeSession,
    stopSession,
    deleteSession,
    studyLengthMs,
    setStudyLengthMs,
    breakLengthMs,
    setBreakLengthMs
  };
}
