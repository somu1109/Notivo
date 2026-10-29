import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { 
  Sun, Moon, Bell, BellOff, House, BookOpen, Target, ListChecks, Droplets, LayoutDashboard, Settings, User, Clock 
} from 'lucide-react';
import './App.css';
import logo from './assets/Notivo.png';
import wordmark from './assets/NotivoWordmark.png';

import Home from './pages/Home';
import StudyPage from './pages/StudyPage';
import GoalsPage from './pages/GoalsPage';
import TasksPage from './pages/TasksPage';
import WaterPage from './pages/WaterPage';
import DashboardPage from './pages/DashboardPage';

function TopNav({ isDark, toggleTheme, studyRunning, waterRunning }) {
  const { notification, study } = useAppContext();
  const { permission, requestPermission } = notification;
  const [showPopover, setShowPopover] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rawHours = currentTime.getHours();
  const clockHours = (rawHours % 12 || 12).toString().padStart(2, '0');
  const clockMinutes = currentTime.getMinutes().toString().padStart(2, '0');
  const clockSeconds = currentTime.getSeconds().toString().padStart(2, '0');
  const clockAmPm = rawHours >= 12 ? 'PM' : 'AM';

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/home", label: "Home", icon: House, dot: studyRunning },
    { to: "/study", label: "Study", icon: BookOpen, dot: studyRunning },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/water", label: "Water", icon: Droplets, dot: waterRunning }
  ];

  return (
    <>
      <header className="app-topbar">
        {/* Left: Crextio-style Outlined Logo Pill + Compact Live Digital Clock */}
        <div className="topbar-brand-group">
          <div className="logo-pill">
            <img src={logo} alt="Notivo Logo" className="logo-pill-icon" />
            <img src={wordmark} alt="Notivo" className="logo-pill-wordmark" />
          </div>

          <div className="topbar-clock-pill" title="Current Time">
            <Clock size={12} strokeWidth={2.2} className="topbar-clock-icon" />
            <span className="topbar-clock-digits">{clockHours}:{clockMinutes}:{clockSeconds}</span>
            <span className="topbar-clock-ampm">{clockAmPm}</span>
          </div>
        </div>

        {/* Center: Clean Pill Navigation */}
        <nav className="nav-pill-container">
          {links.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            >
              <span>{link.label}</span>
              {link.dot && <span className="nav-pill-dot" />}
            </NavLink>
          ))}
        </nav>

        {/* Right: Setting Pill, Bell, User, Theme Toggle */}
        <div className="topbar-actions">
          {studyRunning && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-yellow)',
              color: '#1C1C1E',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1C1C1E', animation: 'pulse 1.8s infinite' }} />
              {study.trackerState}
            </div>
          )}

          <div className="settings-pill" title="Settings">
            <Settings size={16} strokeWidth={1.5} />
            <span>Setting</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              className="round-btn" 
              onClick={() => setShowPopover(!showPopover)} 
              title="Notifications" 
              aria-label="Notifications"
            >
              {permission === 'granted' ? (
                <Bell size={18} strokeWidth={1.5} />
              ) : (
                <BellOff size={18} strokeWidth={1.5} color="var(--color-text-muted)" />
              )}
            </button>

            {showPopover && (
              <div className="popover">
                <h4>Notifications</h4>
                <p>
                  {permission === 'granted' 
                    ? 'Notifications are active and alert you for study and water intervals.' 
                    : (permission === 'denied' 
                        ? 'Blocked by browser. Please enable them in your address bar.' 
                        : 'Allow notifications for timely study and hydration reminders.')}
                </p>
                {permission !== 'granted' && permission !== 'denied' && (
                  <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => { requestPermission(); setShowPopover(false); }}>
                    Enable Notifications
                  </button>
                )}
              </div>
            )}
          </div>

          <button className="round-btn" title="User Profile" aria-label="User Profile">
            <User size={18} strokeWidth={1.5} />
          </button>

          <button className="round-btn" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            {isDark ? <Sun size={18} strokeWidth={1.5} color="#FFD84D" /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Floating Bottom Dock for Mobile (< 768px) */}
      <nav className="mobile-bottom-dock">
        {links.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            className={({ isActive }) => `mobile-dock-item ${isActive ? 'active' : ''}`}
            title={link.label}
          >
            <link.icon size={19} strokeWidth={1.5} />
          </NavLink>
        ))}
      </nav>
    </>
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
    <div className="app-shell">
      <TopNav 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        studyRunning={trackerState !== 'Idle'} 
        waterRunning={water.isRunning} 
      />
      
      <main className="main-content">
        {showAwayPrompt && (
          <div className="card" style={{ 
            marginBottom: '20px', 
            background: 'var(--color-yellow-soft)', 
            border: '1px solid var(--color-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <strong style={{ color: 'var(--color-ink)' }}>Session was running while you were away.</strong>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={clearAwayTime}>Keep it running</button>
              <button className="btn btn-secondary" onClick={handleFixEndTime}>Fix end time</button>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/tasks" element={<GoalsPage />} />
          <Route path="/goals" element={<TasksPage />} />
          <Route path="/water" element={<WaterPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
