import { useState, useCallback } from 'react';

export function useNotification() {
  const [isSupported] = useState('Notification' in window);
  const [permission, setPermission] = useState(() => 
    isSupported ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (!isSupported) return;
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
    } catch (err) {
      console.error('Failed to request notification permission', err);
    }
  };

  const showNotification = useCallback((title, options, urlPath) => {
    if (!isSupported || permission !== 'granted') return;
    
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        if (urlPath) {
          window.location.href = urlPath;
        }
        notification.close();
      };
    } catch (err) {
      console.error('Failed to show notification', err);
    }
  }, [isSupported, permission]);

  return { permission, isSupported, requestPermission, showNotification };
}
