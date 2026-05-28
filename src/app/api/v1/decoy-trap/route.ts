
/**
 * @fileOverview Honeypot Decoy Trap Endpoint.
 * Captures scanners and bots attempting to find vulnerable endpoints.
 */

import { NextResponse } from 'next/server';
import { IntelligenceEngine } from '@/lib/intelligence-engine';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: Request) {
  return handleCapture(request);
}

export async function POST(request: Request) {
  return handleCapture(request);
}

async function handleCapture(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.warn(`[Honeypot Trap] ATTEMPT DETECTED from ${ip}`);

  // 1. Log the capture
  await IntelligenceEngine.logIncident({
    ip,
    source: 'honeypot',
    violationType: 'UNAUTHORIZED_SCANNING',
    metadata: { userAgent, path: '/api/v1/decoy-trap' }
  });

  // 2. Imperial Audit
  await addDoc(collection(db, "audit_trails"), {
    action: 'HONEYPOT_CAPTURE',
    details: { ip, userAgent, reason: 'Endpoint Scanning' },
    timestamp: serverTimestamp(),
    performedBy: 'sovereign_trap_v1'
  });

  // 3. Return a confusing response to delay the attacker
  return new NextResponse(JSON.stringify({
    status: 'AUTHENTICATION_REQUIRED',
    error: 'Access Denied',
    handshake: 'failure',
    retry_after: 86400
  }), { 
    status: 401,
    headers: { 'X-Imperial-Security': 'Intercepted' }
  });
}
