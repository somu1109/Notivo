import { useState, useCallback, useEffect } from 'react';
import { notificationService, playWaterChime } from '../services/notificationService';

export { playWaterChime as playNotificationSound };

export function useNotification() {
  const [isSupported] = useState(() => typeof window !== 'undefined' && ('Notification' in window || notificationService.isNative()));
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    notificationService.checkPermission().then(setPermission);
  }, []);

  const requestPermission = async () => {
    await notificationService.requestPermission();
    const current = await notificationService.checkPermission();
    setPermission(current);
    return current;
  };

  const showNotification = useCallback(async (title, options = {}, urlPath = '/') => {
    return await notificationService.showImmediate(title, options, urlPath);
  }, []);

  return { permission, isSupported, requestPermission, showNotification };
}
