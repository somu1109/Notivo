import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Sun, Moon, BellRing, BellOff, Home as HomeIcon, BookOpen, Target, CheckSquare, Droplets, LayoutDashboard } from 'lucide-react';
import './App.css';
import logo from './assets/Notivo.png';

import Home from './pages/Home';
import StudyPage from './pages/StudyPage';
import GoalsPage from './pages/GoalsPage';
import TasksPage from './pages/TasksPage';
import WaterPage from './pages/WaterPage';
import DashboardPage from './pages/DashboardPage';

function Sidebar({ studyRunning, waterRunning }) {
  const links = [
    { to: "/home", label: "Home", icon: HomeIcon, dot: studyRunning ? 'var(--study)' : null },
    { to: "/study", label: "Study", icon: BookOpen, dot: studyRunning ? 'var(--study)' : null },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/water", label: "Water", icon: Droplets, dot: waterRunning ? 'var(--water)' : null }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Notivo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
        <span className="nav-item-label">Notivo</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon-wrapper"><LayoutDashboard size={20} /></span>
          <span className="nav-item-label">Dashboard</span>
        </NavLink>
        
        <div style={{ height: 'var(--sp-4)' }} />
        
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon-wrapper"><link.icon size={20} /></span>
            <span className="nav-item-label">{link.label}</span>
            {link.dot && <span className="status-dot" style={{ background: link.dot }} />}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function MobileNav({ studyRunning, waterRunning }) {
  const links = [
    { to: "/dashboard", label: "Dash", icon: LayoutDashboard },
    { to: "/home", label: "Home", icon: HomeIcon, dot: studyRunning ? 'var(--study)' : null },
    { to: "/study", label: "Study", icon: BookOpen },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/water", label: "Water", icon: Droplets, dot: waterRunning ? 'var(--water)' : null }
  ];

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <link.icon size={24} />
          {link.label}
          {link.dot && <span className="mobile-status-dot" style={{ background: link.dot }} />}
        </NavLink>
      ))}
    </nav>
  );
}

function Header({ isDark, toggleTheme }) {
  const { notification, study } = useAppContext();
  const { permission, requestPermission } = notification;
  const [showPopover, setShowPopover] = useState(false);
  
  const studyRunning = study.trackerState !== 'Idle';

  return (
    <header className="top-header">
      {studyRunning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto', background: 'var(--study-light)', color: 'var(--study)', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--study)', animation: 'pulse 2s infinite' }} />
          {study.trackerState}
        </div>
      )}
      
      <div style={{ position: 'relative' }}>
        <button className="icon-btn" onClick={() => setShowPopover(!showPopover)} title="Notifications">
          {permission === 'granted' ? <BellRing size={20} color="var(--study)" /> : <BellOff size={20} color={permission === 'denied' ? 'var(--tasks)' : 'var(--text-secondary)'} />}
        </button>
        {showPopover && (
          <div className="card popover">
            <h4>Notifications</h4>
            <p>{permission === 'granted' ? 'Notifications are allowed and working.' : (permission === 'denied' ? 'Blocked by browser. Please enable them in your address bar.' : 'Please allow notifications for reminders.')}</p>
            {permission !== 'granted' && permission !== 'denied' && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { requestPermission(); setShowPopover(false); }}>Enable Notifications</button>
            )}
          </div>
        )}
      </div>

      <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}

export default function App() {
  const { study, water, lastActive } = useAppContext();
  const { awayTime, clearAwayTime } = lastActive;
  const { stopSession, trackerState } = study;

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('notivo_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('notivo_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const showAwayPrompt = trackerState !== 'Idle' && awayTime !== null;
  const handleFixEndTime = () => {
    stopSession(awayTime);
    clearAwayTime();
  };

  return (
    <div className="app-layout">
      <Sidebar studyRunning={trackerState !== 'Idle'} waterRunning={water.isRunning} />
      
      <main className="main-content">
        <Header isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
        
        <div className="page-container">
          {showAwayPrompt && (
            <div className="card" style={{ borderLeft: '4px solid var(--tasks)', background: 'var(--tasks-light)' }}>
              <strong>Session was running while you were away.</strong>
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={clearAwayTime}>Keep it running</button>
                <button className="btn btn-secondary" onClick={handleFixEndTime}>Fix end time to when I left</button>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/water" element={<WaterPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>

      <MobileNav studyRunning={trackerState !== 'Idle'} waterRunning={water.isRunning} />
    </div>
  );
}
