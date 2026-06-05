/**
 * @fileOverview Sovereign Mobile Bridge v2.0.
 * Synchronizes web events with Native Android/iOS Wrappers (WebView).
 * Phase 37.0: Added Deep Linking, Lifecycle Intelligence, and Advanced Haptics.
 */

export const MobileBridge = {
  /**
   * Initializes event listeners for the mobile environment.
   */
  init() {
    if (typeof window === 'undefined') return;

    console.log("[Mobile Bridge] Establishing Imperial Handshake v2.0...");

    // 1. Android Back Button Logic
    window.addEventListener('popstate', (event) => {
      console.log("[Mobile Bridge] Back Navigation Detected.");
      if ((window as any).AndroidInterface) {
        (window as any).AndroidInterface.onBackPress();
      }
    });

    // 2. Deep Linking / External URL Handler
    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        if (data && data.type === 'SOVEREIGN_DEEP_LINK') {
          this.handleDeepLink(data.path);
        }
      } catch (e) {}
    });

    // 3. Lifecycle Visibility Tracker
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.onAppForeground();
      } else {
        this.onAppBackground();
      }
    });

    // 4. Initial Hardware Sync
    this.syncHardwareDNA();
  },

  /**
   * Navigates the app based on external deep link signals.
   */
  handleDeepLink(path: string) {
    console.log(`[Mobile Bridge] Deep Link Routing: ${path}`);
    if (path.startsWith('/')) {
      window.location.assign(path);
    }
  },

  /**
   * Executed when app returns to foreground.
   */
  onAppForeground() {
    console.log("[Mobile Bridge] App Foregrounded. Re-validating Grid Sync...");
    // Trigger any global refresh logic if needed
    window.dispatchEvent(new CustomEvent('sovereign-foreground-sync'));
  },

  /**
   * Executed when app goes to background.
   */
  onAppBackground() {
    console.log("[Mobile Bridge] App Backgrounded. Securing Session...");
  },

  /**
   * Updates the native status bar color.
   */
  updateStatusBar(color: string = '#05070a') {
    if ((window as any).AndroidInterface) {
      (window as any).AndroidInterface.updateStatusBarColor(color);
    }
  },

  /**
   * Triggers native haptic patterns for critical actions.
   */
  triggerHaptic(type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'SOS') {
    if (!navigator.vibrate) return;

    const patterns = {
      SUCCESS: [50, 30, 50],
      WARNING: [100, 50, 100],
      ERROR: [200, 100, 200],
      SOS: [500, 200, 500, 200, 500]
    };

    navigator.vibrate(patterns[type]);
    
    // Notify Native Interface
    if ((window as any).AndroidInterface) {
      (window as any).AndroidInterface.triggerHaptic(type);
    }
  },

  /**
   * Syncs hardware-level metadata to the identity registry.
   */
  syncHardwareDNA() {
    const metadata = {
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform,
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency,
      timestamp: new Date().toISOString()
    };
    
    console.log("[Mobile Bridge] Hardware DNA Synced:", metadata);
    localStorage.setItem('sovereign_hardware_dna', JSON.stringify(metadata));
  }
};
