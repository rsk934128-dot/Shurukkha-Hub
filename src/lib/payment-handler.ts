/**
 * @fileOverview Sovereign Payment Handler for Local & Global Settlements.
 * Updated Phase 33.5: Integrated API Aggregator and Dynamic Plugin Fees.
 */

import { IntegrationBridge } from './integration-bridge';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { SovereignAudit } from './sovereign-audit';
import { OpenBankingAdapter } from './open-banking-adapter';

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
  private static IMPERIAL_FEE_RATE = 0.015;
  private static PLUGIN_COMMISSION = 0.005; // Extra fee for third-party API use

  static calculateSettlement(amount: number, isPlugin = false) {
    let rate = this.IMPERIAL_FEE_RATE;
    if (isPlugin) rate += this.PLUGIN_COMMISSION;
    
    const fee = amount * rate;
    const netAmount = amount - fee;
    return { fee, netAmount };
  }

  /**
   * Routes payment through the Sovereign API Aggregator.
   */
  static async processAggregatedPayment(intent: PaymentIntent) {
    console.log(`[API Aggregator] Routing payment for ${intent.merchantId} via Unified Layer...`);
    
    const { fee, netAmount } = this.calculateSettlement(intent.amount, intent.source === 'PLUGIN_API');
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
      timestamp: new Date().toISOString()
    };

    // Dispatch to Webhooks if any plugin is subscribed
    await IntegrationBridge.dispatchToPlugins('PAYMENT_SETTLED', settlementData);

    await addDoc(collection(db, "audit_trails"), {
      action: 'SETTLEMENT_COMPLETED',
      details: settlementData,
      signature: IntegrationBridge.generateSignature(settlementData),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Aggregator_v33'
    });

    return settlementData;
  }

  /**
   * Disburses a Sovereign Imperial Loan to a merchant.
   */
  static async disburseLoan(merchant: any, amount: number) {
    console.warn(`[Treasury Command] DISBURSING LOAN of ৳${amount} to ${merchant.businessName}...`);
    
    try {
      const disbursementId = `LOAN-DISB-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const loanData = {
        disbursementId,
        merchantId: merchant.merchantId,
        merchantName: merchant.businessName,
        amount,
        status: 'disbursed',
        interestRate: '2.5% (Imperial)',
        timestamp: serverTimestamp(),
        purity: 'VERIFIED_IMPERIAL'
      };

      const merchantRef = doc(db, "merchants", merchant.id);
      await updateDoc(merchantRef, {
        activeLoanAmount: increment(amount),
        loanStatus: 'active'
      });

      await addDoc(collection(db, "audit_trails"), {
        action: 'LOAN_DISBURSED',
        details: loanData,
        signature: IntegrationBridge.generateSignature(loanData),
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Treasury_Admin'
      });

      return loanData;
    } catch (error: any) {
      throw error;
    }
  }

  static async generateInvoice(merchant: any, amount: number, description: string) {
    const invoiceId = `INV-SOV-${Math.floor(100000 + Math.random() * 900000)}`;
    const { fee } = this.calculateSettlement(amount);
    
    const invoiceData = {
      invoiceId,
      merchantId: merchant.merchantId || 'TXT-001',
      merchantName: merchant.businessName,
      amount,
      serviceFee: fee,
      description,
      status: 'pending',
      issuedAt: new Date().toISOString()
    };

    await addDoc(collection(db, "audit_trails"), {
      action: 'INVOICE_GENERATED',
      details: invoiceData,
      signature: IntegrationBridge.generateSignature(invoiceData),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Invoicing_Engine'
    });

    return invoiceData;
  }

  /**
   * Simulates a global payout flow with logging.
   */
  static async simulateGlobalPayout(recipient: string, amount: number, onLog: (msg: string) => void) {
    const logs = [
      `[STEP 1] Initiating payout of $${amount} to ${recipient}...`,
      `[AUTH] Validating Imperial Master Key...`,
      `[STEP 2] Routing through global Anycast nodes...`,
      `[SETTLE] Atomic settlement confirmed via Stripe Hub.`,
      `[SUCCESS] Payout disbursed to ${recipient}.`
    ];

    for (const log of logs) {
      onLog(log);
      await new Promise(r => setTimeout(r, 600));
    }

    const txnData = { recipient, amount, status: 'SUCCESS' };
    await addDoc(collection(db, "audit_trails"), {
      action: 'GLOBAL_PAYOUT_EXECUTED',
      details: txnData,
      signature: IntegrationBridge.generateSignature(txnData),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Payout_Manager'
    });
  }

  /**
   * Releases monthly payroll for imperial employees.
   */
  static async releaseMonthlyPayroll(amount: number, count: number) {
    const txnId = 'pay_batch_' + Math.random().toString(36).substring(2, 12);
    const payrollData = {
      txnId,
      totalAmount: amount,
      employeeCount: count,
      status: 'DISBURSED',
      purity: 'VERIFIED_IMPERIAL',
      timestamp: new Date().toISOString()
    };

    await addDoc(collection(db, "audit_trails"), {
      action: 'MONTHLY_PAYROLL_RELEASED',
      details: payrollData,
      signature: IntegrationBridge.generateSignature(payrollData),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Treasury_Admin'
    });

    return payrollData;
  }
}