/**
 * @fileOverview Imperial Data Integrity Guardian.
 * Verifies the accuracy of local logic outputs against historical patterns.
 */

export interface IntegrityReport {
  score: number; // 0-100
  isVerified: boolean;
  warnings: string[];
  timestamp: string;
}

export const DataIntegrityGuardian = {
  /**
   * Verifies local flood advice.
   */
  verifyFloodAdvice: (waterLevel: number, riskLevel: string): IntegrityReport => {
    const warnings: string[] = [];
    let score = 100;

    // Logic Cross-Check
    if (waterLevel > 14.0 && riskLevel !== 'Extreme') {
      score -= 30;
      warnings.push("High water level but risk level not set to Extreme.");
    }

    if (waterLevel < 13.0 && riskLevel === 'Extreme') {
      score -= 40;
      warnings.push("Low water level but risk level set to Extreme.");
    }

    return {
      score,
      isVerified: score >= 70,
      warnings,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Verifies responder suggestions.
   */
  verifyResponder: (sosType: string, responderType: string): IntegrityReport => {
    const warnings: string[] = [];
    let score = 100;

    const matches: Record<string, string> = {
      'fire': 'Fire',
      'medical': 'Medical',
      'theft': 'Police',
      'flood': 'Volunteer'
    };

    const expected = matches[sosType.toLowerCase()];
    if (expected && expected !== responderType) {
      score -= 25;
      warnings.push(`Expected ${expected} responder for ${sosType} emergency.`);
    }

    return {
      score,
      isVerified: score >= 75,
      warnings,
      timestamp: new Date().toISOString()
    };
  }
};
