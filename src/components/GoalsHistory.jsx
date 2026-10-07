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
  
  // Check if today has at least one done
  let currentCheckDate = new Date();
  let keepChecking = true;

  if (grouped[currentDate] && grouped[currentDate].done > 0) {
    streak += 1;
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  } else {
    // If today is not done, check if yesterday was done.
    // If yesterday wasn't done either, streak is 0.
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

  if (pastDates.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>History</span>
        {streak > 0 && (
          <span style={{ background: 'var(--break-light)', color: 'var(--break)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🔥 {streak} Day Streak
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {pastDates.map(date => {
          const data = grouped[date];
          const allDone = data.done > 0 && data.done === data.total;
          return (
            <div key={date} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-3)', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{date}</span>
              <span style={{ fontWeight: 'bold', color: allDone ? 'var(--study)' : 'var(--text-secondary)' }}>
                {data.done} / {data.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
