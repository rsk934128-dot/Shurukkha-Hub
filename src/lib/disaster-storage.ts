/**
 * @fileOverview Offline-first storage utility with DEOS Survival Queue.
 * Persists critical data and manages an outgoing sync queue for network recovery.
 */

import { GenerateFloodSurvivalAdviceOutput } from "@/ai/flows/generate-flood-survival-advice";

const STORAGE_KEYS = {
  ADVICE_HISTORY: 'shurukkha_advice_history',
  INCIDENT_REPORTS: 'shurukkha_reports',
  SOS_STATUS: 'shurukkha_sos_active',
  SYNC_QUEUE: 'shurukkha_sync_queue',
  LOCAL_MESSAGES: 'shurukkha_local_chat'
};

export const DisasterStorage = {
  // Save AI Advice for offline viewing
  saveAdvice: (advice: GenerateFloodSurvivalAdviceOutput) => {
    if (typeof window === 'undefined') return;
    const history = DisasterStorage.getAdviceHistory();
    const newEntry = {
      ...advice,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem(STORAGE_KEYS.ADVICE_HISTORY, JSON.stringify([newEntry, ...history].slice(0, 10)));
  },

  getAdviceHistory: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ADVICE_HISTORY);
    return stored ? JSON.parse(stored) : [];
  },

  // Survival Mode Queue Management
  addToSyncQueue: (action: string, payload: any) => {
    if (typeof window === 'undefined') return;
    const queue = DisasterStorage.getSyncQueue();
    const entry = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      action,
      payload,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([...queue, entry]));
  },

  getSyncQueue: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return stored ? JSON.parse(stored) : [];
  },

  clearSyncQueue: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  },

  // Chat Local Persistence for Offline Mode
  saveLocalMessage: (msg: any) => {
    if (typeof window === 'undefined') return;
    const messages = DisasterStorage.getLocalMessages();
    localStorage.setItem(STORAGE_KEYS.LOCAL_MESSAGES, JSON.stringify([...messages, msg].slice(-50)));
  },

  getLocalMessages: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_MESSAGES);
    return stored ? JSON.parse(stored) : [];
  },

  // Legacy report storage
  saveReport: (report: any) => {
    if (typeof window === 'undefined') return;
    const reports = DisasterStorage.getReports();
    localStorage.setItem(STORAGE_KEYS.INCIDENT_REPORTS, JSON.stringify([...reports, report]));
    DisasterStorage.addToSyncQueue('REPORT_INCIDENT', report);
  },

  getReports: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.INCIDENT_REPORTS);
    return stored ? JSON.parse(stored) : [];
  },

  clearReports: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.INCIDENT_REPORTS);
  },

  setSOS: (active: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SOS_STATUS, JSON.stringify(active));
    if (active) DisasterStorage.addToSyncQueue('SOS_TRIGGER', { status: 'pending' });
  },

  getSOS: (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEYS.SOS_STATUS);
    return stored ? JSON.parse(stored) : false;
  }
};
