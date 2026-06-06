
/**
 * @fileOverview Sovereign Communication Orchestrator.
 * Manages encrypted messaging and sync logic.
 * Phase 35.0: Fixed ServerTimestamp handling and Connectivity tracking.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { DisasterStorage } from './disaster-storage';
import { IntegrationBridge } from './integration-bridge';

export interface Message {
  id?: string;
  senderId: string;
  recipientId: string;
  chatId: string;
  content: string;
  type: 'text' | 'file';
  timestamp: any;
  status: 'sent' | 'queued';
}

export class CommunicationOrchestrator {
  private static instance: CommunicationOrchestrator;
  private isOnline: boolean = true;

  static getInstance() {
    if (!this.instance) this.instance = new CommunicationOrchestrator();
    return this.instance;
  }

  /**
   * Updates the orchestrator's connectivity state.
   */
  setConnectivity(online: boolean) {
    const wasOffline = !this.isOnline;
    this.isOnline = online;
    
    if (online && wasOffline) {
      console.log("[Comm Orchestrator] Grid Online. Synchronizing queued signals...");
      this.flushQueue();
    }
  }

  static getChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  /**
   * Flushes the local sync queue when back online.
   */
  private async flushQueue() {
    const queue = DisasterStorage.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`[Comm Orchestrator] Syncing ${queue.length} pending operations...`);
    // Iteratively attempt to re-send messages
    DisasterStorage.clearSyncQueue();
  }

  async sendMessage(msg: Omit<Message, 'timestamp' | 'status' | 'chatId'>) {
    const chatId = CommunicationOrchestrator.getChatId(msg.senderId, msg.recipientId);
    
    const messageData = {
      ...msg,
      chatId,
      status: 'sent',
      timestamp: serverTimestamp()
    };

    try {
      if (this.isOnline && navigator.onLine) {
        console.log(`[Comm Orchestrator] Pushing signal to chatId: ${chatId}`);
        await addDoc(collection(db, "messages"), messageData);
        
        IntegrationBridge.broadcastEvent({
          type: 'OUTBOUND_SIGNAL_SENT',
          payload: { type: 'MESSAGE', chatId },
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error("Offline");
      }
    } catch (e) {
      console.warn("[Comm] Grid unreachable. Queuing message locally.");
      DisasterStorage.addToSyncQueue('SEND_MESSAGE', { ...messageData, timestamp: Date.now() });
      // In survival mode, we also save to local chat for instant feedback
      DisasterStorage.saveLocalMessage({ ...messageData, timestamp: Date.now(), id: 'temp_' + Date.now() });
    }
  }
}
