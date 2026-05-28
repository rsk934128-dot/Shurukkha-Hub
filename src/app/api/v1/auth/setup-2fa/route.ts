/**
 * @fileOverview 2FA Setup API.
 * Issues TOTP Secret and QR Code for new registrations.
 */

import { NextResponse } from 'next/server';
import { TOTPEngine } from '@/lib/totp-engine';
import { IntegrationBridge } from '@/lib/integration-bridge';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    // Verify Sovereign Token
    if (!token || !token.startsWith('est_')) {
      return NextResponse.json({ status: 'ERROR', reason: 'UNAUTHORIZED' }, { status: 401 });
    }

    console.log(`[Sovereign 2FA] Initiating Setup for: ${email}`);
    
    const setupData = await TOTPEngine.generateSetupData(email);
    const signature = IntegrationBridge.generateSignature({ email, type: '2FA_SETUP' });

    return NextResponse.json({
      status: 'SUCCESS',
      secret: setupData.secret,
      qrCode: setupData.qrDataUri,
      signature
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: '2FA Setup Failed' }, { status: 500 });
  }
}
