'use client';

/**
 * @fileOverview Overhauled WebRTC Signaling Service for Shurukkha Hub.
 * Restored Phase 36.6: Enhanced Universal Hardware Nuclear Purge with total reset.
 * Phase 37.5: Sovereign Nuclear Kill-Switch with Global Track Registry.
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { AVController } from './av-controller';
import { AudioProcessor } from './audio-processor';

export class WebRTCManager {
  private sessionId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private candidateQueue: RTCIceCandidateInit[] = [];
  private isProcessingRemoteDescription = false;
  private remoteStream: MediaStream = new MediaStream();
  private isDisposed = false;
  private audioProcessor: AudioProcessor = new AudioProcessor();
  private unsubscribers: (() => void)[] = [];
  
  // Imperial Global Registry: Ensures no track ever escapes termination
  private static globalTrackRegistry: Set<MediaStreamTrack> = new Set();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 5,
  };

  static getAudioConstraints() {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    };
  }

  /**
   * Registers a track into the Imperial Sovereign Registry.
   */
  static registerTrack(track: MediaStreamTrack) {
    this.globalTrackRegistry.add(track);
    console.log(`[Imperial Registry] Track Registered: ${track.kind} (${track.id})`);
    
    track.onended = () => {
      this.globalTrackRegistry.delete(track);
    };
  }

  /**
   * SOVEREIGN NUCLEAR PURGE: 
   * Aggressively stops ALL tracks registered in the global registry and clears them.
   */
  static nuclearHardwarePurge() {
    console.warn(`[Sovereign Purge] Initiating GLOBAL HARDWARE KILL-SWITCH...`);
    
    this.globalTrackRegistry.forEach(track => {
      try {
        track.enabled = false;
        track.stop();
        console.log(`[Nuclear Purge] SHUTDOWN SUCCESS: ${track.kind} (${track.id})`);
      } catch (e) {
        console.error(`[Nuclear Purge] Shutdown Failed for track: ${track.id}`, e);
      }
    });

    this.globalTrackRegistry.clear();
    console.log(`[Sovereign Purge] Hardware Registry CLEARED. All devices released.`);
  }

  /**
   * Legacy method for individual stream stopping.
   */
  static stopMediaStream(stream: MediaStream | null) {
    if (!stream) return;
    stream.getTracks().forEach(track => {
      track.enabled = false;
      track.stop();
    });
  }

  private async getProcessedStream(originalStream: MediaStream): Promise<MediaStream> {
    // Register incoming tracks
    originalStream.getTracks().forEach(t => WebRTCManager.registerTrack(t));
    
    const optimizedStream = await AVController.optimizeStream(originalStream);
    const isolatedStream = await this.audioProcessor.isolateVoice(optimizedStream);
    
    const finalStream = new MediaStream();
    
    isolatedStream.getAudioTracks().forEach(track => {
      finalStream.addTrack(track);
      WebRTCManager.registerTrack(track); // Register isolated tracks
    });
    
    originalStream.getVideoTracks().forEach(track => {
      finalStream.addTrack(track);
      // Already registered in originalStream loop
    });
    
    return finalStream;
  }

  async createCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    if (this.isDisposed) return;

    const streamToSend = await this.getProcessedStream(localStream);
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    this.peerConnection.ontrack = (event) => {
      if (this.isDisposed) return;
      event.streams[0].getTracks().forEach((track) => {
        if (!this.remoteStream.getTracks().find(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
          WebRTCManager.registerTrack(track); // Register remote tracks
        }
      });
      onRemoteStream(this.remoteStream);
    };

    streamToSend.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, streamToSend);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && !this.isDisposed) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'caller' });
      }
    };

    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    await setDoc(sessionRef, { 
      offer: { sdp: offerDescription.sdp, type: offerDescription.type }, 
      status: 'ringing',
      startTime: serverTimestamp() 
    }, { merge: true });

    const unsubSession = onSnapshot(sessionRef, async (snapshot) => {
      if (this.isDisposed || !this.peerConnection) return;
      const data = snapshot.data();
      if (data?.answer && !this.isProcessingRemoteDescription && this.peerConnection.signalingState === 'have-local-offer') {
        this.isProcessingRemoteDescription = true;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        await this.flushCandidates();
        this.isProcessingRemoteDescription = false;
      }
    });

    const unsubCandidates = onSnapshot(candidatesCollection, (snapshot) => {
      if (this.isDisposed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && change.doc.data().owner !== 'caller') {
          this.addCandidate(change.doc.data());
        }
      });
    });

    this.unsubscribers.push(unsubSession, unsubCandidates);
  }

  async answerCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    if (this.isDisposed) return;

    const streamToSend = await this.getProcessedStream(localStream);
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.ontrack = (event) => {
      if (this.isDisposed) return;
      event.streams[0].getTracks().forEach((track) => {
        if (!this.remoteStream.getTracks().find(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
          WebRTCManager.registerTrack(track); // Register remote tracks
        }
      });
      onRemoteStream(this.remoteStream);
    };

    streamToSend.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, streamToSend);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && !this.isDisposed) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'recipient' });
      }
    };

    const unsubSession = onSnapshot(sessionRef, async (snapshot) => {
      if (this.isDisposed || !this.peerConnection) return;
      const data = snapshot.data();
      if (data?.offer && !this.isProcessingRemoteDescription && this.peerConnection.signalingState === 'stable') {
        this.isProcessingRemoteDescription = true;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        await updateDoc(sessionRef, { answer: { type: answer.type, sdp: answer.sdp } });
        await this.flushCandidates();
        this.isProcessingRemoteDescription = false;
      }
    });

    const unsubCandidates = onSnapshot(candidatesCollection, (snapshot) => {
      if (this.isDisposed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && change.doc.data().owner !== 'recipient') {
          this.addCandidate(change.doc.data());
        }
      });
    });

    this.unsubscribers.push(unsubSession, unsubCandidates);
  }

  private async addCandidate(candidate: any) {
    if (!this.peerConnection || this.isDisposed) return;
    if (this.peerConnection.remoteDescription) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  private async flushCandidates() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    }
  }

  dispose() {
    console.warn("[Imperial Purge] Disposing WebRTC Manager Instance...");
    this.isDisposed = true;
    
    // Static purge is the definitive kill
    WebRTCManager.nuclearHardwarePurge();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.audioProcessor.dispose();
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}
