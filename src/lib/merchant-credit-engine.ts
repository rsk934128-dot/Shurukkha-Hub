
/**
 * @fileOverview Imperial Merchant Credit Engine.
 * Analyzes revenue and tax records to generate Sovereign Credit Scores for SMEs.
 */

export interface CreditProfile {
  merchantId: string;
  score: number; // 0-1000
  eligibility: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  recommendedLimit: number;
  factors: string[];
}

export const MerchantCreditEngine = {
  /**
   * Calculates credit profile based on imperial data metrics.
   */
  analyzeSovereignCredit: (revenue: number, tax: number, activeMonths: number): CreditProfile => {
    let score = 300; // Base score
    const factors: string[] = [];

    // Revenue Factor
    if (revenue > 1000000) {
      score += 300;
      factors.push("High Revenue Consistency");
    } else if (revenue > 100000) {
      score += 150;
      factors.push("Stable Revenue Flow");
    }

    // Tax Compliance Factor
    if (tax > (revenue * 0.01)) {
      score += 200;
      factors.push("Full Tax Compliance Verified");
    }

    // Grid Tenure Factor
    if (activeMonths > 6) {
      score += 100;
      factors.push("Long-term Grid Loyalty");
    }

    let eligibility: CreditProfile['eligibility'] = 'NONE';
    let recommendedLimit = 0;

    if (score >= 800) {
      eligibility = 'EXTREME';
      recommendedLimit = revenue * 2.5;
    } else if (score >= 600) {
      eligibility = 'HIGH';
      recommendedLimit = revenue * 1.5;
    } else if (score >= 450) {
      eligibility = 'MEDIUM';
      recommendedLimit = revenue * 0.5;
    } else if (score >= 350) {
      eligibility = 'LOW';
      recommendedLimit = 10000; // Micro-loan starter
    }

    return {
      merchantId: 'SMID-XXXX',
      score: Math.min(score, 1000),
      eligibility,
      recommendedLimit,
      factors
    };
  }
};
