
/**
 * @fileOverview Sovereign Notification Manager.
 * Communicates with Service Worker to manage persistent active signals.
 */

export const NotificationManager = {
  /**
   * Requests permission and registers the Service Worker signal.
   */
  async activateSovereignSignal(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn("Notifications not supported in this browser.");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({ action: 'SHOW_ACTIVE_SIGNAL' });
      localStorage.setItem('sovereign_signal_active', 'true');
      return true;
    }
    return false;
  },

  /**
   * Deactivates the persistent signal and clears the notification.
   */
  async deactivateSovereignSignal() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({ action: 'CLOSE_ACTIVE_SIGNAL' });
      }
    }
    localStorage.setItem('sovereign_signal_active', 'false');
  },

  /**
   * Checks if signal was previously active.
   */
  isSignalActive(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sovereign_signal_active') === 'true';
  }
};
