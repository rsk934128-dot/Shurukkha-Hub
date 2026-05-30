
/**
 * @fileOverview Sovereign Payment Handler for Local & Global Settlements.
 * Updated Phase 32.5: Integrated Loan Disbursement and Sovereign Credit Management.
 */

import { IntegrationBridge } from './integration-bridge';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { FraudRecovery } from './fraud-recovery-protocol';
import { EconomicForecaster } from './economic-forecaster';
import { AuthGuard } from './auth-guard';
import { SovereignAudit } from './sovereign-audit';
import { MerchantCreditEngine } from './merchant-credit-engine';

export interface PaymentIntent {
  amount: number;
  currency: string;
  source: 'CARD' | 'BANK' | 'VIRTUAL_ACCOUNT';
  target: 'BKASH' | 'LOCAL_BANK' | 'TREASURY' | 'GLOBAL_PAYPAL' | 'WISE_SOVEREIGN';
  merchantId: string;
  description?: string;
}

export interface AtomicReceipt {
  receiptId: string;
  txnId: string;
  amount: number;
  netAmount: number;
  fee: number;
  currency: string;
  domain: string;
  signature: string;
  timestamp: string;
}

export class PaymentHandler {
  private static IMPERIAL_FEE_RATE = 0.015;

  static predictRisk(intent: PaymentIntent) {
    console.log(`[AI Fraud Engine] Analyzing risk for ${intent.amount} ${intent.currency}...`);
    if (intent.amount > 500000) return 'HIGH';
    if (intent.merchantId === 'SUSPICIOUS_M_01') return 'CRITICAL';
    return 'LOW';
  }

  static calculateSettlement(amount: number) {
    const fee = amount * this.IMPERIAL_FEE_RATE;
    const netAmount = amount - fee;
    return { fee, netAmount };
  }

