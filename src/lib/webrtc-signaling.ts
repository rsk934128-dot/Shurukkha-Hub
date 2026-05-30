
'use client';

/**
 * @fileOverview Overhauled WebRTC Signaling Service for Shurukkha Hub.
 * Optimized Phase 32.2: Locked-Identity Stream Protocol and Studio-Grade AV Sync.
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

    // Phase 31.5: Optimize local stream before sending
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
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'caller' }).catch(() => {});
      }
    };

    const offerDescription = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await setDoc(sessionRef, { offer }, { merge: true });

    const unsubSession = onSnapshot(sessionRef, async (snapshot) => {
      if (this.isDisposed || !this.peerConnection) return;
      const data = snapshot.data();
      
      if (data?.answer && this.peerConnection.signalingState === 'have-local-offer') {
        this.isProcessingRemoteDescription = true;
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          await this.flushCandidates();
        } catch (e) {
          console.error("[WebRTC] Answer processing fault.");
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
            this.addCandidate(data as RTCIceCandidateInit);
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

    // Phase 31.5: Optimize local stream
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
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'recipient' }).catch(() => {});
      }
    };

    const sessionSnapshot = await getDoc(sessionRef);
    const sessionData = sessionSnapshot.data();
    
    if (sessionData?.offer) {
      try {
        this.isProcessingRemoteDescription = true;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));
        const answerDescription = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answerDescription);

        await updateDoc(sessionRef, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } });
        this.isProcessingRemoteDescription = false;
        await this.flushCandidates();
      } catch (e) {
        this.isProcessingRemoteDescription = false;
      }
    }

    const unsubCandidates = onSnapshot(candidatesCollection, (snapshot) => {
      if (this.isDisposed) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.owner !== 'recipient') {
            this.addCandidate(data as RTCIceCandidateInit);
          }
        }
      });
    });

    return () => unsubCandidates();
  }

  private async addCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection || this.isDisposed) return;
    if (this.peerConnection.remoteDescription && !this.isProcessingRemoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {}
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
        } catch (e) {}
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
