import { useNotification } from '../hooks/useNotification';

export default function PermissionBanner() {
  const { permission, isSupported, requestPermission, showNotification } = useNotification();

  if (!isSupported) {
    return <div className="banner denied">Your browser does not support notifications.</div>;
  }

  if (permission === 'granted') {
    return (
      <div className="banner granted">
        Notifications allowed.
        <button onClick={() => showNotification('Test Notification', { body: 'This is a test.' })}>
          Test Notification
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="banner denied">
        Notifications are blocked. Please enable them in your browser settings (usually in the address bar).
      </div>
    );
  }

  return (
    <div className="banner">
      Notifications are not enabled.
      <button onClick={requestPermission}>Enable Notifications</button>
    </div>
  );
}
