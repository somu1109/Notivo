export function calculateSessionTotals(segments) {
  let study = 0;
  let breakTime = 0;
  const now = Date.now();

  segments.forEach(seg => {
    const end = seg.end ? seg.end : now;
    const duration = end - seg.start;
    if (seg.type === 'Study') study += duration;
    if (seg.type === 'Break') breakTime += duration;
  });

  return { study, breakTime };
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const pad = num => num.toString().padStart(2, '0');
  
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
