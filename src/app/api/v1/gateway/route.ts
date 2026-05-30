
/**
 * @fileOverview Global Gateway API Endpoint (Project 43).
 * Entry point for external developers to access the Sovereign Vault.
 */

import { NextResponse } from 'next/server';
import { IntegrationBridge } from '@/lib/integration-bridge';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  const gkey = request.headers.get('X-Imperial-Key') || '';
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const body = await request.json();

    // Step 1: Pre-flight Integrity Check
    const preFlight = await IntegrationBridge.preFlightCheck('gw-global-gateway', gkey);
    if (preFlight.status !== 'PASSED') {
      return NextResponse.json({ 
        status: 'DENIED', 
        reason: 'UNAUTHORIZED_GATEWAY_KEY',
        instruction: 'Contact core.sheikh admin for access.'
      }, { status: 403 });
    }

    console.log(`[Global Gateway] Access Granted to IP: ${ip} for action: ${body.action}`);

    // Step 2: Route Actions
    let responsePayload = {};
    if (body.action === 'GET_VAULT_STATUS') {
      responsePayload = {
        capacity: '5.0 TB',
        status: 'OPTIMAL',
        nodes: 42,
        integrity: 'RSA_V2_ACTIVE'
      };
    } else {
      responsePayload = { message: 'Action registered but not yet exposed in Beta.' };
    }

    // Step 3: Signature Generation
    const signature = IntegrationBridge.generateSignature(responsePayload);

    // Step 4: Imperial Audit
    await addDoc(collection(db, "audit_trails"), {
      action: 'GATEWAY_REQUEST_PROCESSED',
      details: { gkey: gkey.substring(0, 10) + '...', action: body.action, ip },
      signature,
      timestamp: serverTimestamp(),
      performedBy: 'Global_Gateway_v1'
    });

    return NextResponse.json({
      status: 'SUCCESS',
      payload: responsePayload,
      signature,
      timestamp: new Date().toISOString()
    }, { 
      status: 200,
      headers: { 'X-Sovereign-Purity': 'VERIFIED_IMPERIAL' }
    });

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Gateway Integration Fault' }, { status: 500 });
  }
}
