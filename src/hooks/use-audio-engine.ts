
"use client"

/**
 * @fileOverview Sovereign Audio Engine Hook.
 * Manages high-definition sound effects for imperial notifications and calls.
 * Phase 35.5: Added Professional Synthesis for Imperial Ringtone.
 */

import { useCallback, useRef } from 'react'

export function useAudioEngine() {
  const audioContext = useRef<AudioContext | null>(null);

  const initContext = () => {
    if (!audioContext.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        audioContext.current = new AudioCtx();
      }
    }
  };

  // Play a synthesized imperial chime for messages
  const playMessageSound = useCallback(() => {
    initContext();
    const ctx = audioContext.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  }, []);

  // Play a synthesized high-fidelity imperial ringtone for incoming calls
  const playAlertSound = useCallback(() => {
    initContext();
    const ctx = audioContext.current!;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

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
    // Sequence of tones for a distinct "Imperial" alert
    playTone(440, now, 0.4);
    playTone(554.37, now + 0.1, 0.4); // C#
    playTone(659.25, now + 0.2, 0.5); // E
    playTone(880, now + 0.3, 0.6);   // A
  }, []);

  return { playMessageSound, playAlertSound };
}
