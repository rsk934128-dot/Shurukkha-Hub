/**
 * @fileOverview Offline-first storage utility for disaster intelligence and reports.
 * Uses localStorage to persist data during network outages.
 */

import { GenerateFloodSurvivalAdviceOutput } from "@/ai/flows/generate-flood-survival-advice";

const STORAGE_KEYS = {
  ADVICE_HISTORY: 'shurukkha_advice_history',
  INCIDENT_REPORTS: 'shurukkha_reports',
  SOS_STATUS: 'shurukkha_sos_active'
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

  // Save incident reports locally
  saveReport: (report: any) => {
    if (typeof window === 'undefined') return;
    const reports = DisasterStorage.getReports();
    localStorage.setItem(STORAGE_KEYS.INCIDENT_REPORTS, JSON.stringify([...reports, report]));
  },

  getReports: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.INCIDENT_REPORTS);
    return stored ? JSON.parse(stored) : [];
  },

  setSOS: (active: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SOS_STATUS, JSON.stringify(active));
  },

  getSOS: (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEYS.SOS_STATUS);
    return stored ? JSON.parse(stored) : false;
  }
};
