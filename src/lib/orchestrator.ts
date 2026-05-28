/**
 * @fileOverview Autonomous Orchestrator for Shurukkha Hub.
 * Coordinates between SOS triggers, AI flows, and the Dispatcher console.
 * UPDATED Phase 31.0: Added Drone Deployment and Impact Analysis.
 */

import { db } from './firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, arrayUnion, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { suggestResponder } from '@/ai/flows/suggest-responder-flow';
import { generateFloodSurvivalAdvice } from '@/ai/flows/generate-flood-survival-advice';
import { IntegrationBridge } from './integration-bridge';
import { FloodDataService } from './flood-data-service';
import { DroneService } from './drone-service';
import { ImpactAnalyzer } from './impact-analyzer';

const MOCK_RESPONDERS = [
  { id: 'r1', name: "সদর থানা টিম এ", type: "Police", location: "সিরাজগঞ্জ বাজার", status: "available", gear: ["First-Aid", "Radio"] },
  { id: 'r2', name: "ফায়ার সার্ভিস ইউনিট ১", type: "Fire", location: "স্টেশন রোড", status: "available", gear: ["Rescue Boat", "Life-Jacket"] },
  { id: 'r3', name: "রেড ক্রিসেন্ট ভলান্টিয়ার", type: "Volunteer", location: "সিরাজগঞ্জ কলেজ", status: "available", gear: ["Dry Food", "Medical Kit"] },
];

export class AutonomousOrchestrator {
  private static isAutoMode = false;
  private static floodMonitorInterval: any = null;

  static setAutoMode(enabled: boolean) {
    this.isAutoMode = enabled;
    console.log(`[Orchestrator] Iron Logic Mode: ${enabled ? 'ACTIVE' : 'INACTIVE'}`);
    
    if (enabled) {
      this.startFloodIntelligenceMonitor();
    } else {
      if (this.floodMonitorInterval) clearInterval(this.floodMonitorInterval);
    }
  }

  static startMonitoring() {
    const q = query(collection(db, "sos_alerts"), where("status", "==", "pending"));
    
    return onSnapshot(q, async (snapshot) => {
      if (!this.isAutoMode) return;

      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alert = { id: change.doc.id, ...change.doc.data() } as any;
          if (alert.assignedResponder) continue;
          
          await this.processAlertAutonomously(alert);
        }
      }
    });
  }

  /**
   * Autonomous Flood Intelligence Monitor.
   * Periodically checks telemetry and triggers global evacuation alerts if needed.
   */
  private static async startFloodIntelligenceMonitor() {
    this.floodMonitorInterval = setInterval(async () => {
      console.log("[Intelligence Monitor] Scanning River Telemetry...");
      const telemetry = await FloodDataService.getLatestTelemetry();
      
      if (telemetry.waterLevel > telemetry.dangerLevel) {
        const advice = await generateFloodSurvivalAdvice({
          jamunaWaterLevel: telemetry.waterLevel,
          dangerLevelThreshold: telemetry.dangerLevel,
          weatherForecast: "Rising waters detected",
          currentLocation: "Global District Monitoring",
          nearbyShelters: []
        });

        if (advice.automaticAlertTriggered) {
          await this.broadcastGlobalEvacuation(advice);
          
          // Phase 31.0: Deploy Drones for Ground Verification
          const area = advice.predictiveAnalytics?.hotspots[0] || "Various Locations";
          await DroneService.deployToLocation(area);

          // Phase 31.0: Run Financial Impact Simulation
          const impact = await ImpactAnalyzer.analyzeImpact(advice.riskLevel, area);
          await this.recordImpactAudit(impact);
        }
      }
    }, 60000); // Check every minute
  }

  private static async recordImpactAudit(impact: any) {
    await addDoc(collection(db, "audit_trails"), {
      action: 'FINANCIAL_IMPACT_SIMULATED',
      details: impact,
      signature: IntegrationBridge.generateSignature(impact),
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Economic_AI'
    });
  }

  private static async broadcastGlobalEvacuation(advice: any) {
    console.warn(`[CRITICAL] AUTONOMOUS EVACUATION TRIGGERED!`);
    
    await addDoc(collection(db, "sos_alerts"), {
      timestamp: serverTimestamp(),
      location: advice.predictiveAnalytics?.hotspots.join(', ') || "Various Locations",
      status: 'pending',
      type: 'AUTONOMOUS_EVACUATION_WARNING',
      note: advice.advice,
      automated: true,
      purity: 'SOVEREIGN_V31'
    });

    await addDoc(collection(db, "audit_trails"), {
      action: 'GLOBAL_EVACUATION_TRIGGERED',
      details: { riskLevel: advice.riskLevel, source: 'AI_PREDICTION_PIPELINE' },
      signature: IntegrationBridge.generateSignature({ level: 'CRITICAL' }),
      timestamp: serverTimestamp(),
      performedBy: 'Autonomous_Iron_Logic'
    });
  }

  private static async processAlertAutonomously(alert: any) {
    console.log(`[Iron Logic] Analyzing SOS ID: ${alert.id}...`);
    
    try {
      const startTime = performance.now();

      const recommendation = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      });

      if (!recommendation || !recommendation.recommendedResponderId) {
        throw new Error("AI Recommendation Fault");
      }

      const responder = MOCK_RESPONDERS.find(r => r.id === recommendation.recommendedResponderId);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(3);

      const alertRef = doc(db, "sos_alerts", alert.id);
      await updateDoc(alertRef, {
        status: 'dispatched',
        assignedResponder: recommendation.recommendedResponderId,
        timeline: arrayUnion({
          status: 'dispatched',
          note: `[IRON_LOGIC_AUTO] ${recommendation.reasoning}.`,
          timestamp: new Date().toISOString(),
          automated: true,
          purity: 'VERIFIED_IMPERIAL'
        })
      });

      await addDoc(collection(db, "audit_trails"), {
        action: 'AUTONOMOUS_IRON_DISPATCH',
        details: { alertId: alert.id, responderId: recommendation.recommendedResponderId, executionTime: `${executionTime}ms` },
        signature: IntegrationBridge.generateSignature({ alertId: alert.id }),
        timestamp: serverTimestamp(),
        performedBy: 'Autonomous_Iron_Logic_v31'
      });

      IntegrationBridge.broadcastEvent({
        type: 'STATUS_UPDATED',
        payload: { alertId: alert.id, status: 'dispatched' },
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("[Iron Logic] Execution Failed", error);
    }
  }
}
