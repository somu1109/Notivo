
export function getWeekDays(startDate) {
  const days = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Calculate study/break time for a given day string
function getStudyStatsForDay(sessions, dateStr) {
  const daySessions = sessions.filter(s => s.date === dateStr);
  let study = 0;
  let breakTime = 0;
  
  daySessions.forEach(s => {
    s.segments.forEach(seg => {
      const duration = (seg.end || Date.now()) - seg.start;
      if (seg.type === 'Study') study += duration;
      else if (seg.type === 'Break') breakTime += duration;
    });
  });

  return { study, breakTime };
}

export function generateDashboardData(weekStartDate, studyContext, goalsContext, waterContext, tasksContext) {
  const days = getWeekDays(weekStartDate);
  
  const chartData = [];
  let totals = {
    studyMs: 0,
    breakMs: 0,
    glasses: 0,
    goalsSet: 0,
    goalsDone: 0,
    tasksSet: 0,
    tasksDone: 0,
    tasksMissed: 0,
    daysPassed: 0
  };

  const now = new Date();
  // Strip time for comparison
  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  days.forEach((dayDate, index) => {
    const dateStr = dayDate.toDateString();
    const isFuture = dayDate.getTime() > todayAtMidnight;
    const isPassed = !isFuture;
    
    if (isPassed) totals.daysPassed += 1;

    // Study
    const { study, breakTime } = getStudyStatsForDay(studyContext.sessions, dateStr);
    
    // Water
    const glasses = waterContext.glassesHistory[dateStr] || 0;
    
    // Goals
    const dayGoals = goalsContext.goals.filter(g => g.date === dateStr);
    const goalsSet = dayGoals.length;
    const goalsDone = dayGoals.filter(g => g.done).length;
    
    // Tasks
    // task.datetime is string "2026-10-05T14:00"
    // We count a task for the day it was scheduled
    const dayTasks = tasksContext.tasks.filter(t => new Date(t.datetime).toDateString() === dateStr);
    const tasksSet = dayTasks.length;
    const tasksDone = dayTasks.filter(t => t.status === 'Done').length;
    const tasksMissed = dayTasks.filter(t => t.status === 'Missed').length;

    // Accumulate
    totals.studyMs += study;
    totals.breakMs += breakTime;
    totals.glasses += glasses;
    totals.goalsSet += goalsSet;
    totals.goalsDone += goalsDone;
    totals.tasksSet += tasksSet;
    totals.tasksDone += tasksDone;
    totals.tasksMissed += tasksMissed;

    // Data for charts
    chartData.push({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      fullDate: dateStr,
      isFuture,
      studyHours: study / (1000 * 60 * 60),
      breakHours: breakTime / (1000 * 60 * 60),
      glasses: glasses,
      goalsCompletion: goalsSet > 0 ? (goalsDone / goalsSet) * 100 : 0,
      tasksDone,
      tasksMissed,
      hasData: (study > 0 || breakTime > 0 || glasses > 0 || goalsSet > 0 || tasksSet > 0)
    });
  });

  return { chartData, totals };
}
