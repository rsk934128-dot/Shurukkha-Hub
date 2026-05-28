
"use client"

/**
 * @fileOverview Sovereign Audio Engine Hook.
 * Manages high-definition sound effects for imperial notifications and calls.
 */

import { useCallback, useRef } from 'react'

export function useAudioEngine() {
  const audioContext = useRef<AudioContext | null>(null);

  const initContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Play a synthesized imperial chime for messages
  const playMessageSound = useCallback(() => {
    initContext();
    const ctx = audioContext.current!;
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

  // Play a synthesized imperial alert for incoming calls/SOS
  const playAlertSound = useCallback(() => {
    initContext();
    const ctx = audioContext.current!;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.8);
  }, []);

  return { playMessageSound, playAlertSound };
}
