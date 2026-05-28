'use client';

/**
 * @fileOverview WebRTC Signaling Service for Shurukkha Hub.
 * Manages the exchange of offers, answers, and ICE candidates via Firestore.
 * Updated Phase 3.4: Implements Signaling State Guards to prevent "wrong state: stable" errors.
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
    if (this.peerConnection?.remoteDescription) {
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
    if (!this.peerConnection?.remoteDescription) return;
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
    
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

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

    // Listen for Answer with State Guard
    onSnapshot(sessionRef, async (snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection) return;

      // EXCEPTION GUARD: Only set remote answer if we are currently in 'have-local-offer' state
      // This prevents the "Called in wrong state: stable" error
      if (data?.answer && this.peerConnection.signalingState === 'have-local-offer') {
        const answerDescription = new RTCSessionDescription(data.answer);
        await this.peerConnection.setRemoteDescription(answerDescription);
        await this.flushCandidates();
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

    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

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
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(sessionRef, { answer });
      await this.flushCandidates();
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
  }
}