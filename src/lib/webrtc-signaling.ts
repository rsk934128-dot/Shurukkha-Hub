
'use client';

/**
 * @fileOverview Overhauled WebRTC Signaling Service for Shurukkha Hub.
 * Optimized Phase 32.2: Locked-Identity Stream Protocol and Studio-Grade AV Sync.
 * Updated: Hardened against InvalidStateError and race conditions in signaling.
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  getDoc,
  deleteDoc,
  query,
  getDocs
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

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  static getAudioConstraints() {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 48000,
    };
  }

  async createCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    if (this.isDisposed) return;

    const optimizedStream = await AVController.optimizeStream(localStream);
    const isolatedStream = await this.audioProcessor.isolateVoice(optimizedStream);

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    this.peerConnection.ontrack = (event) => {
      if (this.isDisposed) return;
      console.log("[WebRTC] Remote signal locked.");
      event.streams[0].getTracks().forEach((track) => {
        if (!this.remoteStream.getTracks().find(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      onRemoteStream(this.remoteStream);
    };

    isolatedStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, isolatedStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && !this.isDisposed) {
        const candidateData = event.candidate.toJSON();
        addDoc(candidatesCollection, { 
          candidate: candidateData.candidate,
          sdpMid: candidateData.sdpMid,
          sdpMLineIndex: candidateData.sdpMLineIndex,
          usernameFragment: candidateData.usernameFragment,
          owner: 'caller' 
        }).catch(() => {});
      }
    };

    const offerDescription = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    // Clear stale answer and candidates from previous attempts to prevent state mismatch
    await setDoc(sessionRef, { offer, answer: null, status: 'ringing' }, { merge: true });

    const unsubSession = onSnapshot(sessionRef, async (snapshot) => {
      if (this.isDisposed || !this.peerConnection) return;
      const data = snapshot.data();
      
      // Strict state check: only process answer if we are in 'have-local-offer' state
      if (data?.answer && !this.isProcessingRemoteDescription && this.peerConnection.signalingState === 'have-local-offer') {
        this.isProcessingRemoteDescription = true;
        try {
          if (this.peerConnection.signalingState === 'have-local-offer') {
            const answerDesc = new RTCSessionDescription(data.answer);
            await this.peerConnection.setRemoteDescription(answerDesc);
            await this.flushCandidates();
          }
        } catch (e) {
          console.error("[WebRTC] Answer processing fault:", e);
        } finally {
          this.isProcessingRemoteDescription = false;
        }
      }
    });

    const unsubCandidates = onSnapshot(candidatesCollection, (snapshot) => {
      if (this.isDisposed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.owner !== 'caller') {
            const { candidate, sdpMid, sdpMLineIndex, usernameFragment } = data;
            if (candidate) {
              this.addCandidate({ candidate, sdpMid, sdpMLineIndex, usernameFragment });
            }
          }
        }
      });
    });

    return () => {
      unsubSession();
      unsubCandidates();
    };
  }

  async answerCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    if (this.isDisposed) return;

    const optimizedStream = await AVController.optimizeStream(localStream);
    const isolatedStream = await this.audioProcessor.isolateVoice(optimizedStream);

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.ontrack = (event) => {
      if (this.isDisposed) return;
      console.log("[WebRTC] Inbound stream recognized.");
      event.streams[0].getTracks().forEach((track) => {
        if (!this.remoteStream.getTracks().find(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      onRemoteStream(this.remoteStream);
    };

    isolatedStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, isolatedStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && !this.isDisposed) {
        const candidateData = event.candidate.toJSON();
        addDoc(candidatesCollection, { 
          candidate: candidateData.candidate,
          sdpMid: candidateData.sdpMid,
          sdpMLineIndex: candidateData.sdpMLineIndex,
          usernameFragment: candidateData.usernameFragment,
          owner: 'recipient' 
        }).catch(() => {});
      }
    };

    // Reactive offer processing
    const unsubSession = onSnapshot(sessionRef, async (snapshot) => {
      if (this.isDisposed || !this.peerConnection) return;
      const data = snapshot.data();
      
      if (data?.offer && !this.isProcessingRemoteDescription && this.peerConnection.signalingState === 'stable') {
        this.isProcessingRemoteDescription = true;
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answerDescription = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answerDescription);

          await updateDoc(sessionRef, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } });
          await this.flushCandidates();
        } catch (e) {
          console.error("[WebRTC] Offer processing fault:", e);
        } finally {
          this.isProcessingRemoteDescription = false;
        }
      }
    });

    const unsubCandidates = onSnapshot(candidatesCollection, (snapshot) => {
      if (this.isDisposed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.owner !== 'recipient') {
            const { candidate, sdpMid, sdpMLineIndex, usernameFragment } = data;
            if (candidate) {
              this.addCandidate({ candidate, sdpMid, sdpMLineIndex, usernameFragment });
            }
          }
        }
      });
    });

    return () => {
      unsubSession();
      unsubCandidates();
    };
  }

  private async addCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection || this.isDisposed) return;
    if (this.peerConnection.remoteDescription && !this.isProcessingRemoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[WebRTC] Candidate addition skipped:", e);
      }
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  private async flushCandidates() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription || this.isDisposed) return;
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[WebRTC] Queued candidate addition fault:", e);
        }
      }
    }
  }

  dispose() {
    this.isDisposed = true;
    this.audioProcessor.dispose();
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.candidateQueue = [];
    this.remoteStream = new MediaStream();
  }
}
