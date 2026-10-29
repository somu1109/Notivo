import { useNotification } from '../hooks/useNotification';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';

export default function PermissionBanner() {
  const { permission, isSupported, requestPermission, showNotification } = useNotification();

  if (!isSupported) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px solid var(--color-gray-border)',
        borderRadius: 'var(--radius-pill)',
        padding: '10px 20px',
        fontSize: '0.86rem',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BellOff size={16} /> Browser notifications are not supported on this device.
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px solid var(--color-gray-border)',
        borderRadius: 'var(--radius-pill)',
        padding: '8px 18px',
        fontSize: '0.86rem',
        color: 'var(--color-text-main)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-yellow-deep)' }} />
          <span>Notifications active and working seamlessly.</span>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => showNotification('Test Notification', { body: 'Notivo alerts are working perfectly!' })}
          style={{ padding: '6px 16px', fontSize: '0.8rem', height: '32px' }}
        >
          Send Test
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px solid var(--color-gray-border)',
        borderRadius: 'var(--radius-pill)',
        padding: '10px 20px',
        fontSize: '0.86rem',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BellOff size={16} /> Notifications are blocked. Please enable them in your browser settings.
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.65)',
      border: '1px solid var(--color-gray-border)',
      borderRadius: 'var(--radius-pill)',
      padding: '8px 18px',
      fontSize: '0.86rem',
      color: 'var(--color-text-main)',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={16} style={{ color: 'var(--color-yellow-deep)' }} />
        <span>Enable desktop notifications to get gentle sound &amp; hydration reminders.</span>
      </div>
      <button 
        className="btn btn-black" 
        onClick={requestPermission}
        style={{ padding: '6px 16px', fontSize: '0.8rem', height: '32px' }}
      >
        Enable Alerts
      </button>
    </div>
  );
}
