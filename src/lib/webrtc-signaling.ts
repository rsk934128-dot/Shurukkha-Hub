'use client';

/**
 * @fileOverview WebRTC Signaling Service for Shurukkha Hub.
 * Manages the exchange of offers, answers, and ICE candidates via Firestore.
 * Updated Phase 3.6: Ensures bi-directional track propagation and reliable stream syncing.
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
  DocumentData
} from 'firebase/firestore';

export class WebRTCManager {
  private sessionId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private candidateQueue: RTCIceCandidateInit[] = [];
  private isProcessingRemoteDescription = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // Configuration for ICE Servers
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  /**
   * Buffers candidates until remote description is available.
   */
  private async addCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[WebRTC] Error adding candidate", e);
      }
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  /**
   * Processes all buffered candidates once connection is ready.
   */
  private async flushCandidates() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[WebRTC] Error flushing candidate", e);
        }
      }
    }
  }

  /**
   * Initialize a new call (Offer side)
   */
  async createCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    // SETUP: Set ontrack before adding local tracks to catch events early
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Remote track received on Offer side");
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    // Collect ICE Candidates and tag as 'caller'
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'caller' });
      }
    };

    // Create Offer
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(sessionRef, { offer }, { merge: true });

    // Listen for Answer with Mutex Guard
    onSnapshot(sessionRef, async (snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection || this.isProcessingRemoteDescription) return;

      // EXCEPTION GUARD: Only set remote answer if we are currently in 'have-local-offer' state
      if (data?.answer && this.peerConnection.signalingState === 'have-local-offer') {
        this.isProcessingRemoteDescription = true;
        try {
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
          console.log("[WebRTC] Remote description set on Offer side (Answer received)");
          await this.flushCandidates();
        } catch (e) {
          console.warn("[WebRTC] Failed to set remote answer", e);
        } finally {
          this.isProcessingRemoteDescription = false;
        }
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only add candidates sent by the recipient
          if (data.owner !== 'caller') {
            this.addCandidate(data as RTCIceCandidateInit);
          }
        }
      });
    });
  }

  /**
   * Join an existing call (Answer side)
   */
  async answerCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // SETUP: Set ontrack before adding local tracks
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Remote track received on Answer side");
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    // Collect ICE Candidates and tag as 'recipient'
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'recipient' });
      }
    };

    const sessionSnapshot = await getDoc(sessionRef);
    const sessionData = sessionSnapshot.data();
    
    if (sessionData?.offer && this.peerConnection.signalingState === 'stable') {
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));
        console.log("[WebRTC] Remote description set on Answer side (Offer received)");

        const answerDescription = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await updateDoc(sessionRef, { answer });
        await this.flushCandidates();
      } catch (e) {
        console.warn("[WebRTC] Failed to set remote offer or create answer", e);
      }
    }

    // Listen for remote ICE candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only add candidates sent by the caller
          if (data.owner !== 'recipient') {
            this.addCandidate(data as RTCIceCandidateInit);
          }
        }
      });
    });
  }

  dispose() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.candidateQueue = [];
    this.isProcessingRemoteDescription = false;
  }
}
