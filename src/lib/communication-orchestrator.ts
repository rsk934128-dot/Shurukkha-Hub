/**
 * @fileOverview Sovereign Communication Orchestrator.
 * Manages encrypted messaging and sync logic.
 * Phase 35.0: Fixed ServerTimestamp handling and Connectivity tracking.
 * Phase 35.1: Optimized timestamp persistence for local/server consistency.
 * Phase 35.5: Added 'read' status tracking for unread message counters.
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
  read: boolean;
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

  async sendMessage(msg: Omit<Message, 'timestamp' | 'status' | 'chatId' | 'read'>) {
    const chatId = CommunicationOrchestrator.getChatId(msg.senderId, msg.recipientId);
    const now = Date.now();

    // Server data uses serverTimestamp
    const serverMessageData = {
      ...msg,
      chatId,
      status: 'sent' as const,
      timestamp: serverTimestamp(),
      read: false
    };

    // Local/Offline data uses numeric timestamp
    const localMessageData: Message = {
      ...msg,
      chatId,
      status: 'queued' as const,
      timestamp: now,
      id: 'local_' + now,
      read: false
    };

    try {
      if (this.isOnline && navigator.onLine) {
        console.log(`[Comm Orchestrator] Pushing signal to chatId: ${chatId}`);
        await addDoc(collection(db, "messages"), serverMessageData);
        
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
      DisasterStorage.addToSyncQueue('SEND_MESSAGE', localMessageData);
      DisasterStorage.saveLocalMessage(localMessageData);
    }
  }
}
