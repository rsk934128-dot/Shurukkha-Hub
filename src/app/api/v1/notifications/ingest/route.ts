
/**
 * @fileOverview Universal Signal Ingestion API.
 * Receives notifications from external apps (Antivirus, Vouchers, etc.)
 * and stores them in designated folders.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IntegrationBridge } from '@/lib/integration-bridge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceApp, companyName, content, category, externalLink } = body;

    if (!sourceApp || !content) {
      return NextResponse.json({ status: 'ERROR', reason: 'MISSING_MANDATORY_FIELDS' }, { status: 400 });
    }

    const notifData = {
      sourceApp,
      companyName: companyName || sourceApp,
      content,
      category: category || 'General',
      status: 'unread',
      replies: [],
      externalLink: externalLink || null,
      timestamp: new Date().toISOString(),
      purity: 'VERIFIED_IMPERIAL'
    };

    // 1. Signature Validation Simulation
    const signature = IntegrationBridge.generateSignature(notifData);

    // 2. Storage in Firestore
    await addDoc(collection(db, "external_notifications"), notifData);

    // 3. Imperial Audit
    await addDoc(collection(db, "audit_trails"), {
      action: 'EXTERNAL_SIGNAL_INGESTED',
      details: { source: sourceApp, company: companyName },
      signature,
      timestamp: serverTimestamp(),
      performedBy: 'Sovereign_Ingest_Engine_v1'
    });

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Signal captured and sorted into folders.',
      signature
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ status: 'ERROR', message: 'Ingestion Internal Failure' }, { status: 500 });
  }
}
