'use client';
/**
 * @fileOverview Sovereign Webhook Endpoint for bKash Merchant Handshake.
 * Handles challenge/response and payment notifications with RSA v2 verification.
 */

import { NextResponse } from 'next/server';
import { IntegrationBridge } from '@/lib/integration-bridge';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  // Imperial Handshake: Respond to verification challenges
  if (challenge) {
    console.log(`[Merchant Hook] Received Challenge: ${challenge}`);
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Sovereign Bridge Active', { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('X-Imperial-Signature');

    // Verify incoming payload signature
    const isValid = IntegrationBridge.verifySignature(body, signature || '');

    await addDoc(collection(db, "audit_trails"), {
      action: 'MERCHANT_WEBHOOK_RECEIVED',
      details: { ...body, verified: isValid },
      signature: signature,
      timestamp: serverTimestamp(),
      performedBy: 'sovereign_webhook_engine'
    });

    if (!isValid) {
      console.error("[Merchant Hook] Invalid Signature Detected");
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Process payment logic here...
    console.log(`[Merchant Hook] Payment Processed: ${body.amount} BDT`);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error("[Merchant Hook] Error processing webhook", error);
    return new NextResponse('Error', { status: 500 });
  }
}
