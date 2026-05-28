
/**
 * @fileOverview Sovereign API Gatekeeper Endpoint.
 * Acts as the entry point for all third-party and internal app communications.
 * Updated: Implements Offensive Counter-Strike responses for malicious actors.
 */

import { NextResponse } from 'next/server';
import { SovereignGuard } from '@/lib/sovereign-guard';
import { IntegrationBridge } from '@/lib/integration-bridge';
import { CounterIntelligence } from '@/lib/counter-intelligence';

export async function POST(request: Request) {
  const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
  const token = request.headers.get('X-Imperial-Token') || '';
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    const body = await request.json();

    // Step 1: Guard Interception (Pattern & Identity Check)
    const guardResult = await SovereignGuard.interceptRequest(requestId, body, token, ip, userAgent);

    // Offensive Reaction: Counter-Strike
    if (guardResult.status === 'COUNTER_STRIKE') {
      const strikePayload = CounterIntelligence.engageCounterStrike(guardResult.target || 'unknown');
      return new NextResponse(JSON.stringify(strikePayload), {
        status: 200, // Return 200 but with a payload that traps the bot
        headers: { 'X-Sovereign-Purity': 'STRIKE_ACTIVE', 'Content-Type': 'application/json' }
      });
    }

    if (guardResult.status === 'BLOCKED') {
      // Apply passive latency trap for standard blacklisted IPs
      await CounterIntelligence.applyLatencyTrap(ip);
      
      return NextResponse.json({ 
        status: 'DENIED', 
        requestId, 
        reason: guardResult.reason,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    // Step 2: Signature Validation & Success
    const signature = IntegrationBridge.generateSignature(body);

    return NextResponse.json({
      status: 'AUTHORIZED',
      requestId,
      signature,
      message: 'Sovereign Bridge Handshake Successful',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Gatekeeper Internal Failure' }, { status: 500 });
  }
}
