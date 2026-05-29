
/**
 * @fileOverview Sovereign Notification Manager.
 * Communicates with Service Worker to manage persistent active signals and push notifications.
 */

export const NotificationManager = {
  /**
   * Requests permission and registers the Service Worker signal.
   */
  async activateSovereignSignal(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn("Notifications not supported in this browser.");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    if (registration) {
      registration.active?.postMessage({ action: 'SHOW_ACTIVE_SIGNAL' });
      localStorage.setItem('sovereign_signal_active', 'true');
      return true;
    }
    return false;
  },

  /**
   * Deactivates the persistent signal and clears the notification.
   */
  async deactivateSovereignSignal() {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.active) {
        registration.active.postMessage({ action: 'CLOSE_ACTIVE_SIGNAL' });
      }
    }
    localStorage.setItem('sovereign_signal_active', 'false');
  },

  /**
   * Sends a targeted notification through the Service Worker.
   */
  async sendNotification(title: string, body: string, tag: string = 'signal') {
    if (typeof window === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.active) {
      registration.active.postMessage({
        action: 'SHOW_NOTIFICATION',
        payload: { title, body, tag }
      });
    }
  },

  /**
   * Checks if signal was previously active.
   */
  isSignalActive(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sovereign_signal_active') === 'true';
  }
};
