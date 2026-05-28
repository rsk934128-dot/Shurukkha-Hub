/**
 * @fileOverview Imperial TOTP Engine.
 * Handles Secret Generation and Token Verification for Google Authenticator.
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const TOTPEngine = {
  /**
   * Generates a new TOTP secret and QR code URI for setup.
   */
  async generateSetupData(userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'Shurukkha Hub', secret);
    const qrDataUri = await QRCode.toDataURL(otpauth);
    
    return {
      secret,
      qrDataUri
    };
  },

  /**
   * Verifies a 6-digit token against a stored secret.
   * Includes a 30-second window for time drift.
   */
  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (e) {
      console.error("[TOTP] Verification failed", e);
      return false;
    }
  },

  /**
   * Generates recovery codes for emergency access.
   */
  generateRecoveryCodes(): string[] {
    return Array.from({ length: 5 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
};
