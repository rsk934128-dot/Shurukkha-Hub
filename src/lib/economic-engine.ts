
/**
 * @fileOverview Imperial Economic Engine.
 * Manages financial projections, expense tracking across 5 sectors,
 * and ROI analysis for the Sovereign Grid.
 */

export interface ExpenseCategory {
  id: string;
  name: string;
  monthlyCost: number;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
}

export interface FinancialSnapshot {
  totalMonthlyRevenue: number;
  totalMonthlyExpense: number;
  netProfit: number;
  roiPercentage: number;
  burnRate: number;
}

export const EconomicEngine = {
  // Sector-wise costs (Simulated in USD)
  sectors: [
    { id: 'cloud', name: 'Cloud Infrastructure', monthlyCost: 4200, description: '42 Nodes maintenance & Anycast DNS', priority: 'CRITICAL' },
    { id: 'api', name: 'API Licensing', monthlyCost: 1200, description: 'Plaid, Salt Edge & ISO 20022 fees', priority: 'HIGH' },
    { id: 'security', name: 'Security & Audit', monthlyCost: 850, description: 'Forensic Audit & RSA Encryption tools', priority: 'CRITICAL' },
    { id: 'rd', name: 'R&D Scaling', monthlyCost: 2500, description: 'AI Training & Plugin Builder updates', priority: 'STANDARD' },
    { id: 'ops', name: 'Operational Expenses', monthlyCost: 1500, description: 'Technical support & hardware overhead', priority: 'STANDARD' }
  ] as ExpenseCategory[],

  /**
   * Calculates financial health based on current revenue flow.
   */
  calculateFinancials: (currentRevenue: number): FinancialSnapshot => {
    const totalMonthlyExpense = EconomicEngine.sectors.reduce((acc, s) => acc + s.monthlyCost, 0);
    const netProfit = currentRevenue - totalMonthlyExpense;
    const roiPercentage = (netProfit / totalMonthlyExpense) * 100;
    const burnRate = (totalMonthlyExpense / (currentRevenue || 1)) * 100;

    return {
      totalMonthlyRevenue: currentRevenue,
      totalMonthlyExpense,
      netProfit,
      roiPercentage,
      burnRate
    };
  },

  /**
   * Generates a 6-month financial projection.
   */
  getProjectionData: (currentRevenue: number) => {
    const data = [];
    const monthlyExpense = EconomicEngine.sectors.reduce((acc, s) => acc + s.monthlyCost, 0);
    
    for (let i = 0; i < 6; i++) {
      const growthFactor = 1 + (i * 0.15); // 15% monthly growth
      const revenue = Math.round(currentRevenue * growthFactor);
      data.push({
        month: `Month ${i + 1}`,
        revenue: revenue,
        expense: monthlyExpense,
        profit: revenue - monthlyExpense
      });
    }
    return data;
  }
};
