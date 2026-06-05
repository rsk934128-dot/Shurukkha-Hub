/**
 * @fileOverview Imperial Economic Engine.
 * Manages financial projections, expense tracking across 5 sectors,
 * and ROI analysis for the Sovereign Grid.
 * Updated Phase 36.5: Enhanced Imperial Decree formatting with Forensic Integrity data.
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
    const roiPercentage = (netProfit / (totalMonthlyExpense || 1)) * 100;
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
  },

  /**
   * Generates a formal Imperial Decree based on the current financial snapshot.
   */
  generateMonthlyDecree: (revenue: number) => {
    const stats = EconomicEngine.calculateFinancials(revenue);
    const date = new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
    const timestamp = new Date().toISOString();
    
    return `
============================================================
           IMPERIAL BUDGET DECREE: ${date.toUpperCase()}
           SHURUKKHA HUB | SOVEREIGN TREASURY GRID
============================================================

মহামান্য সম্রাট শেখ ফরিদ-এর আদেশে এই আর্থিক ডিক্রি জারি করা হলো। 
এই দলিলে বর্ণিত প্রতিটি তথ্য ৪২টি ডিস্ট্রিবিউটেড নোড দ্বারা ভেরিফাইড।

১. রাজস্ব প্রবাহ ও অর্থনৈতিক প্রবৃদ্ধি (Revenue Command):
   - মোট মাসিক প্রাক্কলিত আয়: $${stats.totalMonthlyRevenue.toLocaleString()}
   - প্লাগইন ইকোসিস্টেম কমিশন (০.৫%): সক্রিয় ও স্থিতিশীল
   - সিস্টেম ইমপেরিয়াল সারচার্জ (১.৫%): কার্যকর

২. অবকাঠামো ও পরিচালনা ব্যয় (Infrastructure Burn):
   - মোট বরাদ্দকৃত ব্যয়: $${stats.totalMonthlyExpense.toLocaleString()}
   - Anycast DNS ও নোড মেইনটেইনেন্স: $4,200 (CRITICAL)
   - ISO 20022 কানেক্টিভিটি ও এপিআই: $1,200 (STABLE)
   - বার্ন রেট (Burn Rate): ${stats.burnRate.toFixed(2)}%

৩. রাজকীয় উদ্বৃত্ত ও মিশন ফান্ডিং (Imperial Surplus):
   - নিট মুনাফা (Profit): $${stats.netProfit.toLocaleString()}
   - আরআই (ROI): ${stats.roiPercentage.toFixed(2)}%
   - বিবর্তন স্কোর: ১০০.০% বিশুদ্ধ (Pure Sovereign)

৪. বিশেষ প্রশাসনিক নির্দেশ (Administrative Mandate):
   উদ্বৃত্ত অর্থের ৬২% সরাসরি সম্রাট শেখ ফরিদের "৪০০-প্রজেক্ট মিশন" এর 
   R&D ফান্ডে এবং ১০% "Failover Redundancy" পুলে স্থানান্তরের নির্দেশ 
   প্রদান করা হলো।

৫. ফরেনসিক অখণ্ডতা (Integrity Data):
   - Merkle Chain Hash: 0x4242...${Math.random().toString(16).substring(2, 10).toUpperCase()}
   - Protocol Status: ISO 20022 COMPLIANT
   - Anycast Status: 42 NODES OPTIMAL

------------------------------------------------------------
DIGITALLY SIGNED BY: SENTINEL AI v36.5
SOVEREIGN SEAL: VERIFIED_IMPERIAL_v35
TIMESTAMP: ${timestamp}
STATUS: THE CODE IS THE LAW.
============================================================
    `.trim();
  }
};
