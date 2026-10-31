import { calculateSessionTotals, formatDuration } from './studyUtils';
import notivoLogoUrl from '../assets/Notivo.png';

function loadBase64Image(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas toDataURL failed:', err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function exportNotivoBackupPDF({ study, water, goals, tasks, kpiData, userName = 'Somu' }) {
  const { jsPDF } = await import('jspdf');
  // Preload Notivo logo for branded header
  let logoData = null;
  try {
    logoData = await loadBase64Image(notivoLogoUrl);
  } catch (err) {
    console.warn('Could not load logo for PDF:', err);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors
  const ink = [28, 28, 30];
  const yellow = [255, 216, 77];
  const graySurface = [246, 246, 244];
  const grayBorder = [226, 226, 223];
  const textMuted = [138, 138, 134];
  const green = [34, 197, 94];

  let yPos = 14;

  const checkPageOverflow = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - 16) {
      doc.addPage();
      yPos = 16;
      renderHeader(false);
    }
  };

  const renderHeader = (isFirstPage = true) => {
    // Brand Yellow Top Bar
    doc.setFillColor(...yellow);
    doc.rect(margin, yPos, contentWidth, 3, 'F');
    yPos += 6;

    // Header Branding with Notivo Logo
    const logoSize = 10;
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', margin, yPos - 1, logoSize, logoSize);
      } catch (e) {
        console.warn('doc.addImage error:', e);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...ink);
      doc.text('NOTIVO', margin + logoSize + 3, yPos + 6.8);

      // Accent Dot
      doc.setFillColor(...yellow);
      doc.circle(margin + logoSize + 3 + 30, yPos + 4.8, 1.8, 'F');
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...ink);
      doc.text('NOTIVO', margin, yPos + 5);

      // Accent Dot
      doc.setFillColor(...yellow);
      doc.circle(margin + 33, yPos + 3, 2, 'F');
    }

    // Right-aligned Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    const nowStr = new Date().toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    const userPrefix = userName ? `User: ${userName.trim()}  |  ` : '';
    doc.text(`${userPrefix}Backup: ${nowStr}`, pageWidth - margin, yPos + 5.5, { align: 'right' });

    yPos += 11;

    if (isFirstPage) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...textMuted);
      doc.text('Personal Productivity, Focus & Hydration Report', margin, yPos);
      yPos += 6;

      // Divider line
      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.4);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
    } else {
      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
    }
  };

  // First page header
  renderHeader(true);

  // ── 1. KPI Summary Cards ──
  const cardWidth = (contentWidth - 9) / 4; // 4 cards with 3mm gaps
  const cardHeight = 18;

  const kpis = [
    { label: 'STUDY TIME', value: `${kpiData?.studyHoursOnly || '0'} hrs`, sub: 'Weekly Focus' },
    { label: 'HYDRATION', value: `${kpiData?.waterText || '0'} gl`, sub: 'Daily Average' },
    { label: 'TASKS DONE', value: `${kpiData?.goalsPercent || 0}%`, sub: 'Completion Rate' },
    { label: 'GOAL QUEUE', value: `${kpiData?.tasksDone || 0}/${kpiData?.totalTasks || 0}`, sub: 'Goals Met' }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    // Card background
    doc.setFillColor(...graySurface);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2.5, 2.5, 'F');
    // Card border
    doc.setDrawColor(...grayBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2.5, 2.5, 'D');

    // Accent line on top of card
    doc.setFillColor(...(idx === 0 || idx === 1 ? yellow : ink));
    doc.rect(x + 3, yPos, cardWidth - 6, 1, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(kpi.label, x + 4, yPos + 5.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text(kpi.value, x + 4, yPos + 11.5);

    // Sub
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(kpi.sub, x + 4, yPos + 15.5);
  });

  yPos += cardHeight + 8;

  // ── Section Helper ──
  const renderSectionHeader = (title, countText) => {
    checkPageOverflow(14);
    // Yellow Accent Pill
    doc.setFillColor(...yellow);
    doc.rect(margin, yPos, 2.5, 5.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text(title, margin + 5, yPos + 4.5);

    if (countText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(countText, pageWidth - margin, yPos + 4.5, { align: 'right' });
    }

    yPos += 8;
  };

  // ── 2. Study Sessions Table ──
  const sessions = study?.sessions || [];
  renderSectionHeader('Study & Focus Sessions', `${sessions.length} recorded`);

  if (sessions.length === 0) {
    checkPageOverflow(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text('No study sessions recorded yet.', margin + 5, yPos + 3);
    yPos += 8;
  } else {
    // Table Header
    checkPageOverflow(10);
    doc.setFillColor(...graySurface);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ink);
    doc.text('Date', margin + 3, yPos + 4.2);
    doc.text('Study Duration', margin + 45, yPos + 4.2);
    doc.text('Break Duration', margin + 95, yPos + 4.2);
    doc.text('Segments', margin + 145, yPos + 4.2);
    yPos += 7;

    // Rows (show up to 10 most recent)
    const recentSessions = [...sessions].reverse().slice(0, 10);
    recentSessions.forEach((s) => {
      checkPageOverflow(7);
      const { study: st, breakTime: bt } = calculateSessionTotals(s.segments || []);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...ink);

      doc.text(s.date || 'Unknown date', margin + 3, yPos + 3.8);
      doc.text(formatDuration(st), margin + 45, yPos + 3.8);
      doc.text(formatDuration(bt), margin + 95, yPos + 3.8);
      doc.text(`${s.segments?.length || 0} segments`, margin + 145, yPos + 3.8);

      // Light row divider
      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos + 5.2, pageWidth - margin, yPos + 5.2);
      yPos += 6;
    });
    yPos += 4;
  }

  // ── 3. Hydration Log Summary ──
  const waterHistory = water?.glassesHistory || {};
  const waterDates = Object.keys(waterHistory).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);
  renderSectionHeader('Hydration History (Last 7 Days)', `${waterDates.length} days logged`);

  if (waterDates.length === 0 && (water?.glasses?.count || 0) === 0) {
    checkPageOverflow(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text('No hydration records logged yet.', margin + 5, yPos + 3);
    yPos += 8;
  } else {
    checkPageOverflow(10);
    doc.setFillColor(...graySurface);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ink);
    doc.text('Date', margin + 3, yPos + 4.2);
    doc.text('Glasses Consumed', margin + 65, yPos + 4.2);
    doc.text('Target Goal', margin + 115, yPos + 4.2);
    doc.text('Status', margin + 155, yPos + 4.2);
    yPos += 7;

    // Today entry
    const todayStr = new Date().toDateString();
    const todayCount = water?.glasses?.count || 0;
    const allWaterEntries = [{ date: `${todayStr} (Today)`, count: todayCount }];

    waterDates.forEach(d => {
      if (d !== todayStr) {
        allWaterEntries.push({ date: d, count: waterHistory[d] });
      }
    });

    allWaterEntries.forEach(entry => {
      checkPageOverflow(7);
      const isTargetMet = entry.count >= 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...ink);
      doc.text(entry.date, margin + 3, yPos + 3.8);
      doc.text(`${entry.count} glasses (${entry.count * 250} ml)`, margin + 65, yPos + 3.8);
      doc.text('8 glasses (2.0 L)', margin + 115, yPos + 3.8);

      if (isTargetMet) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...green);
        doc.text('Goal Achieved', margin + 155, yPos + 3.8);
      } else {
        doc.setTextColor(...textMuted);
        doc.text(`${8 - entry.count} remaining`, margin + 155, yPos + 3.8);
      }

      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos + 5.2, pageWidth - margin, yPos + 5.2);
      yPos += 6;
    });
    yPos += 4;
  }

  // ── 4. Daily Tasks Table ──
  const goalsList = goals?.goals || [];
  renderSectionHeader('Daily Tasks', `${goalsList.length} items`);

  if (goalsList.length === 0) {
    checkPageOverflow(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text('No daily tasks found in backup.', margin + 5, yPos + 3);
    yPos += 8;
  } else {
    checkPageOverflow(10);
    doc.setFillColor(...graySurface);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ink);
    doc.text('Status', margin + 3, yPos + 4.2);
    doc.text('Task Description', margin + 25, yPos + 4.2);
    doc.text('Date', margin + 145, yPos + 4.2);
    yPos += 7;

    goalsList.slice(0, 15).forEach(goal => {
      checkPageOverflow(7);
      doc.setFont('helvetica', goal.done ? 'bold' : 'normal');
      doc.setFontSize(8);
      if (goal.done) {
        doc.setTextColor(...green);
        doc.text('[DONE]', margin + 3, yPos + 3.8);
      } else {
        doc.setTextColor(...textMuted);
        doc.text('[OPEN]', margin + 3, yPos + 3.8);
      }

      doc.setTextColor(...ink);
      const truncatedText = goal.text?.length > 70 ? goal.text.substring(0, 67) + '...' : (goal.text || 'Untitled task');
      doc.text(truncatedText, margin + 25, yPos + 3.8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(goal.date || 'Today', margin + 145, yPos + 3.8);

      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos + 5.2, pageWidth - margin, yPos + 5.2);
      yPos += 6;
    });
    yPos += 4;
  }

  // ── 5. Goals Schedule ──
  const tasksList = tasks?.tasks || [];
  renderSectionHeader('Scheduled Goals', `${tasksList.length} items`);

  if (tasksList.length === 0) {
    checkPageOverflow(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text('No goals scheduled.', margin + 5, yPos + 3);
    yPos += 8;
  } else {
    checkPageOverflow(10);
    doc.setFillColor(...graySurface);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ink);
    doc.text('Status', margin + 3, yPos + 4.2);
    doc.text('Goal Title', margin + 25, yPos + 4.2);
    doc.text('Target Date / Time', margin + 140, yPos + 4.2);
    yPos += 7;

    tasksList.slice(0, 15).forEach(task => {
      checkPageOverflow(7);
      const isDone = task.status === 'Done';
      doc.setFont('helvetica', isDone ? 'bold' : 'normal');
      doc.setFontSize(8);
      if (isDone) {
        doc.setTextColor(...green);
        doc.text('[COMPLETED]', margin + 3, yPos + 3.8);
      } else {
        doc.setTextColor(...ink);
        doc.text('[UPCOMING]', margin + 3, yPos + 3.8);
      }

      doc.setTextColor(...ink);
      const truncatedTitle = task.title?.length > 68 ? task.title.substring(0, 65) + '...' : (task.title || 'Untitled task');
      doc.text(truncatedTitle, margin + 25, yPos + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      const dueStr = task.datetime ? new Date(task.datetime).toLocaleString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }) : 'No due date';
      doc.text(dueStr, margin + 140, yPos + 3.8);

      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos + 5.2, pageWidth - margin, yPos + 5.2);
      yPos += 6;
    });
  }

  // ── Footer on all pages (with "somu") ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(...grayBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`Notivo Productivity App | ${userName?.trim() || 'Somu'}`, margin, pageHeight - 7.5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  }

  // Save / Trigger Download
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`Notivo-Backup-${dateSlug}.pdf`);
}
