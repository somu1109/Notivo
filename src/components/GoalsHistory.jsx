import { Flame, History, ArrowUpRight } from 'lucide-react';

export default function GoalsHistory({ goals, currentDate }) {
  // Group by date
  const grouped = goals.reduce((acc, goal) => {
    if (!acc[goal.date]) {
      acc[goal.date] = { total: 0, done: 0 };
    }
    acc[goal.date].total += 1;
    if (goal.done) acc[goal.date].done += 1;
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  
  // Calculate streak: start from today or yesterday, go backwards
  let streak = 0;
  let currentCheckDate = new Date();
  let keepChecking = true;

  if (grouped[currentDate] && grouped[currentDate].done > 0) {
    streak += 1;
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  } else {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  }

  while (keepChecking) {
    const dStr = currentCheckDate.toDateString();
    if (grouped[dStr] && grouped[dStr].done > 0) {
      streak += 1;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      keepChecking = false;
    }
  }

  const pastDates = dates.filter(d => d !== currentDate);

  return (
    <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0, justifyContent: 'space-between' }}>
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
          <span style={{ fontSize: '1rem' }}>Past Performance</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {streak > 0 && (
            <span style={{ 
              background: 'var(--color-yellow)', 
              color: '#1C1C1E', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-pill)', 
              fontSize: '0.74rem', 
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(255, 216, 77, 0.3)'
            }}>
              <Flame size={12} /> {streak} Day Streak
            </span>
          )}
          <div className="card-arrow-btn" style={{ width: '26px', height: '26px' }}>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>

      {pastDates.length === 0 ? (
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
          No past records yet. Complete today's tasks to start your streak!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '110px', overflowY: 'auto' }}>
          {pastDates.map(date => {
            const data = grouped[date];
            const allDone = data.done > 0 && data.done === data.total;
            return (
              <div key={date} className="item-row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 400, fontSize: '0.86rem' }}>
                  {date}
                </span>
                <span style={{ 
                  fontWeight: 500, 
                  fontSize: '0.76rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: allDone ? 'var(--color-yellow)' : 'var(--color-neutral-bg)',
                  color: allDone ? '#1C1C1E' : 'var(--color-text-muted)',
                  transition: 'all 0.2s ease'
                }}>
                  {data.done} / {data.total} done
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
