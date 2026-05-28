/**
 * @fileOverview 2FA Verification API.
 * Validates TOTP tokens and grants Imperial Session Upgrade.
 */

import { NextResponse } from 'next/server';
import { TOTPEngine } from '@/lib/totp-engine';
import { IntegrationBridge } from '@/lib/integration-bridge';

export async function POST(request: Request) {
  try {
    const { token, secret, userToken } = await request.json();

    if (!token || !secret) {
      return NextResponse.json({ status: 'ERROR', reason: 'MISSING_DATA' }, { status: 400 });
    }

    const isValid = TOTPEngine.verifyToken(token, secret);

    if (isValid) {
      console.log(`[Sovereign 2FA] Identity VERIFIED ✅`);
      const upgradeToken = 'est_2fa_' + IntegrationBridge.generateEphemeralToken().substring(4);
      
      return NextResponse.json({
        status: 'VERIFIED',
        upgradeToken,
        signature: IntegrationBridge.generateSignature({ status: 'VERIFIED' })
      }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'DENIED', reason: 'INVALID_CODE' }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Verification Internal Failure' }, { status: 500 });
  }
}
