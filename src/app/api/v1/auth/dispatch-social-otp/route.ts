/**
 * @fileOverview Social OTP Dispatcher API.
 * Simulates sending OTP to WhatsApp/Telegram and logs the audit event.
 */

import { NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit-logger';
import { IntegrationBridge } from '@/lib/integration-bridge';

export async function POST(request: Request) {
  try {
    const { phoneNumber, platform } = await request.json();

    if (!phoneNumber || !platform) {
      return NextResponse.json({ status: 'ERROR', reason: 'INVALID_REQUEST' }, { status: 400 });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`[Sovereign Social] Dispatching ${platform.toUpperCase()} OTP to: ${phoneNumber}`);
    
    // 2. Imperial Audit
    await AuditLogger.logEvent('OTP_DISPATCHED', { 
      target: phoneNumber, 
      platform,
      method: 'SOCIAL_DISPATCH',
      signature: IntegrationBridge.generateSignature({ phoneNumber, platform })
    });

    // 3. Return success and the simulated OTP
    return NextResponse.json({
      status: 'SUCCESS',
      otp,
      platform,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Social Dispatch Failure' }, { status: 500 });
  }
}
