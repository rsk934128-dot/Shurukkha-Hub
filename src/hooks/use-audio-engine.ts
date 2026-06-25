"use client"

/**
 * @fileOverview Sovereign Audio Engine Hook.
 * Manages high-definition sound effects for imperial notifications and calls.
 * Phase 36.5: Added Professional Synthesis with proactive context resumption.
 */

import { useCallback, useRef } from 'react'

export function useAudioEngine() {
  const audioContext = useRef<AudioContext | null>(null);

  const initContext = async () => {
    if (!audioContext.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        audioContext.current = new AudioCtx();
      }
    }
    
    if (audioContext.current && audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }
    return audioContext.current;
  };

  // Play a synthesized majestic digital chime for messages
  const playMessageSound = useCallback(async () => {
    const ctx = await initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, dur: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, start + dur);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(gainVal, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + dur);
    };

    // Majestic Sequence
    playTone(880, now, 0.4, 0.1);
    playTone(1320, now + 0.1, 0.3, 0.08);
    playTone(1760, now + 0.2, 0.2, 0.06);
  }, []);

  // Play a synthesized high-fidelity imperial ringtone for incoming calls
  const playAlertSound = useCallback(async () => {
    const ctx = await initContext();
    if (!ctx) return;

    // Imperial Harmony: Two-Tone Synthesis
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(440, now, 0.4);
    playTone(554.37, now + 0.1, 0.4);
    playTone(659.25, now + 0.2, 0.5);
    playTone(880, now + 0.3, 0.6);
  }, []);

  return { playMessageSound, playAlertSound };
}
