/**
 * @fileOverview Sovereign Communication Orchestrator.
 * Manages encrypted messaging and sync logic.
 * Phase 35.0: Fixed ServerTimestamp handling for robust delivery.
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

  static getInstance() {
    if (!this.instance) this.instance = new CommunicationOrchestrator();
    return this.instance;
  }

  static getChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
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
      if (navigator.onLine) {
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
      console.warn("[Comm] Queuing message locally.");
      DisasterStorage.addToSyncQueue('SEND_MESSAGE', { ...messageData, timestamp: Date.now() });
    }
  }
}
