/**
 * @fileOverview Sovereign Mobile Bridge.
 * Synchronizes web events with Native Android Wrapper (WebView).
 * Phase 35.5: Added BackPress and Lifecycle hooks.
 */

export const MobileBridge = {
  /**
   * Initializes event listeners for the mobile environment.
   */
  init() {
    if (typeof window === 'undefined') return;

    console.log("[Mobile Bridge] Initializing Imperial Handshake...");

    // 1. Android Back Button Logic
    window.addEventListener('popstate', (event) => {
      console.log("[Mobile Bridge] Back Navigation Detected.");
      // We can notify the Android Wrapper here if a bridge object exists
      if ((window as any).AndroidInterface) {
        (window as any).AndroidInterface.onBackPress();
      }
    });

    // 2. Prevent Pull-to-Refresh in Standalone mode
    document.addEventListener('touchmove', (e) => {
      if ((window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        if (window.scrollY === 0 && (e as any).touches[0].screenY > (window as any).lastTouchY) {
          // Pulling down at top
          // e.preventDefault(); // Uncomment if pull-to-refresh is annoying
        }
      }
      (window as any).lastTouchY = (e as any).touches[0].screenY;
    }, { passive: false });

    // 3. Status Bar Sync
    this.updateStatusBar();
  },

  /**
   * Notifies the native wrapper about critical UI changes.
   */
  updateStatusBar(color: string = '#05070a') {
    if ((window as any).AndroidInterface) {
      (window as any).AndroidInterface.updateStatusBarColor(color);
    }
  },

  /**
   * Triggers a native vibration pulse for SOS or Alerts.
   */
  vibrate(pattern: number[] = [100, 50, 100]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
};