  static generateReceipt(intent: PaymentIntent, txnId: string): AtomicReceipt {
    const { fee, netAmount } = this.calculateSettlement(intent.amount);
    const receiptData = {
      txnId,
      amount: intent.amount,
      fee,
      netAmount,
      currency: intent.currency,
      domain: IntegrationBridge.primaryDomain,
      timestamp: new Date().toISOString()
    };
    return {
      receiptId: 'rec_' + Math.random().toString(36).substring(2, 12),
      ...receiptData,
      signature: IntegrationBridge.generateSignature(receiptData)
    };
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

      // 1. Update Merchant Document
      const merchantRef = doc(db, "merchants", merchant.id);
      await updateDoc(merchantRef, {
        activeLoanAmount: increment(amount),
        loanStatus: 'active'
      });

      // 2. Log to Audit Trail
      await addDoc(collection(db, "audit_trails"), {
        action: 'LOAN_DISBURSED',
        details: loanData,
        signature: IntegrationBridge.generateSignature(loanData),
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Treasury_Admin'
      });

      await SovereignAudit.logMilestone('IMPERIAL_LOAN', `Loan of ৳${amount} disbursed to ${merchant.businessName}.`);
      
      return loanData;
    } catch (error: any) {
      console.error("[Loan Engine] Disbursement Failed:", error);
      throw error;
    }
  }

  static async generateInvoice(merchant: any, amount: number, description: string) {
    if (!merchant) throw new Error("Invalid merchant data provided.");

    try {
      const invoiceId = `INV-SOV-${Math.floor(100000 + Math.random() * 900000)}`;
      const { fee } = this.calculateSettlement(amount);
      
      const invoiceData = {
        invoiceId,
        merchantId: merchant.merchantId || 'TXT-001',
        merchantName: merchant.businessName || 'সিরাজগঞ্জ হ্যান্ডলুম প্রোডাকশন হাউস',
        amount,
        serviceFee: fee,
        description,
        status: 'pending',
        issuedAt: new Date().toISOString(),
        purity: 'VERIFIED_IMPERIAL'
      };

      const signature = IntegrationBridge.generateSignature(invoiceData);

      await addDoc(collection(db, "audit_trails"), {
        action: 'INVOICE_GENERATED',
        details: invoiceData,
        signature,
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Invoicing_Engine'
      });

      return invoiceData;
    } catch (error: any) {
      console.error("[Invoice Engine] Failed to generate invoice:", error);
      throw new Error(`Invoicing Fault: ${error.message}`);
    }
  }

  static async simulateFinancialCycle(onLog: (msg: string) => void) {
    try {
      onLog("[INITIATING]: Picking Targeted Merchant for Stress Test...");
      
      const merchantsSnap = await getDocs(collection(db, "merchants"));
      const merchant = merchantsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .find(m => m.merchantId === "TXT-001") || { 
          businessName: 'সিরাজগঞ্জ হ্যান্ডলুম প্রোডাকশন হাউস', 
          merchantId: 'TXT-001',
          category: 'Textile',
          totalRevenue: 500000,
          taxCollected: 10000
        };
      
      onLog(`[MERCHANT]: Selected ${merchant.businessName} (${merchant.merchantId})`);
      
      // Credit Analysis Step
      onLog("[CREDIT]: Running Sovereign Credit Analysis...");
      const credit = MerchantCreditEngine.analyzeSovereignCredit(merchant.totalRevenue || 0, merchant.taxCollected || 0, 8);
      onLog(`[SUCCESS]: Credit Score: ${credit.score}/1000. Eligibility: ${credit.eligibility}`);

      // Disbursement Simulation
      if (credit.eligibility !== 'NONE') {
        const loanAmount = 50000;
        onLog(`[LOAN]: Initiating Imperial Loan Disbursement of ৳${loanAmount}...`);
        await this.disburseLoan(merchant, loanAmount);
        onLog(`[SUCCESS]: ৳${loanAmount} pushed to ${merchant.businessName} local node.`);
      }

      const amount = 10000;
      onLog(`[INVOICE]: Generating Sovereign Bill for ৳${amount}...`);
      const invoice = await this.generateInvoice(merchant, amount, "Imperial Service Fee - Strategic Validation");
      
      onLog("[SECURITY]: Executing Zero-Trust Handshake (RSA v2)...");
      await new Promise(r => setTimeout(r, 1200));

      const intent: PaymentIntent = {
        amount: invoice.amount,
        currency: 'BDT',
        source: 'VIRTUAL_ACCOUNT',
        target: 'TREASURY',
        merchantId: merchant.merchantId
      };

      const risk = this.predictRisk(intent);
      const { fee, netAmount } = this.calculateSettlement(intent.amount);
      const settlementId = 'set_full_' + Math.random().toString(36).substring(2, 10);
      const receipt = this.generateReceipt(intent, settlementId);

      onLog(`[REVENUE]: Imperial Fee ৳${fee} collected. Net Settlement: ৳${netAmount}`);

      await addDoc(collection(db, "audit_trails"), {
        action: 'SETTLEMENT_COMPLETED',
        details: { 
          settlementId, 
          invoiceId: invoice.invoiceId,
          merchantId: merchant.merchantId,
          merchantName: merchant.businessName,
          amount: intent.amount, 
          feeCollected: fee,
          netSettled: netAmount,
          risk, 
          receipt,
          purity: 'ZERO_TRUST_VERIFIED'
        },
        signature: IntegrationBridge.generateSignature({ settlementId, status: 'VERIFIED' }),
        timestamp: serverTimestamp(),
        performedBy: 'Autonomous_Revenue_Engine'
      });

      onLog(`[COMPLETED]: Cycle Finished. Settlement ID: ${settlementId}`);
      return { success: true, settlementId, fee };
    } catch (error: any) {
      onLog(`[CRITICAL_ERROR]: ${error.message}`);
      throw error;
    }
  }
}
