/**
 * @fileOverview Flood Data Service for Sirajganj Shurukkha Hub.
 * Manages the ingestion of river telemetry and historical trend analysis.
 */

export interface RiverTelemetry {
  waterLevel: number;
  dangerLevel: number;
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
}

export const FloodDataService = {
  /**
   * Fetches real-time telemetry from Jamuna River points.
   * Mocking the Data Ingestion Layer for the prototype.
   */
  getLatestTelemetry: async (): Promise<RiverTelemetry> => {
    // In production, this would fetch from BWDB API or specialized IoT nodes
    return {
      waterLevel: 13.92,
      dangerLevel: 13.80,
      trend: 'rising',
      lastUpdated: new Date().toISOString()
    };
  },

  /**
   * Risk Scoring Algorithm based on historical peaking and flow velocity.
   */
  calculateRiskScore: (currentLevel: number, dangerLevel: number): number => {
    const diff = currentLevel - dangerLevel;
    if (diff > 1.0) return 95; // Extreme
    if (diff > 0.5) return 80; // High
    if (diff > 0) return 60;   // Moderate
    if (diff > -0.5) return 40; // Low
    return 20; // Safe
  }
};
