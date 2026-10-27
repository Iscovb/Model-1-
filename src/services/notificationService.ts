/**
 * Browser Notification and Sound Alert Service for TET Model#1 Live Scanner
 */

export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic institutional two-tone alert chime (sine + triangle)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);
  } catch (e) {
    // Non-critical audio error (e.g. autoplay restriction)
  }
};

export const getNotificationPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationAccess = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
};

export const triggerMarketStateNotification = (
  title: string,
  body: string,
  tag?: string
): boolean => {
  // Always trigger the audio chime
  playNotificationChime();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        tag: tag || 'tet-model1-market-alert',
        icon: 'https://cdn-icons-png.flaticon.com/512/3310/3310653.png',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (e) {
      console.warn('Failed to construct browser notification:', e);
      return false;
    }
  }

  return false;
};
