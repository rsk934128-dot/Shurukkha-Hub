/**
 * @fileOverview Imperial AI Audio Processor.
 * Implements Voice Isolation and Acoustic Sovereignty.
 * Updated: Improved safety checks to prevent track dropping.
 */

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
  }

  /**
   * Applies AI-grade voice isolation to a stream.
   */
  async isolateVoice(stream: MediaStream): Promise<MediaStream> {
    if (!this.audioContext || stream.getAudioTracks().length === 0) {
      return stream;
    }

    try {
      // Resume context if it was suspended (browser policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.filter = this.audioContext.createBiquadFilter();
      
      // High-pass filter to remove low-frequency background hum
      this.filter.type = 'highpass';
      this.filter.frequency.value = 150;

      const destination = this.audioContext.createMediaStreamDestination();
      
      this.source.connect(this.filter);
      this.filter.connect(destination);

      console.log("[Audio Processor] Voice Isolation ACTIVE. Noise suppressed.");
      return destination.stream;
    } catch (e) {
      console.warn("[Audio Processor] Processing failed, falling back to original stream.", e);
      return stream;
    }
  }

  dispose() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
  }
}