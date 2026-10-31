import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const WATER_NOTIFICATION_ID = 1001;

// Gentle water drop sound using Web Audio API
export function playWaterChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle water drop frequency glide: 580Hz -> 1350Hz
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1350, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Autoplay restrictions or headless environment
  }
}

class NotificationService {
  isNative() {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  async checkPermission() {
    if (this.isNative()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        return status.display; // 'granted', 'denied', or 'prompt'
      } catch (e) {
        return 'default';
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  }

  async requestPermission() {
    if (this.isNative()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        return res.display === 'granted';
      } catch (e) {
        console.error('Failed to request native notification permissions', e);
        return false;
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (e) {
        console.error('Failed to request web notification permissions', e);
        return false;
      }
    }
    return false;
  }

  // Schedule background water reminder (Works when app is closed on Android/iOS & PWA)
  async scheduleWaterReminder(targetTimestamp, intervalMs) {
    // 1. Native Capacitor App (Android / iOS): Uses OS AlarmManager
    if (this.isNative()) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: WATER_NOTIFICATION_ID }] });
        await LocalNotifications.schedule({
          notifications: [
            {
              id: WATER_NOTIFICATION_ID,
              title: 'Time to drink water 💧',
              body: 'Stay hydrated! Maintain your peak cognitive performance.',
              schedule: { at: new Date(targetTimestamp) },
              sound: 'default',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#FFD84D',
              actionTypeId: 'OPEN_WATER'
            }
          ]
        });
        console.log('[Native] Scheduled OS alarm for water reminder at', new Date(targetTimestamp).toLocaleTimeString());
        return true;
      } catch (err) {
        console.error('[Native] Failed to schedule native notification', err);
      }
    }

    // 2. Web / PWA: Communicate with Service Worker
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.active) {
          reg.active.postMessage({
            type: 'SCHEDULE_WATER_REMINDER',
            targetTime: targetTimestamp,
            intervalMs
          });
        }

        // Check for Notification Triggers API (Chromium experimental offline trigger)
        if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
          reg.showNotification('Time to drink water 💧', {
            body: 'Stay hydrated! Maintain your peak cognitive performance.',
            showTrigger: new TimestampTrigger(targetTimestamp),
            icon: '/pwa-192x192.png',
            badge: '/favicon-48x48.png',
            tag: 'water-reminder',
            data: { url: '/water' }
          });
        }
      } catch (swErr) {
        console.warn('ServiceWorker reminder scheduling fallback', swErr);
      }
    }

    return true;
  }

  // Cancel scheduled background reminder
  async cancelWaterReminder() {
    if (this.isNative()) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: WATER_NOTIFICATION_ID }] });
      } catch (e) {}
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.active) {
          reg.active.postMessage({ type: 'CANCEL_WATER_REMINDER' });
        }
      } catch (e) {}
    }
  }

  // Immediate Notification (with sound chime)
  async showImmediate(title, options = {}, urlPath = '/') {
    playWaterChime();

    // Native app
    if (this.isNative()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 90000) + 1000,
              title,
              body: options.body || 'Stay hydrated!',
              sound: 'default'
            }
          ]
        });
        return true;
      } catch (e) {}
    }

    // PWA & Browser
    const perm = await this.checkPermission();
    if (perm !== 'granted') return false;

    const notifOptions = {
      body: options.body || 'Stay hydrated!',
      icon: '/pwa-192x192.png',
      badge: '/favicon-48x48.png',
      tag: options.tag || 'water-alert',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: urlPath },
      ...options
    };

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions);
          return true;
        }
      } catch (swErr) {}
    }

    try {
      const n = new Notification(title, notifOptions);
      n.onclick = () => {
        window.focus();
        if (urlPath) window.location.href = urlPath;
        n.close();
      };
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const notificationService = new NotificationService();
