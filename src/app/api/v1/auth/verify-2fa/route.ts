/**
 * @fileOverview 2FA Verification API.
 * Validates TOTP tokens and grants Imperial Session Upgrade.
 * Integrated with AuditLogger and AutoLockdown.
 */

import { NextResponse } from 'next/server';
import { TOTPEngine } from '@/lib/totp-engine';
import { IntegrationBridge } from '@/lib/integration-bridge';
import { AuditLogger } from '@/lib/audit-logger';
import { AutoLockdown } from '@/lib/auto-lockdown';

export async function POST(request: Request) {
  try {
    const { token, secret, userEmail } = await request.json();

    if (!token || !secret) {
      return NextResponse.json({ status: 'ERROR', reason: 'MISSING_DATA' }, { status: 400 });
    }

    const isValid = TOTPEngine.verifyToken(token, secret);

    if (isValid) {
      console.log(`[Sovereign 2FA] Identity VERIFIED ✅`);
      AutoLockdown.resetAttempts(userEmail || 'unknown');
      
      await AuditLogger.logEvent('2FA_VERIFIED', { email: userEmail }, userEmail);
      
      const upgradeToken = 'est_2fa_' + IntegrationBridge.generateEphemeralToken().substring(4);
      
      return NextResponse.json({
        status: 'VERIFIED',
        upgradeToken,
        signature: IntegrationBridge.generateSignature({ status: 'VERIFIED' })
      }, { status: 200 });
    } else {
      const isLocked = await AutoLockdown.trackFailure(userEmail || 'unknown');
      
      await AuditLogger.logEvent('2FA_FAILED', { 
        email: userEmail, 
        reason: 'INVALID_CODE',
        lockdownTriggered: isLocked 
      });

      return NextResponse.json({ 
        status: isLocked ? 'LOCKED' : 'DENIED', 
        reason: isLocked ? 'ACCOUNT_ISOLATED' : 'INVALID_CODE' 
      }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Verification Internal Failure' }, { status: 500 });
  }
}
