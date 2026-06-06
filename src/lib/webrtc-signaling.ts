'use client';

/**
 * @fileOverview Overhauled WebRTC Signaling Service for Shurukkha Hub.
 * Optimized Phase 35.0: Locked-Identity Stream Protocol with Aggressive Resource Purge.
 * Updated Phase 36.1: Implemented Total Track Destruction for dual-side security.
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
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
  private trackedTracks: Set<MediaStreamTrack> = new Set();

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
   * Aggressively stops all tracks in a stream and ensures device release.
   */
  static stopMediaStream(stream: MediaStream | null) {
    if (!stream) return;
    stream.getTracks().forEach(track => {
      try {
        track.enabled = false;
        track.stop();
        console.log(`[Imperial Purge] Hardware Forcefully Released: ${track.kind}`);
      } catch (e) {}
    });
  }

  private trackTracks(stream: MediaStream) {
    stream.getTracks().forEach(track => {
      this.trackedTracks.add(track);
      track.onended = () => {
        console.log(`[Imperial Purge] Track self-terminated: ${track.kind}`);
      };
    });
  }

  private async getProcessedStream(originalStream: MediaStream): Promise<MediaStream> {
    this.trackTracks(originalStream);
    const optimizedStream = await AVController.optimizeStream(originalStream);
    const isolatedStream = await this.audioProcessor.isolateVoice(optimizedStream);
    
    const finalStream = new MediaStream();
    isolatedStream.getAudioTracks().forEach(track => {
      finalStream.addTrack(track);
      this.trackedTracks.add(track);
    });
    originalStream.getVideoTracks().forEach(track => {
      finalStream.addTrack(track);
      this.trackedTracks.add(track);
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
          this.trackedTracks.add(track);
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

    await setDoc(sessionRef, { offer: { sdp: offerDescription.sdp, type: offerDescription.type }, status: 'ringing' }, { merge: true });

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
        this.remoteStream.addTrack(track);
        this.trackedTracks.add(track);
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

  /**
   * Complete teardown of all media and network resources.
   */
  dispose() {
    console.warn("[Imperial Purge] Executing Nuclear Hardware Shutdown...");
    this.isDisposed = true;
    
    // 1. Stop all tracked tracks (Local and Remote)
    this.trackedTracks.forEach(track => {
      try {
        track.enabled = false;
        track.stop();
        console.log(`[Purge] Track destroyed: ${track.kind}`);
      } catch (e) {}
    });
    this.trackedTracks.clear();

    // 2. Clear remote stream
    this.remoteStream.getTracks().forEach(t => t.stop());

    // 3. Close Peer Connection
    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach(s => {
        if (s.track) s.track.stop();
      });
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // 4. Dispose Audio Processor and Subscriptions
    this.audioProcessor.dispose();
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    
    console.log("[Imperial Purge] Resource purge 100% complete.");
  }
}