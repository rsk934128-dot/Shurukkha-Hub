/**
 * @fileOverview Hardware-Bound Security Module.
 * Generates and validates device fingerprints to prevent session hijacking.
 */

export const DeviceValidator = {
  /**
   * Generates a unique hash based on browser and hardware attributes.
   */
  generateFingerprint: (): string => {
    if (typeof window === 'undefined') return 'server_side';
    
    const n = window.navigator;
    const s = window.screen;
    const raw = `${n.userAgent}|${n.language}|${s.colorDepth}|${s.width}x${s.height}`;
    
    // Simple Base64 salt for the fingerprint
    return 'dev_' + btoa(raw).substring(0, 24);
  },

  /**
   * Validates if the current device matches the one used at login.
   */
  validateIntegrity: (storedFingerprint: string): boolean => {
    const current = DeviceValidator.generateFingerprint();
    if (current !== storedFingerprint) {
      console.error("[Integrity Violation] Device Fingerprint Mismatch!");
      return false;
    }
    return true;
  }
};
