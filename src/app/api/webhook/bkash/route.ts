/**
 * @fileOverview Sovereign Webhook Endpoint for bKash Merchant Handshake.
 * Implements Validation & Settlement Engine for Autonomous Response Handling.
 */

import { NextResponse } from 'next/server';
import { IntegrationBridge } from '@/lib/integration-bridge';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  if (challenge) {
    console.log(`[Merchant Hook] Challenge Verified: ${challenge}`);
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Sovereign Bridge Active', { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('X-Imperial-Signature');

    // Step 1: Integrity Check (RSA v2 Verification)
    const isValid = IntegrationBridge.verifySignature(body, signature || '');

    // Step 2: Forensic Logging (Audit Trail)
    const auditData = {
      action: 'BKASH_RESPONSE_RECEIVED',
      details: { ...body, verificationStatus: isValid ? 'SUCCESS' : 'FAILED' },
      signature: signature,
      timestamp: serverTimestamp(),
      performedBy: 'sovereign_response_engine_v1'
    };

    await addDoc(collection(db, "audit_trails"), auditData);

    if (!isValid) {
      console.error("[Response Engine] Signature Mismatch Detected");
      return NextResponse.json({ status: 'UNAUTHORIZED', message: 'Signature Invalid' }, { status: 401 });
    }

    // Step 3: Success Parsing & Autonomous Settlement
    if (body.status === 'SUCCESS') {
      console.log(`[Response Engine] Transaction ${body.transactionId} Verified & Settled.`);
      
      // Potential logic here for direct balance update or signaling
      await IntegrationBridge.broadcastEvent({
        type: 'SETTLEMENT_COMPLETED',
        payload: { transactionId: body.transactionId, amount: body.amount },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      status: 'SUCCESS', 
      transactionId: body.transactionId,
      message: 'Autonomous Settlement Confirmed'
    }, { status: 200 });

  } catch (error) {
    console.error("[Response Engine] Critical Error", error);
    return NextResponse.json({ status: 'ERROR', message: 'Internal Validation Failure' }, { status: 500 });
  }
}
