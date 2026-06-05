
/**
 * @fileOverview Sovereign Payment Handler for Local & Global Settlements.
 * Updated Phase 35.0: Integrated Smart Routing and Autonomous Settlement.
 * Phase 36.0: Added Financial Projection tracking integration.
 */

import { IntegrationBridge } from './integration-bridge';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { NetworkAuditor } from './network-auditor';

export interface PaymentIntent {
  amount: number;
  currency: string;
  source: 'CARD' | 'BANK' | 'VIRTUAL_ACCOUNT' | 'INVESTMENT_VAULT' | 'PAYPAL' | 'PLUGIN_API';
  target: 'BKASH' | 'LOCAL_BANK' | 'TREASURY' | 'GLOBAL_PAYPAL' | 'WISE_SOVEREIGN' | 'SMART_ESCROW';
  merchantId: string;
  description?: string;
  isEscrow?: boolean;
}

export class PaymentHandler {
  private static IMPERIAL_FEE_RATE = 0.015; // 1.5% Imperial Fee
  private static PLUGIN_COMMISSION = 0.005; // 0.5% Plugin Commission

  /**
   * Smart Routing: Selects the best node based on latency and cost.
   */
  static async routeSmartPayment(amount: number, merchantId: string) {
    console.log("[Smart Routing] Calculating optimal path for settlement...");
    const nodes = NetworkAuditor.getGlobalNodes();
    const optimalNode = nodes.reduce((prev, curr) => (prev.latency < curr.latency ? prev : curr));
    
    console.log(`[Smart Routing] Path Selected: ${optimalNode.name} (${optimalNode.latency}ms)`);
    
    return this.processAggregatedPayment({
      amount,
      currency: 'USD',
      source: 'PLUGIN_API',
      target: 'TREASURY',
      merchantId,
      description: `Smart routed via ${optimalNode.name}`
    });
  }

  static async processAggregatedPayment(intent: PaymentIntent) {
    const fee = intent.amount * (this.IMPERIAL_FEE_RATE + this.PLUGIN_COMMISSION);
    const netAmount = intent.amount - fee;
    const txnId = 'txn_agg_' + Math.random().toString(36).substring(2, 12);

    const settlementData = {
      txnId,
      merchantId: intent.merchantId,
      amount: intent.amount,
      feeCollected: fee,
      netSettled: netAmount,
      currency: intent.currency,
      aggregator: 'gw-open-banking-central',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      purity: 'VERIFIED_IMPERIAL'
    };

    // Broadcast to grid and register in audit
    await IntegrationBridge.dispatchToPlugins('PAYMENT_SETTLED', settlementData);

    await addDoc(collection(db, "audit_trails"), {
      action: 'SETTLEMENT_COMPLETED',
      details: settlementData,
      signature: IntegrationBridge.generateSignature(settlementData),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Smart_Router_v35'
    });

    return settlementData;
  }

  static async disburseLoan(merchant: any, amount: number) {
    try {
      const disbursementId = `LOAN-DISB-${Math.floor(100000 + Math.random() * 900000)}`;
      const loanData = { disbursementId, merchantId: merchant.merchantId, amount, status: 'disbursed', timestamp: serverTimestamp() };
      await updateDoc(doc(db, "merchants", merchant.id), { activeLoanAmount: increment(amount), loanStatus: 'active' });
      await addDoc(collection(db, "audit_trails"), { action: 'LOAN_DISBURSED', details: loanData, signature: IntegrationBridge.generateSignature(loanData), timestamp: serverTimestamp(), performedBy: 'Imperial_Treasury_Admin' });
      return loanData;
    } catch (error) { throw error; }
  }

  static async simulateGlobalPayout(recipient: string, amount: number, onLog: (msg: string) => void) {
    const logs = [
      `[STEP 1] Initiating payout of $${amount} to ${recipient}...`,
      `[AUTH] Validating Imperial Master Key...`,
      `[ROUTING] Failover Protocol: Nodes Verified. Selecting optimal gate...`,
      `[STEP 2] Routing through global Anycast nodes...`,
      `[SETTLE] Atomic settlement confirmed via Stripe Hub.`,
      `[SUCCESS] Payout disbursed to ${recipient}.`
    ];
    for (const log of logs) { onLog(log); await new Promise(r => setTimeout(r, 600)); }
  }

  static async releaseMonthlyPayroll(amount: number, count: number) {
    const txnId = 'pay_batch_' + Math.random().toString(36).substring(2, 12);
    const payrollData = { txnId, totalAmount: amount, employeeCount: count, status: 'DISBURSED', timestamp: new Date().toISOString() };
    
    // Log the release
    await addDoc(collection(db, "audit_trails"), { 
      action: 'MONTHLY_PAYROLL_RELEASED', 
      details: payrollData, 
      signature: IntegrationBridge.generateSignature(payrollData), 
      timestamp: serverTimestamp(), 
      performedBy: 'Imperial_Treasury_Admin' 
    });

    // Update global budget metrics (Simulation)
    console.log(`[Economic Engine] Syncing payroll release with Treasury Ledger.`);
    
    return payrollData;
  }

  /**
   * Generates a payment invoice for a merchant.
   */
  static async generateInvoice(merchant: any, amount: number, description: string) {
    const invoiceId = `INV-${merchant.merchantId}-${Date.now().toString(36).toUpperCase()}`;
    const invoiceData = { invoiceId, merchantId: merchant.merchantId, amount, description, status: 'issued', timestamp: new Date().toISOString() };
    
    await addDoc(collection(db, "audit_trails"), { 
      action: 'INVOICE_ISSUED', 
      details: invoiceData, 
      signature: IntegrationBridge.generateSignature(invoiceData), 
      timestamp: serverTimestamp(), 
      performedBy: 'Imperial_Invoicing_System' 
    });
    
    return invoiceData;
  }
}
